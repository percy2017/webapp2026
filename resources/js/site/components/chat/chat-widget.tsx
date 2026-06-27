import { usePage } from '@inertiajs/react';
import { MessageCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ChatAuthPanel } from '@site/components/chat/chat-auth-panel';
import { ChatPanel } from '@site/components/chat/chat-panel';
import type { ChatWidgetSetting } from '@site/lib/types';

type Props = {
    settings: ChatWidgetSetting;
};

const POSITION_CLASSES: Record<ChatWidgetSetting['position'], string> = {
    'bottom-right': 'bottom-20 right-4',
    'bottom-left': 'bottom-20 left-4',
    'top-right': 'top-20 right-4',
    'top-left': 'top-20 left-4',
};

const STORAGE_KEY = 'chat_widget_open';

export function ChatWidget({ settings }: Props) {
    const { props } = usePage<{
        auth?: { user?: { id: number } | null };
        chatWidget?: { enabled: boolean };
    }>();

    const enabled = props.chatWidget?.enabled ?? settings.enabled;
    const isAuthed = Boolean(props.auth?.user);

    const [open, setOpen] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return window.sessionStorage.getItem(STORAGE_KEY) === '1';
    });
    const [unread, setUnread] = useState(0);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.sessionStorage.setItem(STORAGE_KEY, open ? '1' : '0');
        if (open) setUnread(0);
    }, [open]);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape' && open) setOpen(false);
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    useEffect(() => {
        const echo = (window as any).Echo;
        if (!echo || !isAuthed) return;

        function resolveChatIdAndSubscribe(): (() => void) | null {
            return fetch('/widget/chat', {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
            })
                .then((r) => (r.ok ? r.json() : null))
                .then((data) => {
                    const chatId = data?.chat?.id;
                    if (!chatId) return null;
                    const channel = echo.private(`chat.${chatId}`);
                    const handler = (event: any) => {
                        const mine = event?.message?.sender_type === 'visitor';
                        if (mine) return;
                        setUnread((n) => n + 1);
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
            if (cleanup) cleanup();
        };
    }, [isAuthed]);

    if (!enabled) return null;

    const position =
        POSITION_CLASSES[settings.position] ??
        POSITION_CLASSES['bottom-right'];

    return (
        <div
            className={`fixed z-50 ${position}`}
            style={{ fontFamily: 'inherit' }}
        >
            {open ? (
                <div className="flex h-[520px] w-[360px] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl">
                    {isAuthed ? (
                        <ChatPanel
                            chatId={null}
                            onClose={() => setOpen(false)}
                        />
                    ) : (
                        <ChatAuthPanel onAuthed={() => setOpen(false)} />
                    )}
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="absolute right-2 top-2 rounded-full bg-black/30 p-1 text-white hover:bg-black/50"
                        aria-label="Cerrar chat"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="bg-primary text-primary-foreground relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
                    aria-label="Abrir chat"
                >
                    <MessageCircle className="h-6 w-6" />
                    {unread > 0 && (
                        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-semibold text-destructive-foreground ring-2 ring-background">
                            {unread > 99 ? '99+' : unread}
                        </span>
                    )}
                </button>
            )}
        </div>
    );
}