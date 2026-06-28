import { Link, usePage } from '@inertiajs/react';
import { Bell, BellOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { index as chatsIndex } from '@/routes/chat-live/chats';
import type { BreadcrumbItem } from '@/types';

const NOTIFY_KEY = 'admin_chat_notify_enabled';
const SW_ICON = '/pwa-icons/icon-192.png';

// Read the public VAPID key (baked into the bundle at build time from
// VITE_VAPID_PUBLIC_KEY in .env). Defined on import.meta.env by Vite.
const VAPID_PUBLIC_KEY =
    (import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined) ?? '';

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
            reg.active?.postMessage({ type: 'chat:notify', payload });
        })
        .catch(() => {
            if (
                'Notification' in window &&
                Notification.permission === 'granted'
            ) {
                new Notification(String(payload.title ?? 'Nuevo chat'), {
                    body: String(payload.body ?? ''),
                    icon: String(payload.icon ?? SW_ICON),
                    tag: String(payload.tag ?? 'admin-chat'),
                });
            }
        });
}

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const { props } = usePage<{
        auth?: { user?: { id: number; name: string } | null };
    }>();
    const isAuthed = Boolean(props.auth?.user);
    const [permission, setPermission] = useState<NotifyPermission>(
        currentNotifyPermission,
    );
    const [enabled, setEnabled] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return window.localStorage.getItem(NOTIFY_KEY) === '1';
    });
    const enabledRef = useRef(enabled);
    const permissionRef = useRef(permission);
    useEffect(() => {
        enabledRef.current = enabled;
    }, [enabled]);
    useEffect(() => {
        permissionRef.current = permission;
    }, [permission]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(NOTIFY_KEY, enabled ? '1' : '0');
    }, [enabled]);

    async function requestPermission() {
        if (permission === 'unsupported') return;
        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            if (result === 'granted') {
                setEnabled(true);
                // Subscribe for Web Push so we get notifications even when
                // the PWA is closed. pushManager is only available in a
                // secure context with an active service worker.
                await ensurePushSubscription();
            }
        } catch {
            // ignore
        }
    }

    async function ensurePushSubscription() {
        if (
            typeof navigator === 'undefined' ||
            !('serviceWorker' in navigator) ||
            !('PushManager' in window) ||
            !VAPID_PUBLIC_KEY
        ) {
            return;
        }
        try {
            const reg = await navigator.serviceWorker.ready;
            let subscription = await reg.pushManager.getSubscription();
            if (!subscription) {
                subscription = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
                });
            }
            await persistSubscription(subscription);
        } catch (err) {
            // Push is best-effort; if the browser rejects we just keep
            // the in-app + postMessage notifications.
            // eslint-disable-next-line no-console
            console.warn('[PWA] push subscription failed:', err);
        }
    }

    async function persistSubscription(subscription: PushSubscription) {
        const payload = subscription.toJSON() as {
            endpoint: string;
            keys?: { p256dh?: string; auth?: string };
        };
        if (!payload.endpoint || !payload.keys?.p256dh || !payload.keys?.auth) {
            return;
        }
        const csrf = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content');

        await fetch('/admin/push-subscriptions', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}),
            },
            body: JSON.stringify({
                endpoint: payload.endpoint,
                keys: {
                    p256dh: payload.keys.p256dh,
                    auth: payload.keys.auth,
                },
                content_encoding:
                    (subscription as unknown as { options?: { applicationServerKey?: ArrayBuffer } })
                        ?.options?.applicationServerKey
                        ? 'aesgcm'
                        : 'aes128gcm',
            }),
        });
    }

    const [unseen, setUnseen] = useState(0);

    const isChatLivePath =
        typeof window !== 'undefined' &&
        window.location.pathname.startsWith('/admin/chat-live');
    useEffect(() => {
        if (!isChatLivePath) return;
        setUnseen(0);
    }, [isChatLivePath]);

    // Tab-title badge so the admin can see unseen chats even when they're
    // on another tab or app section.
    useEffect(() => {
        if (typeof document === 'undefined') return;
        const stripped = document.title.replace(/^\(\d+\)\s*/, '');
        const original = stripped === '' ? 'WebApp' : stripped;
        document.title = unseen > 0 ? `(${unseen}) ${original}` : original;
        return () => {
            document.title = original;
        };
    }, [unseen]);

    useEffect(() => {
        const echo = (window as any).Echo;
        if (!echo || !isAuthed) return;

        const onCreated = (event: {
            id?: number;
            user?: { name?: string; email?: string } | null;
            preview?: string;
        }) => {
            setUnseen((n) => n + 1);
            if (enabledRef.current && permissionRef.current === 'granted') {
                const name = event?.user?.name ?? 'un visitante';
                postToServiceWorker({
                    title: `Nuevo chat de ${name}`,
                    body: event?.preview ?? 'Te escribió un mensaje nuevo.',
                    tag: `admin-chat-${event?.id ?? 'new'}`,
                    url: event?.id
                        ? `/admin/chat-live/chats/${event.id}`
                        : chatsIndex(),
                    icon: SW_ICON,
                });
            }
        };

        // Persistent listener — survives Inertia page navigations because
        // Echo holds the channel subscription internally.
        const channel = echo.channel('admin.chats');
        channel.listen('.chat.created', onCreated);

        return () => {
            channel.stopListening('.chat.created', onCreated);
        };
    }, [isAuthed]);

    const showToggle = isAuthed && permission !== 'unsupported';

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            {children}

            {showToggle && (
                <div className="fixed right-4 top-3 z-40 flex items-center gap-2">
                    {unseen > 0 && (
                        <Link
                            href={chatsIndex()}
                            className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-accent"
                            title="Ver chats nuevos"
                        >
                            <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                                {unseen > 99 ? '99+' : unseen}
                            </span>
                            <span className="hidden sm:inline">
                                {unseen === 1
                                    ? 'chat nuevo'
                                    : 'chats nuevos'}
                            </span>
                        </Link>
                    )}
                    <button
                        type="button"
                        onClick={
                            permission === 'granted'
                                ? () => setEnabled((v) => !v)
                                : requestPermission
                        }
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground"
                        title={
                            permission === 'granted'
                                ? enabled
                                    ? 'Notificaciones activadas'
                                    : 'Notificaciones desactivadas'
                                : 'Activar notificaciones del navegador'
                        }
                        aria-label="Alternar notificaciones del navegador"
                    >
                        {permission === 'granted' && enabled ? (
                            <Bell className="h-4 w-4" />
                        ) : (
                            <BellOff className="h-4 w-4" />
                        )}
                    </button>
                </div>
            )}
        </AppLayoutTemplate>
    );
}

/**
 * Web Push requires the VAPID public key as a `Uint8Array` of raw bytes.
 * Browsers refuse the base64url string directly, so we decode it here.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = atob(base64);
    const output = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
        output[i] = rawData.charCodeAt(i);
    }
    return output;
}
