/* WebApp service worker — cache-first for static assets, network-first
 * for navigations so admin/template updates propagate immediately.
 *
 * Bumping the cache version invalidates everything on next page load.
 */
const VERSION = 'v1.0.1';
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
    }
});
