<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Models\SiteTemplate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SiteSettingController extends Controller
{
    public function edit(): Response
    {
        $settings = SiteSetting::instance()->load(['logoMedia', 'faviconMedia']);

        return Inertia::render('site-settings/index', [
            'settings' => $settings,
            'templates' => SiteTemplate::query()
                ->orderBy('name')
                ->get(['slug', 'name'])
                ->map(fn ($t) => ['slug' => $t->slug, 'name' => $t->name]),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'site_name' => ['required', 'string', 'max:120'],
            'site_tagline' => ['nullable', 'string', 'max:255'],
            'logo_media_id' => ['nullable', 'integer', 'exists:media,id'],
            'logo_url' => ['nullable', 'string', 'max:500'],
            'favicon_media_id' => ['nullable', 'integer', 'exists:media,id'],
            'favicon_url' => ['nullable', 'string', 'max:500'],
            'active_template_slug' => ['nullable', 'string', 'exists:site_templates,slug'],
            // PWA manifest fields — owned by SiteSetting (system-wide),
            // not by individual templates. /manifest.webmanifest, the
            // <meta name="theme-color"> tag, and the SiteSetting::logo_url
            // shared via Inertia all read straight off this row.
            'pwa_short_name' => ['nullable', 'string', 'max:32'],
            'pwa_description' => ['nullable', 'string', 'max:240'],
            'pwa_theme_color' => ['nullable', 'string', 'max:9', 'regex:/^#[0-9a-fA-F]{3,8}$/'],
            'pwa_background_color' => ['nullable', 'string', 'max:9', 'regex:/^#[0-9a-fA-F]{3,8}$/'],
            'contact_info' => ['nullable', 'array'],
            'contact_info.email' => ['nullable', 'string', 'email', 'max:255'],
            'contact_info.phone' => ['nullable', 'string', 'max:60'],
            'contact_info.address' => ['nullable', 'string', 'max:255'],
            'contact_info.social' => ['nullable', 'array'],
            'default_seo' => ['nullable', 'array'],
            'default_seo.title' => ['nullable', 'string', 'max:120'],
            'default_seo.description' => ['nullable', 'string', 'max:255'],
        ]);

        $settings = SiteSetting::first() ?? new SiteSetting;
        $settings->fill($data);
        $settings->save();
        SiteSetting::flushCache();

        // Active-template redirect: this is the only place the slug now
        // changes (the site_templates/{id}/activate endpoint still works
        // too via SiteTemplate::activate()).
        if (! empty($data['active_template_slug'])) {
            $template = SiteTemplate::query()
                ->where('slug', $data['active_template_slug'])
                ->first();
            if ($template) {
                $template->update(['is_active' => false]);
                $template->update(['is_active' => true]);
            }
        }

        return back()->with('success', 'Ajustes del sitio actualizados.');
    }
}
