<?php

namespace App\Http\Controllers\Widget;

use App\Events\ChatMessageSent;
use App\Http\Controllers\Controller;
use App\Http\Requests\Widget\SendChatMessageRequest;
use App\Models\Chat;
use App\Models\ChatMessage;
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

        $chat->load(['messages.sender.media', 'messages.media']);

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
                    'attachments' => $message->getMedia('attachments')->map(fn ($media) => [
                        'id' => $media->id,
                        'name' => $media->name,
                        'file_name' => $media->file_name,
                        'mime_type' => $media->mime_type,
                        'size' => $media->size,
                        'url' => $media->getUrl(),
                    ])->all(),
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

        $message = ChatMessage::create([
            'chat_id' => $chat->id,
            'sender_id' => $user->id,
            'sender_type' => 'visitor',
            'content' => $request->input('content'),
        ]);

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $message->addMedia($file)->toMediaCollection('attachments');
            }
        }

        $chat->update(['last_message_at' => $message->created_at]);

        ChatMessageSent::dispatch($message->loadMissing('sender.media', 'media'));

        return response()->json([
            'message' => [
                'id' => $message->id,
                'sender_type' => $message->sender_type,
                'content' => $message->content,
                'created_at' => $message->created_at?->toIso8601String(),
                'attachments' => $message->getMedia('attachments')->map(fn ($media) => [
                    'id' => $media->id,
                    'name' => $media->name,
                    'file_name' => $media->file_name,
                    'mime_type' => $media->mime_type,
                    'size' => $media->size,
                    'url' => $media->getUrl(),
                ])->all(),
            ],
        ]);
    }
}
