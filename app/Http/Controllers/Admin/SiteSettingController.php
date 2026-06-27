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
            'favicon_media_id' => ['nullable', 'integer', 'exists:media,id'],
            'active_template_slug' => ['nullable', 'string', 'exists:site_templates,slug'],
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

        if (! empty($data['active_template_slug'])) {
            SiteTemplate::query()->update(['is_active' => false]);
            SiteTemplate::query()
                ->where('slug', $data['active_template_slug'])
                ->update(['is_active' => true]);
        } else {
            SiteTemplate::query()->update(['is_active' => false]);
        }

        return back()->with('success', 'Ajustes del sitio actualizados.');
    }
}
