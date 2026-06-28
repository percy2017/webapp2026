<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        {{-- PWA manifest + theme color --}}
        <link rel="manifest" href="/manifest.webmanifest">
        <meta name="theme-color" content="#0f172a">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="WebApp">
        <link rel="apple-touch-icon" href="/pwa-icons/icon-192.png">
        <link rel="apple-touch-icon" sizes="192x192" href="/pwa-icons/icon-192.png">
        <link rel="apple-touch-icon" sizes="512x512" href="/pwa-icons/icon-512.png">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>

        {{-- Register PWA service worker (only on secure contexts or localhost) --}}
        <script>
            if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
                window.addEventListener('load', function () {
                    navigator.serviceWorker.register('/sw.js', { scope: '/' })
                        .then(function (reg) {
                            // eslint-disable-next-line no-console
                            console.info('[PWA] service worker registered:', reg.scope);
                        })
                        .catch(function (err) {
                            // eslint-disable-next-line no-console
                            console.warn('[PWA] service worker registration failed:', err);
                        });
                });

                // Expose the install prompt globally so any UI (e.g. admin
                // dashboard) can trigger it with window.installPWA().
                window.deferredInstallPrompt = null;
                window.addEventListener('beforeinstallprompt', function (e) {
                    e.preventDefault();
                    window.deferredInstallPrompt = e;
                    window.dispatchEvent(new CustomEvent('pwa:installable'));
                    // eslint-disable-next-line no-console
                    console.info('[PWA] install prompt available');
                });
                window.addEventListener('appinstalled', function () {
                    window.deferredInstallPrompt = null;
                    window.dispatchEvent(new CustomEvent('pwa:installed'));
                    // eslint-disable-next-line no-console
                    console.info('[PWA] app installed');
                });
                window.installPWA = async function () {
                    if (!window.deferredInstallPrompt) return false;
                    window.deferredInstallPrompt.prompt();
                    const choice = await window.deferredInstallPrompt.userChoice;
                    window.deferredInstallPrompt = null;
                    return choice.outcome === 'accepted';
                };
            }
        </script>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
