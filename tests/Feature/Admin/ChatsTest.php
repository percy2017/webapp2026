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

it('renders the chats page for authenticated users', function () {
    $user = User::factory()->create();
    Chat::factory()->for($user)->create();

    actingAs($user)
        ->get('/admin/chat-live/chats')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('chat-live/chats/index')
            ->has('chats.data'));
});

it('redirects guests to login', function () {
    get('/admin/chat-live/chats')->assertRedirect('/login');
});

it('shows chat detail with messages', function () {
    $user = User::factory()->create();
    $chat = Chat::factory()->for($user)->create();

    actingAs($user)
        ->get("/admin/chat-live/chats/{$chat->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('chat-live/chats/index')
            ->has('activeChat')
            ->where('activeChat.id', $chat->id));
});

it('marks visitor messages as read on view', function () {
    $user = User::factory()->create();
    $chat = Chat::factory()->for($user)->create();
    $visitorMsg = $chat->messages()->create([
        'sender_id' => $user->id,
        'sender_type' => 'visitor',
        'content' => 'Hola',
    ]);
    expect($visitorMsg->fresh()->read_at)->toBeNull();

    actingAs($user)->get("/admin/chat-live/chats/{$chat->id}");

    expect($visitorMsg->fresh()->read_at)->not->toBeNull();
});

it('allows any authenticated user to send messages to a chat', function () {
    $owner = User::factory()->create();
    $agent = User::factory()->create();
    $chat = Chat::factory()->for($owner)->create();

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
    $owner = User::factory()->create();
    $agent = User::factory()->create();
    $chat = Chat::factory()->for($owner)->create(['last_message_at' => null]);

    actingAs($agent)
        ->post("/admin/chat-live/chats/{$chat->id}/messages", [
            'content' => 'Respuesta',
        ]);

    expect($chat->fresh()->last_message_at)->not->toBeNull();
});
