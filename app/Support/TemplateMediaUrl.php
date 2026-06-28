<?php

namespace App\Support;

use Spatie\MediaLibrary\MediaCollections\Models\Media;

class TemplateMediaUrl
{
    /**
     * Enrich the template sections with public URLs for any *_media_id field
     * (recursively, so nested arrays like `items[].image_media_id` are also
     * resolved).
     *
     * Two source kinds are handled:
     *
     *   1. Numeric IDs (`image_media_id: 27`).
     *      Resolved via the `media` table; `image_url` / `image_url_thumb` are
     *      added as sibling keys.
     *
     *   2. `__MEDIA:<key>__` placeholders (`image_media_id: '__MEDIA:hero__'`).
     *      Used by `database/seeders/*TemplateSeeder` to reference preset
     *      assets before they have a numeric ID, and by block/section
     *      `defaultContent` so freshly-dropped blocks already show a sample
     *      image. Resolved by looking up a Media row whose `file_name` matches
     *      `<key>.svg`. The placeholder is replaced in place with the resolved
     *      integer ID before the numeric enrichment runs, so consumers can
     *      keep treating the field as an integer afterwards.
     */
    public static function enrichSections(array $sections): array
    {
        if (empty($sections)) {
            return $sections;
        }

        $placeholderKeys = [];
        foreach ($sections as $section) {
            self::collectPlaceholderKeys($section['content'] ?? [], $placeholderKeys);
        }

        $sections = self::resolvePlaceholdersInSections(
            $sections,
            self::loadPlaceholderMap($placeholderKeys),
        );

        $ids = [];
        foreach ($sections as $section) {
            self::collectMediaIds($section['content'] ?? [], $ids);
        }

        if (empty($ids)) {
            return $sections;
        }

        $urls = self::loadUrls($ids);

        foreach ($sections as &$section) {
            $section['content'] = self::enrichContent(
                $section['content'] ?? [],
                $urls,
            );
        }
        unset($section);

        return $sections;
    }

    /**
     * Recursively collect numeric *_media_id values from an arbitrary array.
     *
     * @param  array<string|int, mixed>  $content
     * @param  array<int>  $ids
     */
    private static function collectMediaIds(array $content, array &$ids): void
    {
        foreach ($content as $key => $value) {
            if (is_string($key) && str_ends_with($key, '_media_id') && is_numeric($value) && $value > 0) {
                $ids[] = (int) $value;
            } elseif (is_array($value)) {
                self::collectMediaIds($value, $ids);
            }
        }
    }

    /**
     * Recursively collect unique `__MEDIA:<key>__` placeholder keys.
     *
     * @param  array<string|int, mixed>  $content
     * @param  array<string, true>  $keys
     */
    private static function collectPlaceholderKeys(array $content, array &$keys): void
    {
        foreach ($content as $key => $value) {
            if (
                is_string($key)
                && str_ends_with($key, '_media_id')
                && is_string($value)
                && preg_match('/^__MEDIA:([a-z0-9\-]+)__$/', $value, $m)
            ) {
                $keys[$m[1]] = true;
            } elseif (is_array($value)) {
                self::collectPlaceholderKeys($value, $keys);
            }
        }
    }

    /**
     * Look up Media rows by file_name (`<key>.svg`) for every placeholder key
     * we collected.
     *
     * @param  array<string, true>  $keys
     * @return array<string, int> Map of placeholder key → Media ID.
     */
    private static function loadPlaceholderMap(array $keys): array
    {
        if (empty($keys)) {
            return [];
        }

        $filenames = array_map(fn (string $key): string => $key.'.svg', array_keys($keys));

        $rows = Media::query()->whereIn('file_name', $filenames)->get(['id', 'file_name']);

        $map = [];
        foreach ($rows as $row) {
            $key = preg_replace('/\.svg$/i', '', (string) $row->file_name);

            if ($key !== null && isset($keys[$key])) {
                $map[$key] = (int) $row->id;
            }
        }

        return $map;
    }

    /**
     * Replace every `__MEDIA:<key>__` string in place with its resolved
     * numeric ID. Unknown keys are left as the original placeholder string
     * (the consuming components already handle a non-numeric value by falling
     * back to the empty-state UI).
     *
     * @param  array<int, array<string, mixed>>  $sections
     * @param  array<string, int>  $map
     * @return array<int, array<string, mixed>>
     */
    private static function resolvePlaceholdersInSections(array $sections, array $map): array
    {
        if (empty($map)) {
            return $sections;
        }

        foreach ($sections as &$section) {
            $section['content'] = self::resolvePlaceholdersInContent(
                $section['content'] ?? [],
                $map,
            );
        }
        unset($section);

        return $sections;
    }

    /**
     * @param  array<string|int, mixed>  $content
     * @param  array<string, int>  $map
     * @return array<string|int, mixed>
     */
    private static function resolvePlaceholdersInContent(array $content, array $map): array
    {
        foreach ($content as $key => $value) {
            if (
                is_string($key)
                && str_ends_with($key, '_media_id')
                && is_string($value)
                && preg_match('/^__MEDIA:([a-z0-9\-]+)__$/', $value, $m)
                && isset($map[$m[1]])
            ) {
                $content[$key] = $map[$m[1]];
            } elseif (is_array($value)) {
                $content[$key] = self::resolvePlaceholdersInContent($value, $map);
            }
        }

        return $content;
    }

    /**
     * @param  array<int>  $ids
     * @return array<int, array{id: int, url: string, thumb_url: string}>
     */
    private static function loadUrls(array $ids): array
    {
        $media = Media::query()->whereIn('id', array_unique($ids))->get();
        $urls = [];
        foreach ($media as $item) {
            $urls[$item->id] = [
                'id' => $item->id,
                'url' => $item->getUrl(),
                'thumb_url' => $item->hasGeneratedConversion('thumb')
                    ? $item->getUrl('thumb')
                    : $item->getUrl(),
            ];
        }

        return $urls;
    }

    /**
     * Recursively enrich *_media_id fields with their public URLs.
     *
     * @param  array<string|int, mixed>  $content
     * @param  array<int, array{id: int, url: string, thumb_url: string}>  $urls
     * @return array<string|int, mixed>
     */
    private static function enrichContent(array $content, array $urls): array
    {
        foreach ($content as $key => $value) {
            if (is_string($key) && str_ends_with($key, '_media_id') && is_numeric($value) && $value > 0 && isset($urls[(int) $value])) {
                $urlKey = str_replace('_media_id', '_url', $key);
                $content[$urlKey] = $urls[(int) $value]['url'];
                $content[$urlKey.'_thumb'] = $urls[(int) $value]['thumb_url'];
            } elseif (is_array($value)) {
                $content[$key] = self::enrichContent($value, $urls);
            }
        }

        return $content;
    }
}
