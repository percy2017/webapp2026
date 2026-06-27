import { Loader2, LogOut, MessageCircle, Paperclip, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { csrfJson } from '@/lib/csrf';
import { show as showRoute, send as sendRoute } from '@/routes/widget/chat';
import { logout as logoutRoute } from '@/routes/widget/auth';

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
    const fileRef = useRef<HTMLInputElement | null>(null);
    const endRef = useRef<HTMLDivElement | null>(null);

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

        const handler = (event: { message?: Message }) => {
            const incoming = event?.message;
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
        if (!text.trim() || sending) return;

        setSending(true);

        try {
            const response = await csrfJson(sendRoute.url(), {
                method: 'POST',
                body: { content: text },
            });

            if (response.ok) {
                const data = await response.json();
                if (data?.message) {
                    setMessages((prev) => [...prev, data.message]);
                }
                setText('');
            }
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
                <div className="flex flex-col items-center gap-1">
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
                                                {m.attachments.map((a) => (
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
                                                ))}
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
                className="flex items-center gap-1 border-t bg-background p-2"
            >
                <input
                    ref={fileRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="rounded p-2 text-muted-foreground hover:bg-accent"
                    aria-label="Adjuntar archivo"
                    title="Adjuntar archivo"
                >
                    <Paperclip className="h-4 w-4" />
                </button>
                <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="h-9 text-sm"
                    disabled={sending}
                />
                <Button
                    type="submit"
                    size="icon"
                    className="h-9 w-9"
                    disabled={sending || !text.trim()}
                >
                    {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="h-4 w-4" />
                    )}
                </Button>
            </form>
        </div>
    );
}