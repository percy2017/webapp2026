<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSiteTemplateRequest;
use App\Http\Requests\Admin\UpdateSiteTemplateRequest;
use App\Models\SiteMenuItem;
use App\Models\SiteSetting;
use App\Models\SiteTemplate;
use App\Models\SiteTemplateBlock;
use App\Support\TemplateMediaUrl;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SiteTemplateController extends Controller
{
    public function index(): Response
    {
        $templates = SiteTemplate::query()
            ->with('thumbnailMedia')
            ->orderByDesc('is_active')
            ->orderBy('name')
            ->get()
            ->map(function (SiteTemplate $template) {
                $media = $template->thumbnailMedia;

                return [
                    'id' => $template->id,
                    'name' => $template->name,
                    'slug' => $template->slug,
                    'description' => $template->description,
                    'icon' => $template->icon,
                    'is_active' => $template->is_active,
                    'sections_count' => is_array($template->sections) ? count($template->sections) : 0,
                    'blocks_count' => $template->blocks()->count(),
                    'thumbnail_media' => $media ? [
                        'id' => $media->id,
                        'url' => $media->getUrl(),
                        'thumb_url' => $media->hasGeneratedConversion('thumb')
                            ? $media->getUrl('thumb')
                            : $media->getUrl(),
                    ] : null,
                ];
            });

        return Inertia::render('site-templates/index', [
            'templates' => ['data' => $templates],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('site-templates/create');
    }

    public function store(StoreSiteTemplateRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $blocks = $data['blocks'] ?? [];
        $menuItems = $data['menu_items'] ?? [];
        unset($data['blocks'], $data['menu_items']);

        $template = SiteTemplate::create($data);

        if (! empty($blocks)) {
            foreach ($blocks as $index => $block) {
                $template->blocks()->create([
                    'type' => $block['type'] ?? '',
                    'content' => $block['content'] ?? [],
                    'visible' => $block['visible'] ?? true,
                    'position' => $index,
                ]);
            }
        }

        if (! empty($menuItems)) {
            $this->createMenuItems($template, $menuItems);
        }

        if ($request->boolean('is_active')) {
            SiteTemplate::query()->update(['is_active' => false]);
            $template->update(['is_active' => true]);
            $setting = SiteSetting::instance();
            $setting->active_template_slug = $template->slug;
            $setting->save();
            SiteSetting::flushCache();
        }

        return redirect()
            ->route('site-templates.edit', $template)
            ->with('success', 'Plantilla creada. Ahora configurá sus secciones.');
    }

    /**
     * @param  array<int, array{label: string, href: string, icon?: string|null, location?: string, sort?: int, children?: array}>  $items
     */
    private function createMenuItems(
        SiteTemplate $template,
        array $items,
        ?int $parentId = null,
        int $baseSort = 0,
    ): void {
        foreach ($items as $index => $item) {
            $sort = ($item['sort'] ?? $baseSort + $index) + 1;
            $created = SiteMenuItem::create([
                'parent_id' => $parentId,
                'label' => $item['label'] ?? '',
                'href' => $item['href'] ?? '#',
                'icon' => $item['icon'] ?? null,
                'location' => $item['location'] ?? SiteMenuItem::LOCATION_PRIMARY,
                'site_template_id' => $template->id,
                'sort' => $sort,
                'is_active' => true,
            ]);

            if (! empty($item['children']) && is_array($item['children'])) {
                $this->createMenuItems(
                    $template,
                    $item['children'],
                    $created->id,
                    $sort * 100,
                );
            }
        }
    }

    public function edit(SiteTemplate $siteTemplate): Response
    {
        $siteTemplate->load(['thumbnailMedia', 'blocks']);

        $template = $siteTemplate->toArray();
        $template['sections'] = TemplateMediaUrl::enrichSections(
            $template['sections'] ?? [],
        );

        $rawBlocks = $siteTemplate->blocks->map(fn (SiteTemplateBlock $b) => [
            'id' => $b->id,
            'type' => $b->type,
            'visible' => $b->visible,
            'content' => $b->content ?? [],
        ])->all();

        $template['blocks'] = TemplateMediaUrl::enrichSections($rawBlocks);

        return Inertia::render('site-templates/edit', [
            'template' => $template,
        ]);
    }

    public function update(
        UpdateSiteTemplateRequest $request,
        SiteTemplate $siteTemplate,
    ): RedirectResponse {
        $data = $request->validated();
        $blocks = $data['blocks'] ?? [];
        unset($data['blocks']);

        $siteTemplate->update($data);

        DB::transaction(function () use ($siteTemplate, $blocks) {
            $existing = $siteTemplate->blocks()->get()->keyBy('id');
            $keepIds = [];

            foreach ($blocks as $index => $block) {
                $payload = [
                    'site_template_id' => $siteTemplate->id,
                    'type' => $block['type'],
                    'content' => $block['content'] ?? [],
                    'visible' => $block['visible'] ?? true,
                    'position' => $index,
                ];

                $id = $block['id'] ?? null;
                if ($id && $existing->has($id)) {
                    $siteTemplate->blocks()
                        ->where('id', $id)
                        ->update($payload);
                    $keepIds[] = $id;
                } else {
                    $created = $siteTemplate->blocks()->create($payload);
                    $keepIds[] = $created->id;
                }
            }

            $siteTemplate->blocks()
                ->whereNotIn('id', $keepIds)
                ->delete();
        });

        return back()->with('success', 'Plantilla actualizada.');
    }

    public function destroy(SiteTemplate $siteTemplate): RedirectResponse
    {
        $wasActive = $siteTemplate->is_active;
        $siteTemplate->delete();

        if ($wasActive) {
            SiteSetting::instance()->update(['active_template_slug' => null]);
            SiteSetting::flushCache();
        }

        return redirect()
            ->route('site-templates.index')
            ->with('success', 'Plantilla eliminada.');
    }

    public function activate(SiteTemplate $siteTemplate): RedirectResponse
    {
        SiteTemplate::query()->update(['is_active' => false]);
        $siteTemplate->update(['is_active' => true]);

        SiteSetting::instance()->update(['active_template_slug' => $siteTemplate->slug]);
        SiteSetting::flushCache();

        return back()->with('success', "Plantilla «{$siteTemplate->name}» activada.");
    }
}
