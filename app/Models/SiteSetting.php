<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * @property int $id
 * @property string $site_name
 * @property string|null $site_tagline
 * @property int|null $logo_media_id
 * @property string|null $logo_url
 * @property int|null $favicon_media_id
 * @property string|null $favicon_url
 * @property string|null $active_template_slug
 * @property array|null $default_seo
 * @property array|null $contact_info
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Media|null $logoMedia
 * @property-read Media|null $faviconMedia
 * @property-read SiteTemplate|null $activeTemplate
 */
#[Fillable([
    'site_name',
    'site_tagline',
    'logo_media_id',
    'logo_url',
    'favicon_media_id',
    'favicon_url',
    'pwa_short_name',
    'pwa_description',
    'pwa_theme_color',
    'pwa_background_color',
    'active_template_slug',
    'default_seo',
    'contact_info',
])]
class SiteSetting extends Model
{
    protected $appends = [
        'logo_url',
        'favicon_url',
    ];

    protected function casts(): array
    {
        return [
            'default_seo' => 'array',
            'contact_info' => 'array',
        ];
    }

    public function logoMedia(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'logo_media_id');
    }

    public function faviconMedia(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'favicon_media_id');
    }

    public function activeTemplate(): BelongsTo
    {
        return $this->belongsTo(SiteTemplate::class, 'active_template_slug', 'slug');
    }

    /**
     * Public URL for the system logo. Resolution order:
     *   1. `logo_url` (operator-supplied external URL or a
     *      `/blocks/*.svg` path served directly from the public disk)
     *   2. `logo_media_id` → Media library row URL
     *   3. null
     *
     * Frontend reads this via `usePage().props.siteSettings.logo_url`
     * for the admin sidebar logo and /manifest.webmanifest uses the
     * same accessor for its icon entries.
     */
    public function getLogoUrlAttribute(): ?string
    {
        // Read the raw column via getAttributes() — calling $this->logo_url
        // inside this accessor would recurse back into itself and return
        // null forever, no matter what's in the DB.
        $raw = $this->getAttributes()['logo_url'] ?? null;
        if (! empty($raw)) {
            return $raw;
        }

        return $this->logoMedia?->getUrl();
    }

    public function getFaviconUrlAttribute(): ?string
    {
        $raw = $this->getAttributes()['favicon_url'] ?? null;
        if (! empty($raw)) {
            return $raw;
        }

        return $this->faviconMedia?->getUrl();
    }

    public static function instance(): self
    {
        $existing = static::query()->first();
        if ($existing) {
            return $existing;
        }

        $fresh = new static;
        $fresh->id = 1;
        $fresh->site_name = '';
        $fresh->site_tagline = null;
        $fresh->logo_media_id = null;
        $fresh->logo_url = null;
        $fresh->favicon_media_id = null;
        $fresh->favicon_url = null;
        $fresh->pwa_short_name = null;
        $fresh->pwa_description = null;
        $fresh->pwa_theme_color = null;
        $fresh->pwa_background_color = null;
        $fresh->active_template_slug = null;
        $fresh->default_seo = null;
        $fresh->contact_info = null;

        return $fresh;
    }

    public function save(array $options = []): bool
    {
        if ($this->id === 1 && ! $this->exists) {
            return parent::save($options);
        }

        return parent::save($options);
    }

    public static function flushCache(): void
    {
        // No-op kept for API stability; queries are cheap.
    }
}
