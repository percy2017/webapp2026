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
        $brand = $data['brand'] ?? [];
        unset($data['blocks'], $data['menu_items'], $data['brand']);

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

        // Seed the system SiteSetting singleton with the preset's brand
        // identity. /admin/site-settings, /manifest.webmanifest, the
        // admin sidebar logo, and the <meta name="theme-color"> tag all
        // read from SiteSetting — copying the preset's brand here means
        // the operator sees the page in its true visual identity from
        // minute one, with no extra /admin/site-settings click required.
        // The operator can still tweak any field on that page afterwards.
        if (! empty($brand)) {
            $setting = SiteSetting::instance();

            // Logo / favicon arrive as `/blocks/foo.svg` paths served
            // straight from the project's public disk. We write them
            // to the new `logo_url` / `favicon_url` columns on
            // SiteSetting — no Media row, no copy into storage/app/
            // public, no faff. The accessor resolves this URL first
            // when /admin/site-settings, the sidebar and the PWA
            // manifest ask for the asset, so the operator sees the
            // preset's identity on minute one without any manual
            // configuration. They can still switch either asset to a
            // Media-library entry from /admin/site-settings afterwards.
            $payload = array_filter($brand, fn ($v) => $v !== null && $v !== '');

            // The two path keys must NOT be persisted as-is — the
            // SiteSetting columns are `logo_url` / `favicon_url`.
            if (isset($payload['logo_path'])) {
                $payload['logo_url'] = $payload['logo_path'];
            }
            if (isset($payload['favicon_path'])) {
                $payload['favicon_url'] = $payload['favicon_path'];
            }
            unset($payload['logo_path'], $payload['favicon_path']);

            // SEO defaults land on the JSON `default_seo` cast. Merge
            // them with any pre-existing SEO fields so a partial
            // override (only seo_title) doesn't wipe the description.
            if (isset($payload['seo_title']) || isset($payload['seo_description'])) {
                $existingSeo = is_array($setting->default_seo)
                    ? $setting->default_seo
                    : [];
                $newSeo = array_filter([
                    'title' => $payload['seo_title'] ?? ($existingSeo['title'] ?? null),
                    'description' => $payload['seo_description'] ?? ($existingSeo['description'] ?? null),
                ], fn ($v) => $v !== null && $v !== '');
                $payload['default_seo'] = $newSeo;
            }
            unset($payload['seo_title'], $payload['seo_description']);

            $setting->fill($payload);
            $setting->save();
            SiteSetting::flushCache();
        }

        if ($request->boolean('is_active')) {
            $template->activate();
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
        $siteTemplate->activate();

        return back()->with('success', "Plantilla «{$siteTemplate->name}» activada.");
    }
}
