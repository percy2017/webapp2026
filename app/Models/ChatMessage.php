<?php

namespace App\Models;

use Database\Factories\ChatMessageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * @property int $id
 * @property int $chat_id
 * @property int|null $sender_id
 * @property string $sender_type
 * @property string|null $content
 * @property array<int>|null $media_ids
 * @property Carbon|null $read_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Chat $chat
 * @property-read User|null $sender
 */
#[Fillable(['chat_id', 'sender_id', 'sender_type', 'content', 'media_ids', 'read_at'])]
class ChatMessage extends Model implements HasMedia
{
    /** @use HasFactory<ChatMessageFactory> */
    use HasFactory;

    use InteractsWithMedia;

    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
            'media_ids' => 'array',
        ];
    }

    public function chat(): BelongsTo
    {
        return $this->belongsTo(Chat::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('attachments')->useDisk('public');
    }

    /**
     * Resolve the canonical Media rows this message references.
     *
     * The message keeps the id list in the `media_ids` JSON column and the
     * files themselves live in the Media library — no copy is made, so the
     * library stays the single source of truth.
     *
     * @return Collection<int, Media>
     */
    public function referencedMedia(): Collection
    {
        $ids = $this->media_ids ?? [];
        if (! is_array($ids) || count($ids) === 0) {
            return collect();
        }

        return Media::query()
            ->whereIn('id', $ids)
            ->get();
    }

    public function isFromVisitor(): bool
    {
        return $this->sender_type === 'visitor';
    }

    public function isFromAgent(): bool
    {
        return $this->sender_type === 'agent';
    }
}
