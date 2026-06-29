<?php

namespace App\Http\Middleware;

use App\Models\ChatWidgetSetting;
use App\Models\SiteMenuItem;
use App\Models\SiteSetting;
use App\Models\SiteTemplate;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $settings = SiteSetting::instance();

        // Resolve the active template id from two sources, in order:
        //   1. SiteSetting::active_template_slug (set when the user activates
        //      a template from the admin).
        //   2. The SiteTemplate row with is_active = 1, if any. This covers
        //      templates that were flipped on before the slug was written
        //      to SiteSetting (legacy data, or templates the user just
        //      activated without SiteSetting being updated).
        $activeTemplateId = null;

        if ($settings->active_template_slug) {
            $activeTemplateId = SiteTemplate::query()
                ->where('slug', $settings->active_template_slug)
                ->value('id');
        }

        if (! $activeTemplateId) {
            $activeTemplateId = SiteTemplate::query()
                ->where('is_active', true)
                ->orderByDesc('updated_at')
                ->value('id');
        }

        return [
            ...parent::share($request),
            'name' => $settings->site_name ?: config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'chatWidget' => [
                'enabled' => ChatWidgetSetting::current()->enabled,
            ],
            'chatWidgetSettings' => ChatWidgetSetting::current()->only([
                'enabled',
                'position',
            ]),
            'siteSettings' => [
                'site_name' => $settings->site_name,
                'site_tagline' => $settings->site_tagline,
                // Use the accessors — they already resolve
                // `logo_url` / `favicon_url` first and only fall back
                // to the Media library row when no external URL is
                // set. Without this the operator-set /blocks/foo.svg
                // path would never reach the frontend.
                'logo_url' => $settings->logo_url,
                'favicon_url' => $settings->favicon_url,
                'contact_info' => $settings->contact_info ?? [],
                'default_seo' => $settings->default_seo ?? [],
            ],
            'siteMenu' => SiteMenuItem::forLocationAndTemplate(
                SiteMenuItem::LOCATION_PRIMARY,
                $activeTemplateId,
            ),
        ];
    }
}
