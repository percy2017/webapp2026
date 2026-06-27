<?php

namespace App\Support;

use Spatie\MediaLibrary\MediaCollections\Models\Media;

class TemplateMediaUrl
{
    public static function enrichSections(array $sections): array
    {
        if (empty($sections)) {
            return $sections;
        }

        $ids = [];
        foreach ($sections as $section) {
            $content = $section['content'] ?? [];
            foreach ($content as $key => $value) {
                if (str_ends_with($key, '_media_id') && is_numeric($value) && $value > 0) {
                    $ids[] = (int) $value;
                }
            }
        }

        if (empty($ids)) {
            return $sections;
        }

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

        foreach ($sections as &$section) {
            $content = $section['content'] ?? [];
            foreach ($content as $key => $value) {
                if (
                    str_ends_with($key, '_media_id')
                    && is_numeric($value)
                    && $value > 0
                    && isset($urls[(int) $value])
                ) {
                    $urlKey = str_replace('_media_id', '_url', $key);
                    $content[$urlKey] = $urls[(int) $value]['url'];
                    $content[$urlKey.'_thumb'] = $urls[(int) $value]['thumb_url'];
                }
            }
            $section['content'] = $content;
        }
        unset($section);

        return $sections;
    }
}
