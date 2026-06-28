<?php

namespace App\Http\Controllers\Widget;

use App\Events\ChatCreated;
use App\Events\ChatMessageSent;
use App\Http\Controllers\Controller;
use App\Http\Requests\Widget\SendChatMessageRequest;
use App\Models\Chat;
use App\Models\ChatMessage;
use App\Models\MediaHolder;
use App\Support\ChatAttachmentFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        $chat = Chat::firstOrCreate(
            ['user_id' => $user->id],
            ['status' => 'open', 'last_message_at' => now()]
        );

        // Notify every connected admin that a visitor just opened (or
        // reopened) their chat. The admin layout listens to the
        // `admin.chats` channel and pops a desktop notification; the
        // event also fires Web Push notifications so closed PWAs wake
        // up via the browser push service.
        if ($chat->wasRecentlyCreated) {
            $event = new ChatCreated($chat);
            // Broadcast to Echo listeners (admin layout) — also returns
            // the same instance so we can fire Web Push synchronously.
            event($event);
            $event->dispatchWebPush();
        }

        $chat->load(['messages.sender.media']);

        return response()->json([
            'chat' => [
                'id' => $chat->id,
                'status' => $chat->status,
                'messages' => $chat->messages->map(fn (ChatMessage $message) => [
                    'id' => $message->id,
                    'sender_type' => $message->sender_type,
                    'sender_name' => $message->sender?->name,
                    'content' => $message->content,
                    'created_at' => $message->created_at?->toIso8601String(),
                    'attachments' => ChatAttachmentFormatter::forMessage($message),
                ])->values(),
            ],
        ]);
    }

    public function sendMessage(SendChatMessageRequest $request): JsonResponse
    {
        $user = $request->user();

        $chat = Chat::firstOrCreate(
            ['user_id' => $user->id],
            ['status' => 'open', 'last_message_at' => now()]
        );

        $uploadedMediaIds = [];
        if ($request->hasFile('attachments')) {
            $holder = MediaHolder::firstOrCreate(['name' => 'default']);
            foreach ($request->file('attachments') as $file) {
                $media = $holder->addMediaFromRequest('attachments')->toMediaCollection();
                $uploadedMediaIds[] = $media->id;
            }
        }

        $message = ChatMessage::create([
            'chat_id' => $chat->id,
            'sender_id' => $user->id,
            'sender_type' => 'visitor',
            'content' => $request->input('content'),
            'media_ids' => $uploadedMediaIds,
        ]);

        $chat->update(['last_message_at' => $message->created_at]);

        ChatMessageSent::dispatch($message->loadMissing('sender.media'));

        return response()->json([
            'message' => [
                'id' => $message->id,
                'sender_type' => $message->sender_type,
                'content' => $message->content,
                'created_at' => $message->created_at?->toIso8601String(),
                'attachments' => ChatAttachmentFormatter::forMessage($message),
            ],
        ]);
    }
}
