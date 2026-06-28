<?php

namespace App\Http\Controllers\Admin;

use App\Events\ChatMessageSent;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SendChatMessageRequest;
use App\Http\Requests\Admin\UpdateChatStatusRequest;
use App\Models\Chat;
use App\Models\ChatMessage;
use App\Models\MediaHolder;
use App\Support\ChatAttachmentFormatter;
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
            // The User accessor already falls back from
            // `avatar_media_id` (direct FK set by the user create/edit
            // form) to the Spatie `avatar` collection. Using the
            // accessor avoids the bug where users saved through the
            // user form had an avatar but the chat list showed their
            // initials because we only checked the Spatie collection.
            $chat->user_avatar_url = $chat->user?->avatar_url;
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

        $chat->load(['user:id,name,email', 'messages.sender.media']);
        $chat->user_avatar_url = $chat->user?->avatar_url;

        $messages = $chat->messages->map(function (ChatMessage $message) {
            return [
                'id' => $message->id,
                'sender_id' => $message->sender_id,
                'sender_type' => $message->sender_type,
                'sender_name' => $message->sender?->name,
                'sender_avatar_url' => $message->sender?->getFirstMedia('avatar')?->getUrl(),
                'content' => $message->content,
                'created_at' => $message->created_at?->toIso8601String(),
                'attachments' => ChatAttachmentFormatter::forMessage($message),
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
        $chat->load(['messages' => fn ($q) => $q->orderBy('id'), 'messages.sender.media']);

        $messages = $chat->messages->map(function (ChatMessage $message) {
            return [
                'id' => $message->id,
                'sender_id' => $message->sender_id,
                'sender_type' => $message->sender_type,
                'sender_name' => $message->sender?->name,
                'sender_avatar_url' => $message->sender?->getFirstMedia('avatar')?->getUrl(),
                'content' => $message->content,
                'created_at' => $message->created_at?->toIso8601String(),
                'attachments' => ChatAttachmentFormatter::forMessage($message),
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
        $uploadedMediaIds = [];

        // Raw uploads (still supported as a fallback): each upload creates
        // one Media row in the default MediaHolder collection, then we
        // remember its id so the message keeps a reference (no copy).
        if ($request->hasFile('attachments')) {
            $holder = MediaHolder::firstOrCreate(['name' => 'default']);
            foreach ($request->file('attachments') as $file) {
                $media = $holder->addMediaFromRequest('attachments')->toMediaCollection();
                $uploadedMediaIds[] = $media->id;
            }
        }

        // Media picked from the library OR just uploaded — keep only the
        // id list on the message so the Media library stays the single
        // source of truth. We no longer copy files into the message's
        // own collection, which means:
        //   - no duplicate rows on every send
        //   - deleting a Media library item cleanly removes it from chat
        //   - the FlatPathGenerator collisions from earlier are gone
        $pickedIds = $request->input('media_ids', []);
        $mediaIds = array_values(array_unique(array_merge($uploadedMediaIds, $pickedIds)));

        $message = ChatMessage::create([
            'chat_id' => $chat->id,
            'sender_id' => $request->user()->id,
            'sender_type' => 'agent',
            'content' => $request->input('content'),
            'media_ids' => $mediaIds,
        ]);

        $chat->update([
            'last_message_at' => $message->created_at,
            'status' => 'open',
        ]);

        ChatMessageSent::dispatch($message->loadMissing('sender.media'));

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

        // Delete messages explicitly (instead of relying on DB-level
        // cascadeOnDelete) so Spatie's media-cleanup hooks fire and the
        // attachment files on disk are removed too. If we just called
        // $chat->delete(), SQLite/MySQL would wipe the chat_messages rows
        // directly and skip Eloquent events — leaving orphaned media rows
        // and orphaned files in storage/app/public/.
        $chat->messages()->each(function (ChatMessage $message): void {
            $message->delete();
        });

        $chat->delete();

        return redirect()->route('chat-live.chats.index')
            ->with('success', 'Chat eliminado.');
    }
}
