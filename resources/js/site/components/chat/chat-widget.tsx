import { usePage } from '@inertiajs/react';
import { Bell, BellOff, MessageCircle, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { playChatBell, unlockChatBell } from '@/lib/chat-bell';
import { ChatAuthPanel } from '@site/components/chat/chat-auth-panel';
import { ChatPanel } from '@site/components/chat/chat-panel';
import type { ChatWidgetSetting } from '@site/lib/types';

type Props = {
    settings: ChatWidgetSetting;
};

// Anchors for the BUBBLE BUTTON when the chat is closed. The user picks
// the corner in /admin/chat-live/configuration — we honor it on both
// mobile and desktop. On mobile we just bring the offset in a touch so
// the FAB doesn't sit flush against the screen edge; the inline
// safe-area paddings handle notched devices.
const BUBBLE_CORNER_CLASSES: Record<ChatWidgetSetting['position'], string> = {
    'bottom-right': 'bottom-4 right-4 sm:bottom-20 sm:right-4',
    'bottom-left': 'bottom-4 left-4 sm:bottom-20 sm:left-4',
    'top-right': 'top-4 right-4 sm:top-20 sm:right-4',
    'top-left': 'top-4 left-4 sm:top-20 sm:left-4',
};

// Anchors for the PANEL when the chat is open. On mobile we let it take
// the whole screen (inset-2 keeps a thin margin + safe-areas); on
// desktop we keep the original floating-window look so the panel sits
// in the same corner as the bubble.
const PANEL_CORNER_CLASSES: Record<ChatWidgetSetting['position'], string> = {
    'bottom-right': 'inset-2 sm:inset-auto sm:bottom-20 sm:right-4',
    'bottom-left': 'inset-2 sm:inset-auto sm:bottom-20 sm:left-4',
    'top-right': 'inset-2 sm:inset-auto sm:top-20 sm:right-4',
    'top-left': 'inset-2 sm:inset-auto sm:top-20 sm:left-4',
};

const STORAGE_KEY = 'chat_widget_open';
const NOTIFY_KEY = 'chat_widget_notify_enabled';

type NotifyPermission = NotificationPermission | 'unsupported';

function currentNotifyPermission(): NotifyPermission {
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
        .then((reg) => {
            reg.active?.postMessage({
                type: 'chat:notify',
                payload,
            });
        })
        .catch(() => {
            // SW not registered — fall back to an in-page notification
            if (
                'Notification' in window &&
                Notification.permission === 'granted'
            ) {
                new Notification(String(payload.title ?? 'Nuevo mensaje'), {
                    body: String(payload.body ?? ''),
                    icon: String(payload.icon ?? '/pwa-icons/icon-192.png'),
                    tag: String(payload.tag ?? 'chat-message'),
                });
            }
        });
}

function notifyIncomingMessage(event: {
    content?: string | null;
    sender_name?: string | null;
    attachments?: unknown[];
    chat_id?: number;
}) {
    const hasAttachment =
        Array.isArray(event.attachments) && event.attachments.length > 0;
    const body =
        event.content?.trim() ||
        (hasAttachment ? '📎 Archivo adjunto' : 'Tenés un mensaje nuevo');

    postToServiceWorker({
        title: event.sender_name
            ? `Mensaje de ${event.sender_name}`
            : 'Nuevo mensaje',
        body,
        tag: `chat-${event.chat_id ?? 'global'}`,
        url:
            window.location.pathname +
            window.location.search +
            window.location.hash,
        icon: '/pwa-icons/icon-192.png',
    });
}

export function ChatWidget({ settings }: Props) {
    const { props } = usePage<{
        auth?: { user?: { id: number } | null };
        chatWidget?: { enabled: boolean };
    }>();

    const enabled = props.chatWidget?.enabled ?? settings.enabled;
    const isAuthed = Boolean(props.auth?.user);

    const [open, setOpen] = useState<boolean>(() => {
        if (typeof window === 'undefined') {
            return false;
        }

        return window.sessionStorage.getItem(STORAGE_KEY) === '1';
    });
    const [unread, setUnread] = useState(0);
    const [permission, setPermission] = useState<NotifyPermission>(
        currentNotifyPermission,
    );
    // mirrors the user's opt-in for desktop notifications
    const [notifyEnabled, setNotifyEnabled] = useState<boolean>(() => {
        if (typeof window === 'undefined') {
            return false;
        }

        return window.localStorage.getItem(NOTIFY_KEY) === '1';
    });
    // tracks the latest incoming payload so we can show it in a toast /
    // open-panel UI even if permission was denied
    const lastEventRef = useRef<{
        content?: string | null;
        sender_name?: string | null;
    } | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        window.sessionStorage.setItem(STORAGE_KEY, open ? '1' : '0');

        if (open) {
            setUnread(0);
        }
    }, [open]);

    // El bell necesita un user gesture previo (autoplay policy). Apenas
    // el componente monta armamos el listener que lo desbloquea en el
    // primer click/keydown del documento. Si el visitante ya interactuó
    // antes (raro en la primera carga), el handler hace no-op.
    useEffect(() => {
        unlockChatBell();
    }, []);

    async function requestNotifyPermission() {
        if (permission === 'unsupported') {
            return;
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                setNotifyEnabled(true);
                // Confirmation toast
                postToServiceWorker({
                    title: 'Notificaciones activadas',
                    body: 'Te avisaremos cuando llegue un mensaje nuevo.',
                    tag: 'chat-welcome',
                });
            }
        } catch {
            // ignore
        }
    }

    useEffect(() => {
        const echo = (window as any).Echo;

        if (!echo || !isAuthed) {
            return;
        }

        function resolveChatIdAndSubscribe(): (() => void) | null {
            return fetch('/widget/chat', {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            })
                .then((r) => (r.ok ? r.json() : null))
                .then((data) => {
                    const chatId = data?.chat?.id;

                    if (!chatId) {
                        return null;
                    }

                    const channel = echo.private(`chat.${chatId}`);
                    const handler = (event: {
                        sender_type?: string;
                        sender_name?: string | null;
                        content?: string | null;
                        attachments?: unknown[];
                    }) => {
                        // Pusher delivers the broadcastWith() payload at the
                        // top level — read sender_type directly off the event.
                        if (event?.sender_type === 'visitor') {
                            return;
                        }

                        lastEventRef.current = {
                            content: event?.content ?? null,
                            sender_name: event?.sender_name ?? null,
                        };
                        setUnread((n) => n + 1);

                        // Bell de notificación — llega un mensaje del admin
                        // (o de cualquier persona que NO sea el visitor
                        // autenticado). Lo reproducimos aunque el panel esté
                        // abierto: si el usuario está mirando la página pero
                        // tiene otro tab mental, el sonido lo alerta. Si el
                        // tab está oculto el navegador puede bloquear el
                        // play() — eso es preferible a un ping inoportuno.
                        void playChatBell();

                        // Only push an OS notification when the panel is
                        // closed AND the visitor opted in. If the panel is
                        // already open the in-page UI is the source of truth.
                        if (
                            !openRef.current &&
                            notifyEnabledRef.current &&
                            permission === 'granted'
                        ) {
                            notifyIncomingMessage({
                                content: event?.content ?? null,
                                sender_name: event?.sender_name ?? null,
                                attachments: event?.attachments ?? [],
                                chat_id: chatId,
                            });
                        }
                    };
                    channel.listen('.message.sent', handler);

                    return () => {
                        channel.stopListening('.message.sent', handler);
                    };
                })
                .catch(() => null);
        }

        let cleanup: (() => void) | null = null;
        resolveChatIdAndSubscribe().then((c) => {
            cleanup = c;
        });

        return () => {
            if (cleanup) {
                cleanup();
            }
        };
    }, [isAuthed, permission]);

    // Mirror state into refs so the Echo handler (registered once) reads
    // fresh values without re-subscribing.
    const openRef = useRef(open);
    const notifyEnabledRef = useRef(notifyEnabled);
    useEffect(() => {
        openRef.current = open;
    }, [open]);
    useEffect(() => {
        notifyEnabledRef.current = notifyEnabled;
    }, [notifyEnabled]);

    if (!enabled) {
        return null;
    }

    const bubblePosition =
        BUBBLE_CORNER_CLASSES[settings.position] ??
        BUBBLE_CORNER_CLASSES['bottom-right'];
    const panelPosition =
        PANEL_CORNER_CLASSES[settings.position] ??
        PANEL_CORNER_CLASSES['bottom-right'];

    const canNotify =
        permission === 'granted' ||
        (permission === 'default' && notifyEnabled === false);
    const showNotifyToggle = permission !== 'unsupported';

    const safeAreaStyle = {
        fontFamily: 'inherit',
        // `dvh` keeps the panel honest on mobile browsers whose UI chrome
        // (URL bar) collapses while scrolling. `svh` is the always-stable
        // fallback for those same browsers.
        paddingTop: 'env(safe-area-inset-top)',
        paddingRight: 'env(safe-area-inset-right)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
    } as const;

    return (
        <div
            className={`fixed z-50 ${open ? panelPosition : bubblePosition}`}
            style={safeAreaStyle}
        >
            {open ? (
                <div className="flex h-[100dvh] w-[100dvw] flex-col overflow-hidden rounded-none border bg-background shadow-2xl sm:h-[560px] sm:w-[380px] sm:rounded-2xl">
                    {isAuthed ? (
                        <ChatPanel
                            chatId={null}
                            onClose={() => setOpen(false)}
                        />
                    ) : (
                        <ChatAuthPanel
                            onAuthed={() => setOpen(false)}
                            onClose={() => setOpen(false)}
                        />
                    )}
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="absolute top-2 right-2 z-10 rounded-full bg-black/30 p-1 text-white hover:bg-black/50"
                        aria-label="Cerrar chat"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <>
                    {showNotifyToggle &&
                        (permission === 'granted' ? (
                            <button
                                type="button"
                                onClick={() => setNotifyEnabled((v) => !v)}
                                className="absolute -top-2 -left-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background text-foreground shadow ring-1 ring-border hover:bg-accent"
                                title={
                                    notifyEnabled
                                        ? 'Notificaciones del navegador activadas'
                                        : 'Notificaciones del navegador desactivadas'
                                }
                                aria-label="Alternar notificaciones del navegador"
                            >
                                {notifyEnabled ? (
                                    <Bell className="h-3.5 w-3.5" />
                                ) : (
                                    <BellOff className="h-3.5 w-3.5 text-muted-foreground" />
                                )}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={requestNotifyPermission}
                                className="absolute -top-2 -left-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background text-muted-foreground shadow ring-1 ring-border hover:bg-accent hover:text-foreground"
                                title="Activar notificaciones del navegador"
                                aria-label="Activar notificaciones del navegador"
                            >
                                <BellOff className="h-3.5 w-3.5" />
                            </button>
                        ))}
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
                        aria-label="Abrir chat"
                    >
                        <MessageCircle className="h-6 w-6" />
                        {unread > 0 && (
                            <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-semibold text-destructive-foreground ring-2 ring-background">
                                {unread > 99 ? '99+' : unread}
                            </span>
                        )}
                    </button>
                </>
            )}
        </div>
    );
}
