<?php

namespace App\Models;

use Database\Factories\SiteTemplateFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property int|null $thumbnail_media_id
 * @property string|null $icon
 * @property bool $is_active
 * @property array|null $sections
 * @property array|null $theme
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Media|null $thumbnailMedia
 */
#[Fillable(['name', 'slug', 'description', 'thumbnail_media_id', 'icon', 'is_active', 'sections', 'theme'])]
class SiteTemplate extends Model
{
    /** @use HasFactory<SiteTemplateFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sections' => 'array',
            'theme' => 'array',
        ];
    }

    public function thumbnailMedia(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'thumbnail_media_id');
    }

    public function getVisibleSections(): array
    {
        return array_values(array_filter(
            $this->sections ?? [],
            fn (array $section) => ($section['visible'] ?? true) === true,
        ));
    }

    public function blocks(): HasMany
    {
        return $this->hasMany(SiteTemplateBlock::class)->orderBy('position');
    }

    public function getVisibleBlocks(): array
    {
        return $this->blocks
            ->where('visible', true)
            ->values()
            ->map(fn (SiteTemplateBlock $block) => [
                'id' => $block->id,
                'type' => $block->type,
                'visible' => $block->visible,
                'content' => $block->content ?? [],
            ])
            ->all();
    }
}
