<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $parent_id
 * @property string $label
 * @property string $href
 * @property string|null $icon
 * @property string $location
 * @property int|null $site_template_id
 * @property int $sort
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class SiteMenuItem extends Model
{
    protected $table = 'site_menu_items';

    public const LOCATION_PRIMARY = 'primary';

    protected $fillable = [
        'parent_id',
        'label',
        'href',
        'icon',
        'location',
        'site_template_id',
        'sort',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort' => 'integer',
            'parent_id' => 'integer',
            'site_template_id' => 'integer',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('sort');
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(SiteTemplate::class, 'site_template_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeForLocation(Builder $query, string $location): Builder
    {
        return $query->where('location', $location);
    }

    public function scopeTopLevel(Builder $query): Builder
    {
        return $query->whereNull('parent_id');
    }

    public function scopeForTemplate(Builder $query, ?int $templateId): Builder
    {
        if ($templateId === null) {
            return $query->whereNull('site_template_id');
        }

        return $query->where('site_template_id', $templateId);
    }

    public static function forLocationAndTemplate(
        string $location,
        ?int $templateId,
    ): array {
        $items = static::query()
            ->active()
            ->forLocation($location)
            ->forTemplate($templateId)
            ->topLevel()
            ->with([
                'children' => function ($q) {
                    $q->active()->orderBy('sort')->orderBy('id');
                },
            ])
            ->orderBy('sort')
            ->orderBy('id')
            ->get();

        return $items
            ->map(fn (self $item) => self::serializeForPublic($item))
            ->all();
    }

    public static function forLocationOrdered(string $location): array
    {
        return static::forLocationAndTemplate(
            $location,
            static::query()->value('site_template_id'),
        );
    }

    private static function serializeForPublic(self $item): array
    {
        return [
            'label' => $item->label,
            'href' => $item->href,
            'icon' => $item->icon,
            'children' => $item->children
                ->map(fn (self $child) => self::serializeForPublic($child))
                ->all(),
        ];
    }
}
