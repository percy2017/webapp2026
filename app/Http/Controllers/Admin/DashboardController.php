<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\ChatMessage;
use App\Models\SiteSetting;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $now = now();
        $today = $now->copy()->startOfDay();

        $totalMessages = ChatMessage::count();
        $todayMessages = ChatMessage::where('created_at', '>=', $today)->count();
        $totalChats = Chat::count();
        $openChats = Chat::where('status', 'open')->count();
        $unreadMessages = ChatMessage::where('sender_type', 'visitor')
            ->whereNull('read_at')
            ->count();

        $hourly = [];
        for ($i = 23; $i >= 0; $i--) {
            $hour = $today->copy()->addHours($i);
            $count = ChatMessage::whereBetween('created_at', [
                $hour->copy(),
                $hour->copy()->addHour(),
            ])->count();
            $hourly[] = [
                'hour' => $hour->format('H:00'),
                'count' => $count,
            ];
        }
        $peakHour = collect($hourly)->sortByDesc('count')->first();

        $socketRunning = $this->reverbIsRunning();

        return Inertia::render('admin', [
            'socket' => [
                'status' => $socketRunning ? 'connected' : 'disconnected',
                'host' => config('broadcasting.connections.reverb.options.host'),
                'port' => config('broadcasting.connections.reverb.options.port'),
                'scheme' => config('broadcasting.connections.reverb.options.scheme'),
            ],
            'metrics' => [
                'total_messages' => $totalMessages,
                'today_messages' => $todayMessages,
                'total_chats' => $totalChats,
                'open_chats' => $openChats,
                'unread' => $unreadMessages,
                'peak_hour' => $peakHour['hour'] ?? null,
                'peak_hour_count' => $peakHour['count'] ?? 0,
            ],
            'hourly' => $hourly,
            'site_card' => $this->siteCard(),
        ]);
    }

    /**
     * Snapshot of the public site used by the "Tu tarjeta digital" card on
     * the dashboard: the canonical URL to share, the active template name,
     * and the configured site name. Defaults to the app URL if no settings
     * row exists yet.
     *
     * @return array{url: string, template: string|null, site_name: string}
     */
    private function siteCard(): array
    {
        $settings = SiteSetting::instance();

        return [
            'url' => URL::to('/'),
            'template' => $settings->active_template_slug,
            'site_name' => (string) ($settings->site_name ?: config('app.name', 'WebApp')),
        ];
    }

    private function reverbIsRunning(): bool
    {
        $sock = @stream_socket_client(
            'tcp://127.0.0.1:3001',
            $errno,
            $errstr,
            0.3,
        );

        if ($sock === false) {
            return false;
        }

        fclose($sock);

        return true;
    }
}
