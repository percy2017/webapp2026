import {
    Bell,
    BellOff,
    Image as ImageIcon,
    Loader2,
    LogOut,
    MessageCircle,
    Mic,
    MicOff,
    Paperclip,
    Send,
    Square,
    Trash2,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { csrfJson } from '@/lib/csrf';
import { show as showRoute, send as sendRoute } from '@/routes/widget/chat';
import { logout as logoutRoute } from '@/routes/widget/auth';

const MAX_FILES = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB (matches backend rule)

type AudioState = {
    blob: Blob;
    url: string;
    durationMs: number;
    mimeType: string;
};

function pickRecorderMimeType(): string {
    if (typeof MediaRecorder === 'undefined') return '';
    const candidates = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/ogg',
        'audio/mp4',
    ];
    for (const mime of candidates) {
        if (MediaRecorder.isTypeSupported(mime)) return mime;
    }
    return '';
}

function formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function blobToFile(blob: Blob, filename: string): File {
    return new File([blob], filename, {
        type: blob.type || 'audio/webm',
        lastModified: Date.now(),
    });
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const NOTIFY_KEY = 'chat_widget_notify_enabled';

type NotifyPermission = NotificationPermission | 'unsupported';

function currentPermission(): NotifyPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return 'unsupported';
    }
    return Notification.permission;
}

function postToServiceWorker(payload: Record<string, unknown>) {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
        return;
    }
    navigator.serviceWorker.ready
        .then((reg) => reg.active?.postMessage({ type: 'chat:notify', payload }))
        .catch(() => {});
}

type Attachment = {
    id: number;
    name: string;
    file_name: string;
    mime_type: string;
    size: number;
    url: string;
};

type Message = {
    id: number;
    sender_type: string;
    sender_name: string | null;
    content: string | null;
    created_at: string | null;
    attachments: Attachment[];
};

type Props = {
    chatId: number | null;
    onClose: () => void;
};

function timeOf(iso: string | null | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);

    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function ChatPanel({ chatId, onClose }: Props) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [resolvedChatId, setResolvedChatId] = useState<number | null>(
        chatId,
    );
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [permission, setPermission] = useState<NotifyPermission>(
        currentPermission,
    );
    const [notifyEnabled, setNotifyEnabled] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return window.localStorage.getItem(NOTIFY_KEY) === '1';
    });
    const [bannerDismissed, setBannerDismissed] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return window.sessionStorage.getItem('chat_notify_banner_dismissed') === '1';
    });

    // Voice message recorder state
    const [recording, setRecording] = useState(false);
    const [recordError, setRecordError] = useState<string | null>(null);
    const [audioPreview, setAudioPreview] = useState<AudioState | null>(null);
    const [recordElapsed, setRecordElapsed] = useState(0);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const recorderStreamRef = useRef<MediaStream | null>(null);
    const recorderChunksRef = useRef<Blob[]>([]);
    const recorderStartRef = useRef<number>(0);
    const recorderTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fileRef = useRef<HTMLInputElement | null>(null);
    const endRef = useRef<HTMLDivElement | null>(null);

    function clearRecorderTimers() {
        if (recorderTimerRef.current) {
            clearInterval(recorderTimerRef.current);
            recorderTimerRef.current = null;
        }
    }

    function discardAudioPreview() {
        if (audioPreview) URL.revokeObjectURL(audioPreview.url);
        setAudioPreview(null);
    }

    useEffect(() => {
        return () => {
            // teardown on unmount
            clearRecorderTimers();
            if (
                recorderRef.current &&
                recorderRef.current.state !== 'inactive'
            ) {
                recorderRef.current.stop();
            }
            recorderStreamRef.current?.getTracks().forEach((t) => t.stop());
            if (audioPreview) URL.revokeObjectURL(audioPreview.url);
        };
        // we intentionally do not include `audioPreview` in deps — teardown
        // captures the latest value via closure when the component unmounts
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function startRecording() {
        if (
            typeof navigator === 'undefined' ||
            !navigator.mediaDevices?.getUserMedia
        ) {
            setRecordError('Tu navegador no soporta grabación de audio.');
            return;
        }
        if (typeof MediaRecorder === 'undefined') {
            setRecordError('Tu navegador no soporta grabación de audio.');
            return;
        }
        if (recording) return;

        setRecordError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            recorderStreamRef.current = stream;

            const mimeType = pickRecorderMimeType();
            const recorder = mimeType
                ? new MediaRecorder(stream, { mimeType })
                : new MediaRecorder(stream);
            recorderChunksRef.current = [];
            recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    recorderChunksRef.current.push(event.data);
                }
            };
            recorder.onstop = () => {
                const chunks = recorderChunksRef.current.slice();
                recorderChunksRef.current = [];
                const type =
                    recorder.mimeType ||
                    mimeType ||
                    'audio/webm';
                const blob = new Blob(chunks, { type });
                const url = URL.createObjectURL(blob);
                const durationMs =
                    Date.now() - recorderStartRef.current;
                setAudioPreview({ blob, url, durationMs, mimeType: type });
                recorderStreamRef.current?.getTracks().forEach((t) => t.stop());
                recorderStreamRef.current = null;
            };

            recorderRef.current = recorder;
            recorderStartRef.current = Date.now();
            recorder.start();
            setRecording(true);
            setRecordElapsed(0);
            clearRecorderTimers();
            recorderTimerRef.current = setInterval(() => {
                setRecordElapsed(Date.now() - recorderStartRef.current);
            }, 200);
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'No se pudo acceder al micrófono.';
            setRecordError(message);
            recorderStreamRef.current?.getTracks().forEach((t) => t.stop());
            recorderStreamRef.current = null;
        }
    }

    function stopRecording() {
        const recorder = recorderRef.current;
        if (!recorder || recorder.state === 'inactive') return;
        recorder.stop();
        clearRecorderTimers();
        setRecording(false);
        setRecordElapsed(Date.now() - recorderStartRef.current);
    }

    function cancelRecording() {
        const recorder = recorderRef.current;
        if (recorder && recorder.state !== 'inactive') {
            // discard the chunks so onstop doesn't keep the blob
            recorderChunksRef.current = [];
            recorder.onstop = () => {
                recorderStreamRef.current?.getTracks().forEach((t) => t.stop());
                recorderStreamRef.current = null;
            };
            recorder.stop();
        }
        clearRecorderTimers();
        setRecording(false);
        setRecordElapsed(0);
        setRecordError(null);
    }

    function confirmAudioPreview() {
        if (!audioPreview) return;
        const ext = (() => {
            if (audioPreview.mimeType.includes('ogg')) return 'ogg';
            if (audioPreview.mimeType.includes('mp4')) return 'm4a';
            return 'webm';
        })();
        const filename = `voice-message-${Date.now()}.${ext}`;
        const file = blobToFile(audioPreview.blob, filename);
        setPendingFiles((prev) => [...prev, file].slice(0, MAX_FILES));
        discardAudioPreview();
    }

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(NOTIFY_KEY, notifyEnabled ? '1' : '0');
    }, [notifyEnabled]);

    function addFiles(incoming: FileList | null) {
        if (!incoming) return;
        const remaining = MAX_FILES - pendingFiles.length;
        if (remaining <= 0) return;
        const accepted: File[] = [];
        for (const file of Array.from(incoming).slice(0, remaining)) {
            if (file.size > MAX_FILE_BYTES) continue;
            accepted.push(file);
        }
        if (accepted.length === 0) return;
        setPendingFiles((prev) => [...prev, ...accepted]);
    }

    function removeFile(index: number) {
        setPendingFiles((prev) => prev.filter((_, i) => i !== index));
        if (fileRef.current) fileRef.current.value = '';
    }

    async function enableNotifications() {
        if (permission === 'unsupported') return;
        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            if (result === 'granted') {
                setNotifyEnabled(true);
                postToServiceWorker({
                    title: 'Notificaciones activadas',
                    body: 'Te avisaremos cuando recibas un mensaje nuevo.',
                    tag: 'chat-welcome',
                    icon: '/pwa-icons/icon-192.png',
                });
            }
        } catch {
            // ignore
        }
    }

    function dismissBanner() {
        setBannerDismissed(true);
        if (typeof window !== 'undefined') {
            window.sessionStorage.setItem('chat_notify_banner_dismissed', '1');
        }
    }

    useEffect(() => {
        let active = true;

        async function load() {
            try {
                const response = await csrfJson(showRoute.url());

                if (!active || !response.ok) return;

                const data = await response.json();
                setResolvedChatId(data.chat?.id ?? null);
                setMessages(data.chat?.messages ?? []);
            } catch {
            } finally {
                if (active) setLoading(false);
            }
        }

        load();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!resolvedChatId) return;
        const echo = window.Echo;
        if (!echo) return;

        const channel = echo.private(`chat.${resolvedChatId}`);

        const handler = (incoming: Message) => {
            // Pusher delivers the broadcastWith() payload directly to the
            // listener — its top-level keys ARE the message fields. No
            // `.message` wrapper.
            if (!incoming || incoming.id == null) return;
            setMessages((prev) => {
                if (prev.some((m) => m.id === incoming.id)) return prev;
                return [...prev, incoming];
            });
        };

        channel.listen('.message.sent', handler);

        return () => {
            channel.stopListening('.message.sent', handler);
        };
    }, [resolvedChatId]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function send(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (sending) return;
        if (!text.trim() && pendingFiles.length === 0) return;

        setSending(true);

        try {
            const hasFiles = pendingFiles.length > 0;
            const formData = new FormData();
            if (text.trim()) formData.append('content', text);
            pendingFiles.forEach((file, i) => {
                formData.append(`attachments[${i}]`, file);
            });

            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');

            const response = await fetch(sendRoute.url(), {
                method: 'POST',
                body: formData,
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
            });

            if (response.ok) {
                const data = await response.json().catch(() => null);
                if (data?.message) {
                    setMessages((prev) => {
                        if (prev.some((m) => m.id === data.message.id)) {
                            return prev;
                        }
                        return [...prev, data.message];
                    });
                }
                setText('');
                setPendingFiles([]);
                if (fileRef.current) fileRef.current.value = '';
            }
            // we deliberately ignore the unused `hasFiles` to keep the
            // dependency tracking honest
            void hasFiles;
        } catch {
        } finally {
            setSending(false);
        }
    }

    async function logout() {
        try {
            await csrfJson(logoutRoute.url(), { method: 'POST' });
            window.location.reload();
        } catch {}
    }

    return (
        <div className="flex h-full flex-col">
            <div className="bg-primary text-primary-foreground flex items-center justify-between px-3 py-3">
                <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <p className="text-sm font-semibold">Chat en vivo</p>
                </div>
                <div className="flex items-center gap-1">
                    {permission !== 'unsupported' && (
                        <button
                            type="button"
                            onClick={
                                permission === 'granted'
                                    ? () => setNotifyEnabled((v) => !v)
                                    : enableNotifications
                            }
                            className="rounded p-1 opacity-90 hover:bg-white/20 hover:opacity-100"
                            title={
                                permission === 'granted'
                                    ? notifyEnabled
                                        ? 'Notificaciones activadas (click para silenciar)'
                                        : 'Notificaciones desactivadas (click para activar)'
                                    : 'Activar notificaciones del navegador'
                            }
                            aria-label="Alternar notificaciones del navegador"
                        >
                            {permission === 'granted' && notifyEnabled ? (
                                <Bell className="h-3.5 w-3.5" />
                            ) : (
                                <BellOff className="h-3.5 w-3.5" />
                            )}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded p-1 opacity-90 hover:bg-white/20 hover:opacity-100"
                        aria-label="Cerrar chat"
                        title="Cerrar chat"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={logout}
                        className="rounded p-1 opacity-80 hover:bg-white/20 hover:opacity-100"
                        aria-label="Cerrar sesión"
                        title="Cerrar sesión"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {permission !== 'unsupported' &&
                permission !== 'granted' &&
                !bannerDismissed && (
                    <div className="flex items-start gap-2 border-b border-amber-500/30 bg-amber-50 px-3 py-2 text-[11px] text-amber-900 dark:border-amber-400/30 dark:bg-amber-950/40 dark:text-amber-100">
                        <Bell className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <div className="flex-1">
                            <p className="font-medium">
                                Activá las notificaciones
                            </p>
                            <p className="opacity-80">
                                Te avisamos al instante aunque el chat esté
                                cerrado.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={enableNotifications}
                            className="rounded bg-amber-500 px-2 py-1 text-[10px] font-semibold text-white shadow hover:bg-amber-600"
                        >
                            Activar
                        </button>
                        <button
                            type="button"
                            onClick={dismissBanner}
                            className="rounded p-0.5 opacity-60 hover:opacity-100"
                            aria-label="Cerrar aviso"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                )}

            <div className="flex-1 overflow-y-auto bg-muted/30 px-3 py-2">
                {loading ? (
                    <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-center text-xs text-muted-foreground">
                        <p>
                            Escribí tu mensaje y te responderemos a la
                            brevedad.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {messages.map((m) => {
                            const mine = m.sender_type === 'visitor';

                            return (
                                <div
                                    key={m.id}
                                    className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-lg px-3 py-2 text-xs shadow-sm ${
                                            mine
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-card'
                                        }`}
                                    >
                                        {m.content && (
                                            <p className="whitespace-pre-wrap break-words">
                                                {m.content}
                                            </p>
                                        )}
                                        {m.attachments.length > 0 && (
                                            <div className="mt-1 space-y-1">
                                                {m.attachments.map((a) => {
                                                    const mime = a.mime_type;
                                                    if (
                                                        mime?.startsWith(
                                                            'image/',
                                                        )
                                                    ) {
                                                        return (
                                                            <a
                                                                key={a.id}
                                                                href={a.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="block"
                                                                title={a.file_name}
                                                            >
                                                                <img
                                                                    src={a.url}
                                                                    alt={a.file_name}
                                                                    className="max-h-48 max-w-full rounded border object-contain"
                                                                    style={{
                                                                        borderColor:
                                                                            mine
                                                                                ? 'rgba(255,255,255,0.30)'
                                                                                : undefined,
                                                                    }}
                                                                />
                                                            </a>
                                                        );
                                                    }
                                                    if (
                                                        mime?.startsWith(
                                                            'video/',
                                                        )
                                                    ) {
                                                        return (
                                                            <video
                                                                key={a.id}
                                                                src={a.url}
                                                                controls
                                                                preload="metadata"
                                                                playsInline
                                                                className="max-h-56 max-w-full rounded border"
                                                                style={{
                                                                    borderColor:
                                                                        mine
                                                                            ? 'rgba(255,255,255,0.30)'
                                                                            : undefined,
                                                                }}
                                                            />
                                                        );
                                                    }
                                                    if (
                                                        mime?.startsWith(
                                                            'audio/',
                                                        )
                                                    ) {
                                                        return (
                                                            <div
                                                                key={a.id}
                                                                className={`flex items-center gap-1.5 rounded border px-1.5 py-1 ${
                                                                    mine
                                                                        ? 'border-white/30'
                                                                        : 'border-border'
                                                                }`}
                                                            >
                                                                <audio
                                                                    src={a.url}
                                                                    controls
                                                                    preload="metadata"
                                                                    className="h-8 max-w-full"
                                                                    style={{
                                                                        filter: mine
                                                                            ? 'invert(1)'
                                                                            : undefined,
                                                                    }}
                                                                />
                                                            </div>
                                                        );
                                                    }
                                                    return (
                                                        <a
                                                            key={a.id}
                                                            href={a.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className={`flex items-center gap-1 rounded border px-2 py-1 text-[10px] ${
                                                                mine
                                                                    ? 'border-white/30'
                                                                    : 'border-border'
                                                            }`}
                                                        >
                                                            <Paperclip className="h-3 w-3" />
                                                            {a.file_name}
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        <p
                                            className={`mt-0.5 text-[9px] ${
                                                mine
                                                    ? 'opacity-70'
                                                    : 'text-muted-foreground'
                                            }`}
                                        >
                                            {timeOf(m.created_at)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={endRef} />
                    </div>
                )}
            </div>

            <form
                onSubmit={send}
                className="space-y-2 border-t bg-background p-2"
            >
                {pendingFiles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {pendingFiles.map((file, idx) => (
                            <div
                                key={`${file.name}-${idx}`}
                                className="flex items-center gap-1.5 rounded-md border bg-muted/40 py-0.5 pl-1.5 pr-1 text-[10px]"
                            >
                                <ImageIcon className="h-3 w-3 shrink-0 text-muted-foreground" />
                                <span className="max-w-[140px] truncate font-medium">
                                    {file.name}
                                </span>
                                <span className="text-muted-foreground">
                                    {formatBytes(file.size)}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeFile(idx)}
                                    className="ml-1 rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                    aria-label={`Quitar ${file.name}`}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {recordError && (
                    <div className="flex items-start gap-1.5 rounded border border-destructive/30 bg-destructive/10 px-2 py-1 text-[10px] text-destructive">
                        <MicOff className="mt-0.5 h-3 w-3 shrink-0" />
                        <span className="flex-1">{recordError}</span>
                        <button
                            type="button"
                            onClick={() => setRecordError(null)}
                            className="rounded p-0.5 hover:bg-destructive/20"
                            aria-label="Cerrar error"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                )}

                {recording && (
                    <div className="flex items-center gap-2 rounded-md border border-red-500/40 bg-red-50 px-2 py-1.5 dark:bg-red-950/40">
                        <span className="relative flex h-2.5 w-2.5 shrink-0">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                        </span>
                        <span className="flex-1 text-[11px] font-medium text-red-700 dark:text-red-300">
                            Grabando… {formatDuration(recordElapsed)}
                        </span>
                        <button
                            type="button"
                            onClick={stopRecording}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                            aria-label="Detener grabación"
                            title="Detener"
                        >
                            <Square className="h-3 w-3" fill="currentColor" />
                        </button>
                        <button
                            type="button"
                            onClick={cancelRecording}
                            className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            aria-label="Cancelar grabación"
                            title="Cancelar"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}

                {audioPreview && !recording && (
                    <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-2 py-1.5">
                        <Mic className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <audio
                            src={audioPreview.url}
                            controls
                            preload="metadata"
                            className="h-8 max-h-8 flex-1"
                        />
                        <span className="text-[10px] tabular-nums text-muted-foreground">
                            {formatDuration(audioPreview.durationMs)}
                        </span>
                        <button
                            type="button"
                            onClick={confirmAudioPreview}
                            disabled={pendingFiles.length >= MAX_FILES}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Adjuntar audio"
                            title="Adjuntar audio al mensaje"
                        >
                            <Send className="h-3 w-3" />
                        </button>
                        <button
                            type="button"
                            onClick={discardAudioPreview}
                            className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            aria-label="Descartar audio"
                            title="Descartar"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}

                <div className="flex items-center gap-1">
                    <input
                        ref={fileRef}
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.txt,audio/*"
                        onChange={(e) => addFiles(e.target.files)}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={
                            sending ||
                            pendingFiles.length >= MAX_FILES ||
                            recording ||
                            audioPreview !== null
                        }
                        className="rounded p-2 text-muted-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Adjuntar archivo"
                        title={
                            pendingFiles.length >= MAX_FILES
                                ? `Máximo ${MAX_FILES} archivos`
                                : 'Adjuntar archivo'
                        }
                    >
                        <Paperclip className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={recording ? stopRecording : startRecording}
                        disabled={sending || audioPreview !== null}
                        className={`rounded p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                            recording
                                ? 'text-red-500 hover:bg-red-500/10'
                                : 'text-muted-foreground hover:bg-accent'
                        }`}
                        aria-label={
                            recording ? 'Detener grabación' : 'Grabar audio'
                        }
                        title={recording ? 'Detener' : 'Grabar audio'}
                    >
                        {recording ? (
                            <Square className="h-4 w-4" fill="currentColor" />
                        ) : (
                            <Mic className="h-4 w-4" />
                        )}
                    </button>
                    <Input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="h-9 text-sm"
                        disabled={sending || recording || audioPreview !== null}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="h-9 w-9"
                        disabled={
                            sending ||
                            (!text.trim() && pendingFiles.length === 0)
                        }
                    >
                        {sending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}