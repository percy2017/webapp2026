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
 * Install the "Estudio Camila" peluquería template — including its 20 SVG
 * assets — into a fresh database.
 *
 * The preset data is exported to `database/seeders/data/peluqueria-template.json`
 * by `scripts/export-preset-for-seeder.mjs`. Every `*_media_id` field in that
 * file is a placeholder string like `"__MEDIA:team-camila__"` instead of a
 * numeric ID, so this seeder can register the SVGs first and then resolve
 * placeholders against the freshly assigned Media IDs.
 *
 * Idempotent: re-running on a database that already has the assets will
 * reuse the existing Media rows (matched by filename).
 */
class PeluqueriaTemplateSeeder extends Seeder
{
    use RegistersCanvasMedia;

    /** Filename stem → relative path under public/. */
    private const SVG_BASE = 'canvas/peluqueria';

    private const MEDIA_HOLDER_NAME = 'peluqueria-canvas';

    private const PRESET_NAME = 'peluqueria';

    public function run(): void
    {
        $data = $this->loadPreset();

        DB::transaction(function () use ($data) {
            $mediaMap = $this->registerCanvasMedia(
                self::SVG_BASE,
                self::MEDIA_HOLDER_NAME,
                self::PRESET_NAME,
                array_unique($this->collectMediaPlaceholders($data)),
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
                'icon' => 'Scissors',
                'sections' => $resolved['sections'],
                'theme' => null,
            ]);

            foreach ($resolved['blocks'] as $index => $block) {
                SiteTemplateBlock::create([
                    'site_template_id' => $template->id,
                    'type' => $block['type'],
                    'content' => $block['content'],
                    'visible' => $block['visible'] ?? true,
                    'position' => $index,
                ]);
            }

            // Seed the navigation menu scoped to this template so the public
            // header has items to render. Each SiteMenuItem gets the freshly
            // created template's id, so menus stay isolated per template.
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
     * Load the preset JSON exported by scripts/export-preset-for-seeder.mjs.
     *
     * @return array<string, mixed>
     */
    private function loadPreset(): array
    {
        $path = database_path('seeders/data/peluqueria-template.json');
        if (! is_file($path)) {
            throw new \RuntimeException(
                "Preset JSON not found at {$path}. Run `node scripts/export-preset-for-seeder.mjs` first."
            );
        }

        $decoded = json_decode(file_get_contents($path), true);
        if (! is_array($decoded)) {
            throw new \RuntimeException("Preset JSON at {$path} is not valid JSON.");
        }

        return $decoded;
    }
}
