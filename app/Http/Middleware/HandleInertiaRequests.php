<?php

namespace App\Http\Middleware;

use App\Models\ChatWidgetSetting;
use App\Models\SiteMenuItem;
use App\Models\SiteSetting;
use App\Models\SiteTemplate;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

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

        $activeTemplateId = null;
        if ($settings->active_template_slug) {
            $activeTemplateId = SiteTemplate::query()
                ->where('slug', $settings->active_template_slug)
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
                'logo_url' => self::mediaUrl($settings->logoMedia),
                'favicon_url' => self::mediaUrl($settings->faviconMedia),
                'contact_info' => $settings->contact_info ?? [],
                'default_seo' => $settings->default_seo ?? [],
            ],
            'siteMenu' => SiteMenuItem::forLocationAndTemplate(
                SiteMenuItem::LOCATION_PRIMARY,
                $activeTemplateId,
            ),
        ];
    }

    private static function mediaUrl(?Media $media): ?string
    {
        return $media?->getUrl();
    }
}
