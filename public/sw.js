/* WebApp service worker — cache-first for static assets, network-first
 * for navigations so admin/template updates propagate immediately.
 *
 * Bumping the cache version invalidates everything on next page load.
 */
const VERSION = 'v1.2.0';
const STATIC_CACHE = `webapp-static-${VERSION}`;
const RUNTIME_CACHE = `webapp-runtime-${VERSION}`;

const PRECACHE_URLS = [
    '/',
    '/favicon.svg',
    '/favicon.ico',
    '/apple-touch-icon.png',
    '/manifest.webmanifest',
    '/pwa-icons/icon-192.png',
    '/pwa-icons/icon-512.png',
    '/pwa-icons/icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(STATIC_CACHE)
            .then((cache) =>
                Promise.allSettled(
                    PRECACHE_URLS.map((url) =>
                        fetch(url, { credentials: 'same-origin' })
                            .then((res) =>
                                res.ok ? cache.put(url, res) : null,
                            )
                            .catch(() => null),
                    ),
                ),
            )
            .then(() => self.skipWaiting()),
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            await Promise.all(
                keys
                    .filter(
                        (k) =>
                            k !== STATIC_CACHE && k !== RUNTIME_CACHE,
                    )
                    .map((k) => caches.delete(k)),
            );
            await self.clients.claim();
        })(),
    );
});

function isNavigationRequest(request) {
    return (
        request.mode === 'navigate' ||
        (request.method === 'GET' &&
            request.headers.get('accept')?.includes('text/html'))
    );
}

function isAssetRequest(url) {
    return (
        url.pathname.startsWith('/build/') ||
        url.pathname.startsWith('/storage/') ||
        url.pathname.startsWith('/pwa-icons/') ||
        url.pathname === '/favicon.svg' ||
        url.pathname === '/favicon.ico' ||
        url.pathname === '/apple-touch-icon.png' ||
        url.pathname === '/manifest.webmanifest'
    );
}

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    // Network-first for HTML navigations and admin
    if (isNavigationRequest(request) || url.pathname.startsWith('/admin')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response.ok) {
                        const copy = response.clone();
                        caches.open(RUNTIME_CACHE).then((cache) =>
                            cache.put(request, copy),
                        );
                    }

                    return response;
                })
                .catch(() =>
                    caches
                        .match(request)
                        .then(
                            (cached) =>
                                cached ??
                                caches.match('/'),
                        ),
                ),
        );

        return;
    }

    // Cache-first for static assets
    if (isAssetRequest(url)) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;

                return fetch(request).then((response) => {
                    if (response.ok) {
                        const copy = response.clone();
                        caches.open(STATIC_CACHE).then((cache) =>
                            cache.put(request, copy),
                        );
                    }

                    return response;
                });
            }),
        );
    }
});

self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
        return;
    }

    // The chat widget posts this when a new message arrives and the
    // widget panel is closed. We surface it as a native OS notification
    // so the visitor doesn't miss it like Messenger / WhatsApp Web.
    if (event.data?.type === 'chat:notify') {
        const { title, body, tag, icon, url } = event.data.payload ?? {};
        if (typeof self.registration.showNotification === 'function') {
            self.registration.showNotification(title ?? 'Nuevo mensaje', {
                body: body ?? '',
                tag: tag ?? 'chat-message',
                icon: icon ?? '/pwa-icons/icon-192.png',
                badge: '/pwa-icons/icon-192.png',
                data: { url: url ?? '/' },
                renotify: true,
                requireInteraction: false,
            });
        }
    }
});

// Web Push — fired by the browser push service when the backend sends a
// push to one of our subscriptions, EVEN WHEN THE PWA IS CLOSED. This is
// the path that delivers notifications when the user has swiped the app
// away on mobile.
self.addEventListener('push', (event) => {
    if (!event.data) return;

    let payload = {};
    try {
        payload = event.data.json();
    } catch (_) {
        payload = { title: 'Nuevo chat', body: event.data.text() };
    }

    const title = payload.title ?? 'Nuevo chat';
    const options = {
        body: payload.body ?? '',
        tag: payload.tag ?? 'admin-chat',
        icon: payload.icon ?? '/pwa-icons/icon-192.png',
        badge: payload.badge ?? '/pwa-icons/icon-192.png',
        data: { url: payload.url ?? '/admin/chat-live/chats' },
        renotify: true,
        requireInteraction: false,
    };

    event.waitUntil(
        self.registration.showNotification(title, options).catch(() => null),
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = event.notification.data?.url ?? '/';
    event.waitUntil(
        self.clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                // Focus an existing tab if one is open on this site
                for (const client of windowClients) {
                    if ('focus' in client) {
                        client.focus();
                        if ('navigate' in client && client.url !== targetUrl) {
                            client.navigate(targetUrl);
                        }
                        return;
                    }
                }
                // Otherwise open a fresh tab
                if (self.clients.openWindow) {
                    return self.clients.openWindow(targetUrl);
                }
            }),
    );
});
