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

        {{-- Favicon links — driven by SiteSetting::favicon_url (the
             accessor already prefers an operator-set URL over the
             static /favicon.*.png shipping with the project). Updating
             the favicon from /admin/site-settings now reflects in the
             browser tab without rebuilding assets. The cache-buster
             `?v=…` keeps stale icons out of the user's tab when they
             switch templates. --}}
        @php($faviconSetting = \App\Models\SiteSetting::instance())
        @php($faviconUrl = $faviconSetting->favicon_url)
        @if (! empty($faviconUrl))
            <link rel="icon" href="{{ $faviconUrl }}?v={{ $faviconSetting->updated_at?->timestamp ?? '0' }}" sizes="any">
        @else
            <link rel="icon" href="/favicon.ico" sizes="any">
            <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        @endif
        <link rel="apple-touch-icon" href="{{ $faviconUrl ?: '/apple-touch-icon.png' }}">

        {{-- PWA manifest + theme color. The manifest is generated
             dynamically from the active SiteSetting (see
             PwaAssetsController::manifest) so switching templates changes
             icons + theme instantly. Use a query-string cache buster so a
             newly activated template's manifest gets re-fetched instead
             of being served from the PWA service-worker cache. --}}
        <link rel="manifest" href="{{ route('pwa.manifest') }}?v={{ \App\Models\SiteSetting::instance()->updated_at?->timestamp ?? '0' }}">
        <meta name="theme-color" content="{{ \App\Models\SiteSetting::instance()->pwa_theme_color ?: '#0f172a' }}">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="{{ \App\Models\SiteSetting::instance()->pwa_short_name ?: \App\Models\SiteSetting::instance()->site_name ?: 'WebApp' }}">

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
