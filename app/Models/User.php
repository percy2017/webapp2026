<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Permission\Traits\HasRoles;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $phone
 * @property int|null $avatar_media_id
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'phone', 'password', 'avatar_media_id'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements HasMedia, PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    use HasRoles;
    use InteractsWithMedia;

    protected $appends = [
        'avatar_url',
        'is_admin',
        'roles_list',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('avatar')
            ->singleFile()
            ->useDisk('public');
    }

    public function avatarMedia(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'avatar_media_id');
    }

    public function getAvatarUrlAttribute(): ?string
    {
        if ($this->avatar_media_id) {
            return $this->avatarMedia?->getUrl();
        }

        $media = $this->getFirstMedia('avatar');
        if ($media) {
            return $media->getUrl();
        }

        // Default fallback served directly from /public — no row in the
        // `media` table, no file in storage/app/public. Reserved for the
        // admin user so the system user (and any other admin) always
        // shows a real avatar placeholder instead of bare initials.
        // Non-admin users keep returning null so the UI shows the
        // initials fallback until they upload their own avatar.
        if ($this->hasRole('admin')) {
            return '/blocks/avatar-admin.svg';
        }

        return null;
    }

    /**
     * Convenience flag so the frontend can check `auth.user.is_admin`
     * without having to read the `roles_list` array. Avoids loading
     * the Spatie roles relation just to render a sidebar.
     */
    public function getIsAdminAttribute(): bool
    {
        // The relation may not be loaded yet (eager-loaded via
        // loadMissing) — the HasRoles trait caches it.
        return $this->hasRole('admin');
    }

    /**
     * Plain string array of role names, safe to serialize to JSON.
     * The frontend uses it for sidebar visibility checks.
     *
     * @return array<int, string>
     */
    public function getRolesListAttribute(): array
    {
        return $this->roles->pluck('name')->all();
    }

    public function chat(): HasOne
    {
        return $this->hasOne(Chat::class);
    }

    public function chats(): HasMany
    {
        return $this->hasMany(Chat::class);
    }
}
