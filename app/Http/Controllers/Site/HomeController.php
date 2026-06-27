<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Models\SiteTemplate;
use App\Support\TemplateMediaUrl;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $settings = SiteSetting::instance();

        $template = null;

        if ($request->filled('template')) {
            $requested = $request->string('template')->toString();
            $template = SiteTemplate::query()->where('slug', $requested)->first();
        }

        if (! $template && $settings->active_template_slug) {
            $template = SiteTemplate::query()->where('slug', $settings->active_template_slug)->first();
        }

        if (! $template) {
            $template = SiteTemplate::query()
                ->where('is_active', true)
                ->orderByDesc('updated_at')
                ->first();
        }

        $templateData = $template?->only(['slug', 'name', 'sections', 'theme']) ?? null;

        if ($templateData) {
            $templateData['sections'] = TemplateMediaUrl::enrichSections(
                $templateData['sections'] ?? [],
            );
        }

        $blocksData = [];
        if ($template) {
            $rawBlocks = $template->blocks()
                ->orderBy('position')
                ->get()
                ->map(fn ($b) => [
                    'id' => $b->type,
                    'type' => $b->type,
                    'visible' => $b->visible,
                    'content' => $b->content ?? [],
                ])
                ->all();

            $blocksData = TemplateMediaUrl::enrichSections($rawBlocks);
        }

        return Inertia::render('site/landing', [
            'template' => $templateData,
            'blocks' => $blocksData,
            'settings' => $settings->toArray(),
        ]);
    }
}
