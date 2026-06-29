<?php

namespace App\Http\Controllers;

use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;

/**
 * Serves PWA assets dynamically from the active SiteSetting.
 *
 * The active template commits its logo + favicon + PWA metadata to
 * `site_settings` on activation (see SiteTemplate::activate()), so the
 * PWA surface changes the moment the operator switches templates —
 * no static assets to replace, no rebuild required.
 *
 * Logo and favicon resolution runs through the SiteSetting accessors,
 * which prefer an operator-set URL (`logo_url` / `favicon_url`) over
 * the Media-library-backed `*_media_id` column. The same URLs the
 * admin sidebar and the public navbar render are the ones the PWA
 * manifest advertises.
 */
class PwaAssetsController extends Controller
{
    /**
     * Build and return the /manifest.webmanifest payload.
     */
    public function manifest(): JsonResponse
    {
        $setting = SiteSetting::instance();
        $logoUrl = $setting->logo_url;
        $faviconUrl = $setting->favicon_url;

        // For SVGs we can't introspect mime_type from the URL alone —
        // assume image/svg+xml. For everything served through the
        // Media library we have the model and can read the mime.
        $logoMedia = $setting->logoMedia;
        $faviconMedia = $setting->faviconMedia;
        $logoMime = $logoMedia?->mime_type ?: (str_ends_with((string) $logoUrl, '.svg') ? 'image/svg+xml' : 'image/png');
        $faviconMime = $faviconMedia?->mime_type ?: (str_ends_with((string) $faviconUrl, '.svg') ? 'image/svg+xml' : 'image/svg+xml');

        $icons = [];

        // Logo doubles as the 192/512 PWA icon so operators only have to
        // upload one image per template. Skip maskable if the file is
        // an SVG (browsers handle sizing for SVG fine; maskable needs a
        // fixed-size bitmap with a safe zone).
        if ($logoUrl) {
            $isSvg = str_contains($logoMime, 'svg');
            $icons[] = [
                'src' => $logoUrl,
                'sizes' => '192x192',
                'type' => $logoMime,
                'purpose' => 'any',
            ];
            $icons[] = [
                'src' => $logoUrl,
                'sizes' => '512x512',
                'type' => $logoMime,
                'purpose' => 'any',
            ];
            if (! $isSvg) {
                $icons[] = [
                    'src' => $logoUrl,
                    'sizes' => '512x512',
                    'type' => $logoMime,
                    'purpose' => 'maskable',
                ];
            }
        }

        if ($faviconUrl) {
            $icons[] = [
                'src' => $faviconUrl,
                'sizes' => 'any',
                'type' => $faviconMime,
                'purpose' => 'any',
            ];
        }

        $payload = [
            'name' => $setting->site_name ?: 'WebApp',
            'short_name' => $setting->pwa_short_name
                ?: $setting->site_name
                ?: 'WebApp',
            'description' => $setting->pwa_description
                ?: $setting->site_tagline
                ?: 'Sitio público editable.',
            'start_url' => '/',
            'scope' => '/',
            'display' => 'standalone',
            'orientation' => 'portrait',
            'background_color' => $setting->pwa_background_color ?: '#0f172a',
            'theme_color' => $setting->pwa_theme_color ?: '#0f172a',
            'lang' => 'es',
            'dir' => 'ltr',
            'categories' => ['business', 'productivity', 'social'],
            'icons' => $icons,
            'shortcuts' => [
                [
                    'name' => 'Admin',
                    'short_name' => 'Admin',
                    'description' => 'Abrir el panel de administración',
                    'url' => '/admin',
                    'icons' => $logoUrl
                        ? [['src' => $logoUrl, 'sizes' => '192x192']]
                        : [],
                ],
            ],
        ];

        return response()
            ->json($payload)
            // Always revalidate so the manifest is fresh after the
            // operator activates a new template.
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');
    }
}
