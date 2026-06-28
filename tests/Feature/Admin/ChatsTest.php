<?php

use App\Models\Chat;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;
use function Pest\Laravel\seed;

beforeEach(function () {
    seed(DatabaseSeeder::class);
});

// Helper: create a User that already has the `admin` role so it can
// reach /admin/* routes (the admin gate is `role:admin`).
function makeAdmin(array $attrs = []): User
{
    $user = User::factory()->create($attrs);
    $user->assignRole('admin');

    return $user;
}

it('renders the chats page for authenticated users', function () {
    $admin = makeAdmin();
    $visitor = User::factory()->create();
    Chat::factory()->for($visitor)->create();

    actingAs($admin)
        ->get('/admin/chat-live/chats')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('chat-live/chats/index')
            ->has('chats.data'));
});

it('redirects guests to login', function () {
    get('/admin/chat-live/chats')->assertRedirect('/login');
});

it('forbids non-admin users from reaching admin pages', function () {
    $user = User::factory()->create();
    Chat::factory()->for($user)->create();

    actingAs($user)
        ->get('/admin/chat-live/chats')
        ->assertForbidden();
});

it('shows chat detail with messages', function () {
    $admin = makeAdmin();
    $visitor = User::factory()->create();
    $chat = Chat::factory()->for($visitor)->create();

    actingAs($admin)
        ->get("/admin/chat-live/chats/{$chat->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('chat-live/chats/index')
            ->has('activeChat')
            ->where('activeChat.id', $chat->id));
});

it('marks visitor messages as read on view', function () {
    $admin = makeAdmin();
    $visitor = User::factory()->create();
    $chat = Chat::factory()->for($visitor)->create();
    $visitorMsg = $chat->messages()->create([
        'sender_id' => $visitor->id,
        'sender_type' => 'visitor',
        'content' => 'Hola',
    ]);
    expect($visitorMsg->fresh()->read_at)->toBeNull();

    actingAs($admin)->get("/admin/chat-live/chats/{$chat->id}");

    expect($visitorMsg->fresh()->read_at)->not->toBeNull();
});

it('allows any admin to send messages to a chat', function () {
    $visitor = User::factory()->create();
    $agent = makeAdmin();
    $chat = Chat::factory()->for($visitor)->create();

    actingAs($agent)
        ->post("/admin/chat-live/chats/{$chat->id}/messages", [
            'content' => 'Hola, ¿cómo podemos ayudarte?',
        ])
        ->assertRedirect();

    $message = $chat->messages()->latest('id')->first();
    expect($message->sender_type)->toBe('agent');
    expect($message->sender_id)->toBe($agent->id);
    expect($message->content)->toBe('Hola, ¿cómo podemos ayudarte?');
});

it('updates chat last_message_at when sending a message', function () {
    $visitor = User::factory()->create();
    $agent = makeAdmin();
    $chat = Chat::factory()->for($visitor)->create(['last_message_at' => null]);

    actingAs($agent)
        ->post("/admin/chat-live/chats/{$chat->id}/messages", [
            'content' => 'Respuesta',
        ]);

    expect($chat->fresh()->last_message_at)->not->toBeNull();
});
