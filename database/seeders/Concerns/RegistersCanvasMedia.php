<?php

namespace Database\Seeders\Concerns;

use App\Models\MediaHolder;

/**
 * Shared logic for seeders that install a "canvas" preset template together with
 * the SVGs referenced by `__MEDIA:<key>__` placeholders in the preset JSON.
 *
 * Mirrors the artisan command `media:register-peluqueria-canvas`:
 *   - Holds SVGs on a dedicated `MediaHolder` row so admin panel and Picker can
 *     filter by it.
 *   - Files are matched by `file_name`, so re-running the seeder (or the artisan
 *     command) is idempotent: existing rows are reused.
 *   - Each registration tags `preset` + `asset_key` as `custom_properties` for
 *     later filtering / cleanup.
 */
trait RegistersCanvasMedia
{
    /**
     * Walk the preset data and collect every `__MEDIA:key__` placeholder.
     *
     * @param  array<string, mixed>  $data
     * @return array<int, string> List of unique keys (without `__MEDIA:` wrapper).
     */
    protected function collectMediaPlaceholders(array $data): array
    {
        $found = [];
        $walker = function ($value) use (&$walker, &$found): void {
            if (is_string($value) && preg_match('/^__MEDIA:([a-z0-9\-]+)__$/', $value, $m)) {
                $found[$m[1]] = true;
            } elseif (is_array($value)) {
                foreach ($value as $v) {
                    $walker($v);
                }
            }
        };
        $walker($data);

        return array_keys($found);
    }

    /**
     * Register each SVG (matched by key) into Spatie MediaLibrary under the
     * given MediaHolder. Returns a map of key → Media ID. Existing rows are
     * reused (matched by file_name), so this is idempotent.
     *
     * @param  array<int, string>  $keys
     * @return array<string, int>
     */
    protected function registerCanvasMedia(
        string $svgBase,
        string $mediaHolderName,
        string $presetName,
        array $keys,
    ): array {
        sort($keys);

        $holder = MediaHolder::firstOrCreate(['name' => $mediaHolderName]);
        $map = [];

        foreach ($keys as $key) {
            $filename = $key.'.svg';
            $relativePath = $svgBase.'/'.$filename;
            $absolutePath = public_path($relativePath);

            if (! is_file($absolutePath)) {
                throw new \RuntimeException(
                    "Missing SVG asset for placeholder `{$key}`: expected at public/{$relativePath}"
                );
            }

            $existing = $holder->media()->where('file_name', $filename)->first();
            if ($existing) {
                $map[$key] = $existing->id;
                $this->command?->line("  • {$filename}: reusing media id={$existing->id}");

                continue;
            }

            $media = $holder
                ->addMedia($absolutePath)
                ->usingFileName($filename)
                ->withCustomProperties([
                    'source' => 'preset-seeder',
                    'preset' => $presetName,
                    'asset_key' => $key,
                ])
                ->toMediaCollection();

            $map[$key] = $media->id;
            $this->command?->info("  + {$filename}: registered as media id={$media->id}");
        }

        return $map;
    }

    /**
     * Recursively walk the preset data and replace every `__MEDIA:key__` string
     * with the integer Media ID from $map.
     *
     * @param  array<string, mixed>  $data
     * @param  array<string, int>  $map
     * @return array<string, mixed>
     */
    protected function resolveMediaPlaceholders(array $data, array $map): array
    {
        $walker = function (&$value) use (&$walker, $map): void {
            if (is_string($value) && preg_match('/^__MEDIA:([a-z0-9\-]+)__$/', $value, $m)) {
                $key = $m[1];
                if (! isset($map[$key])) {
                    throw new \RuntimeException("Unresolved media placeholder: {$key}");
                }
                $value = $map[$key];

                return;
            }

            if (is_array($value)) {
                foreach ($value as &$child) {
                    $walker($child);
                }
            }
        };

        $walker($data);

        return $data;
    }

    /**
     * Register every `.svg` file inside `$svgBase` into the MediaHolder —
     * regardless of whether the preset references it. Useful when the folder
     * also ships "default" assets (referenced by `defaultContent` in
     * `basic-blocks-registry.ts` / `template-registry.ts` but not by the
     * preset itself). Returns the full map of registered key → Media ID so the
     * caller can merge it with a placeholder-driven map.
     *
     * @return array<string, int>
     */
    protected function registerAllSvgInFolder(
        string $svgBase,
        string $mediaHolderName,
        string $presetName,
    ): array {
        $absoluteBase = public_path($svgBase);
        if (! is_dir($absoluteBase)) {
            return [];
        }

        $filenames = array_values(array_filter(
            scandir($absoluteBase) ?: [],
            fn (string $name): bool => str_ends_with($name, '.svg'),
        ));

        $keys = array_map(
            fn (string $filename): string => (string) preg_replace('/\.svg$/i', '', $filename),
            $filenames,
        );

        return $this->registerCanvasMedia($svgBase, $mediaHolderName, $presetName, $keys);
    }
}
