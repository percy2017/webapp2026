<?php

namespace Database\Seeders;

use App\Models\SiteMenuItem;
use App\Models\SiteSetting;
use App\Models\SiteTemplate;
use App\Models\SiteTemplateBlock;
use Database\Seeders\Concerns\RegistersCanvasMedia;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Install the "StreamerHub" streaming template — including its SVG assets —
 * into a fresh database.
 *
 * The preset data is exported to `database/seeders/data/streaming-template.json`
 * by `scripts/export-streaming-for-seeder.mjs`. Every `*_media_id` field that
 * ships with a sample image uses a `__MEDIA:<key>__` placeholder; the seeder
 * registers those SVGs in the `streaming-canvas` MediaHolder and resolves the
 * placeholders to the freshly assigned Media IDs (same pipeline used by
 * `PeluqueriaTemplateSeeder`).
 *
 * Idempotent: re-running on a database that already has the template will
 * delete and recreate it; re-running on a database that already has the assets
 * will reuse the existing Media rows (matched by filename).
 */
class StreamingTemplateSeeder extends Seeder
{
    use RegistersCanvasMedia;

    /** Filename stem → relative path under public/. */
    private const SVG_BASE = 'canvas/streaming';

    private const MEDIA_HOLDER_NAME = 'streaming-canvas';

    private const PRESET_NAME = 'streaming';

    public function run(): void
    {
        $data = $this->loadPreset();

        DB::transaction(function () use ($data) {
            // Register every SVG in `public/canvas/streaming/` so that
            // `defaultContent` placeholders in `basic-blocks-registry.ts` /
            // `template-registry.ts` (sample-image, sample-ba-*, etc.) also
            // resolve at render time. The streaming preset itself only
            // references a subset of these.
            $mediaMap = $this->registerAllSvgInFolder(
                self::SVG_BASE,
                self::MEDIA_HOLDER_NAME,
                self::PRESET_NAME,
            );

            $resolved = $this->resolveMediaPlaceholders($data, $mediaMap);

            // Remove any existing template with the same slug so the seeder is idempotent.
            $existing = SiteTemplate::query()->where('slug', $resolved['slug'])->first();
            if ($existing) {
                $existing->delete();
            }

            $template = SiteTemplate::create([
                'name' => $resolved['name'],
                'slug' => $resolved['slug'],
                'description' => $resolved['description'],
                'is_active' => true,
                'icon' => 'Video',
                'sections' => $resolved['sections'],
                'theme' => null,
            ]);

            foreach ($resolved['blocks'] as $index => $block) {
                // The preset JSON may use `content` as a function (for dynamic
                // defaults like the countdown). The TS exporter has already
                // resolved it to a plain object at JSON time, so we just
                // persist whatever is there.
                SiteTemplateBlock::create([
                    'site_template_id' => $template->id,
                    'type' => $block['type'],
                    'content' => $block['content'] ?? [],
                    'visible' => $block['visible'] ?? true,
                    'position' => $index,
                ]);
            }

            // Also seed menu items if the preset defines them.
            if (! empty($resolved['menu_items'])) {
                foreach ($resolved['menu_items'] as $item) {
                    SiteMenuItem::create([
                        'site_template_id' => $template->id,
                        'label' => $item['label'],
                        'href' => $item['href'],
                        'icon' => $item['icon'] ?? null,
                    ]);
                }
            }

            // Deactivate any other template and point SiteSetting at this one.
            SiteTemplate::query()->where('id', '!=', $template->id)->update(['is_active' => false]);

            $setting = SiteSetting::instance();
            $setting->active_template_slug = $resolved['slug'];
            $setting->save();
        });
    }

    /**
     * @return array<string, mixed>
     */
    private function loadPreset(): array
    {
        $path = database_path('seeders/data/streaming-template.json');
        if (! is_file($path)) {
            throw new \RuntimeException(
                "Preset JSON not found at {$path}. Run `node scripts/export-streaming-for-seeder.mjs` first."
            );
        }

        $decoded = json_decode(file_get_contents($path), true);
        if (! is_array($decoded)) {
            throw new \RuntimeException("Preset JSON at {$path} is not valid JSON.");
        }

        return $decoded;
    }
}
