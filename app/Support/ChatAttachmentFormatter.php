<?php

namespace App\Support;

use App\Models\ChatMessage;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Shapes `chat_messages.media_ids` references into the array shape the
 * frontend expects on every chat endpoint (admin show, admin poll, visitor
 * show, and the realtime broadcast).
 */
final class ChatAttachmentFormatter
{
    /**
     * @return array<int, array{
     *   id: int,
     *   name: string,
     *   file_name: string,
     *   mime_type: string,
     *   size: int,
     *   url: string
     * }>
     */
    public static function forMessage(ChatMessage $message): array
    {
        $media = $message->referencedMedia();

        return $media
            ->filter(fn (Media $m) => is_file($m->getPath()))
            ->map(fn (Media $m) => [
                'id' => $m->id,
                'name' => $m->name,
                'file_name' => $m->file_name,
                'mime_type' => $m->mime_type,
                'size' => $m->size,
                'url' => $m->getUrl(),
            ])
            ->values()
            ->all();
    }
}
