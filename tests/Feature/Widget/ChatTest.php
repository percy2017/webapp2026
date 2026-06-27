<?php

use App\Models\Chat;
use App\Models\ChatMessage;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\getJson;
use function Pest\Laravel\postJson;
use function Pest\Laravel\seed;

beforeEach(function () {
    seed(DatabaseSeeder::class);
});

it('requires authentication to view widget chat', function () {
    getJson('/widget/chat')->assertStatus(401);
});

it('returns existing chat for authenticated user', function () {
    $user = User::factory()->create();
    $chat = Chat::factory()->for($user)->create();
    ChatMessage::create([
        'chat_id' => $chat->id,
        'sender_id' => $user->id,
        'sender_type' => 'visitor',
        'content' => 'Hola',
    ]);

    actingAs($user)
        ->getJson('/widget/chat')
        ->assertOk()
        ->assertJsonPath('chat.id', $chat->id)
        ->assertJsonCount(1, 'chat.messages');
});

it('creates a new chat if user does not have one', function () {
    $user = User::factory()->create();

    expect(Chat::where('user_id', $user->id)->exists())->toBeFalse();

    actingAs($user)
        ->getJson('/widget/chat')
        ->assertOk();

    expect(Chat::where('user_id', $user->id)->exists())->toBeTrue();
});

it('allows visitor to send a message', function () {
    $user = User::factory()->create();

    actingAs($user)
        ->postJson('/widget/chat/messages', [
            'content' => 'Hola desde el widget',
        ])
        ->assertOk()
        ->assertJsonPath('message.sender_type', 'visitor')
        ->assertJsonPath('message.content', 'Hola desde el widget');

    $chat = Chat::where('user_id', $user->id)->first();
    expect($chat)->not->toBeNull();
    expect($chat->messages()->count())->toBe(1);
});

it('requires content or attachments', function () {
    $user = User::factory()->create();

    actingAs($user)
        ->from('/')
        ->post('/widget/chat/messages', [])
        ->assertSessionHasErrors(['content']);
});

it('rejects unauthenticated visitor sends', function () {
    postJson('/widget/chat/messages', [
        'content' => 'spam',
    ])->assertStatus(401);
});
