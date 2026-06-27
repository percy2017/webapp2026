<?php

namespace App\Http\Controllers\Admin;

use App\Events\ChatMessageSent;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SendChatMessageRequest;
use App\Http\Requests\Admin\UpdateChatStatusRequest;
use App\Models\Chat;
use App\Models\ChatMessage;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    public function index(): Response
    {
        $chats = Chat::with(['user:id,name,email', 'latestMessage'])
            ->withCount(['messages as unread_count' => function ($query) {
                $query->where('sender_type', 'visitor')->whereNull('read_at');
            }])
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->paginate(20);

        $chats->getCollection()->transform(function (Chat $chat) {
            $user = $chat->user;
            $chat->user_avatar_url = $user?->getFirstMedia('avatar')?->getUrl();
            $chat->preview = $chat->latestMessage?->content
                ?? ($chat->latestMessage?->getMedia('attachments')->count()
                    ? '📎 Archivo adjunto'
                    : 'Sin mensajes aún');

            return $chat;
        });

        return Inertia::render('chat-live/chats/index', [
            'chats' => $chats,
        ]);
    }

    public function show(Chat $chat): Response
    {
        ChatMessage::where('chat_id', $chat->id)
            ->where('sender_type', 'visitor')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $chat->load(['user:id,name,email', 'messages.sender.media', 'messages.media']);
        $chat->user_avatar_url = $chat->user?->getFirstMedia('avatar')?->getUrl();

        $messages = $chat->messages->map(function (ChatMessage $message) {
            return [
                'id' => $message->id,
                'sender_id' => $message->sender_id,
                'sender_type' => $message->sender_type,
                'sender_name' => $message->sender?->name,
                'sender_avatar_url' => $message->sender?->getFirstMedia('avatar')?->getUrl(),
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
            ];
        });

        return Inertia::render('chat-live/chats/index', [
            'chats' => Chat::with(['user:id,name,email', 'latestMessage'])
                ->withCount(['messages as unread_count' => function ($query) {
                    $query->where('sender_type', 'visitor')->whereNull('read_at');
                }])
                ->orderByDesc('last_message_at')
                ->orderByDesc('id')
                ->paginate(20),
            'activeChat' => [
                'id' => $chat->id,
                'user' => [
                    'id' => $chat->user->id,
                    'name' => $chat->user->name,
                    'email' => $chat->user->email,
                    'avatar_url' => $chat->user_avatar_url,
                ],
                'status' => $chat->status,
                'messages' => $messages,
            ],
        ]);
    }

    public function poll(Chat $chat)
    {
        $chat->load(['messages' => fn ($q) => $q->orderBy('id')]);

        $messages = $chat->messages->map(function (ChatMessage $message) {
            return [
                'id' => $message->id,
                'sender_id' => $message->sender_id,
                'sender_type' => $message->sender_type,
                'sender_name' => $message->sender?->name,
                'sender_avatar_url' => $message->sender?->getFirstMedia('avatar')?->getUrl(),
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
            ];
        });

        return response()->json([
            'activeChat' => [
                'id' => $chat->id,
                'messages' => $messages,
            ],
        ]);
    }

    public function sendMessage(SendChatMessageRequest $request, Chat $chat)
    {
        $message = ChatMessage::create([
            'chat_id' => $chat->id,
            'sender_id' => $request->user()->id,
            'sender_type' => 'agent',
            'content' => $request->input('content'),
        ]);

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $message->addMedia($file)->toMediaCollection('attachments');
            }
        }

        $chat->update([
            'last_message_at' => $message->created_at,
            'status' => 'open',
        ]);

        ChatMessageSent::dispatch($message->loadMissing('sender.media', 'media'));

        return back();
    }

    public function status(UpdateChatStatusRequest $request, Chat $chat): RedirectResponse
    {
        $chat->update(['status' => $request->validated('status')]);

        return back()->with('success', 'Estado del chat actualizado.');
    }

    public function destroy(Chat $chat): RedirectResponse
    {
        $this->authorize('delete', $chat);

        $chat->delete();

        return redirect()->route('chat-live.chats.index')
            ->with('success', 'Chat eliminado.');
    }
}
