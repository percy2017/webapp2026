<?php

namespace App\Events;

use App\Models\Chat;
use App\Models\PushSubscription;
use App\Models\User;
use App\Services\WebPushService;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class ChatCreated implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(public Chat $chat) {}

    /**
     * Admin-only public channel. Every logged-in admin receives the event so
     * the admin layout can pop a desktop notification even when the admin
     * isn't on the chat-live page.
     */
    public function broadcastOn(): array
    {
        return [new Channel('admin.chats')];
    }

    public function broadcastAs(): string
    {
        return 'chat.created';
    }

    public function broadcastWith(): array
    {
        $chat = $this->chat->loadMissing('user');
        $firstMessage = $chat->messages()->latest('id')->first();

        return [
            'id' => $chat->id,
            'user' => $chat->user ? [
                'id' => $chat->user->id,
                'name' => $chat->user->name,
                'email' => $chat->user->email,
                'avatar_url' => $chat->user->getFirstMedia('avatar')?->getUrl(),
            ] : null,
            'status' => $chat->status,
            'preview' => $firstMessage?->content
                ?? ($firstMessage?->media_ids ? '📎 Archivo adjunto' : 'Sin mensajes aún'),
            'created_at' => $chat->created_at?->toIso8601String(),
        ];
    }

    /**
     * Fire Web Push notifications to every admin that subscribed. This
     * runs after the broadcast reaches the live Echo listeners and is the
     * path that delivers notifications while the PWA is CLOSED — the
     * browser's push service wakes up the service worker.
     */
    public function dispatchWebPush(): void
    {
        if (! $this->chat->user) {
            return;
        }

        $chat = $this->chat->loadMissing('user');
        $preview = $chat->messages()->latest('id')->value('content')
            ?: 'Tenés un mensaje nuevo.';

        $payload = json_encode([
            'title' => 'Nuevo chat de '.$chat->user->name,
            'body' => $preview,
            'icon' => '/pwa-icons/icon-192.png',
            'badge' => '/pwa-icons/icon-192.png',
            'tag' => 'admin-chat-'.$chat->id,
            'url' => '/admin/chat-live/chats/'.$chat->id,
        ], JSON_UNESCAPED_UNICODE);

        try {
            $service = app(WebPushService::class);
        } catch (RuntimeException $e) {
            // WebPush isn't configured (no VAPID keys). Skip silently.
            Log::debug('WebPush skipped: '.$e->getMessage());

            return;
        }

        // Find every admin user that has at least one push subscription
        // and send to each endpoint.
        $adminIds = $chat->user_id === null
            ? collect()
            : User::role('admin')->pluck('id');

        $subscriptions = PushSubscription::query()
            ->whereIn('user_id', $adminIds)
            ->get();

        foreach ($subscriptions as $subscription) {
            $ok = $service->send($subscription, $payload, ttl: 60 * 5);
            if (! $ok) {
                // Push service rejected (404/410) — drop the stale endpoint
                // so we don't keep retrying it on every new chat.
                $subscription->delete();
            }
        }
    }
}
