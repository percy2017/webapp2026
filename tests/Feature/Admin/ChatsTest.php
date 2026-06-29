<?php

use App\Models\Chat;
use App\Models\MediaHolder;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

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

it('shows the latest text content as the sidebar preview', function () {
    // Plain text latest message → preview is the text itself, not "Sin
    // mensajes aún". Regression guard for the dedicated previewText()
    // helper, which used to be a fragile inline expression that lost
    // media-only messages.
    $admin = makeAdmin();
    $visitor = User::factory()->create();
    $chat = Chat::factory()->for($visitor)->create();
    $chat->messages()->create([
        'sender_id' => $visitor->id,
        'sender_type' => 'visitor',
        'content' => 'Probando el chat hace días',
    ]);

    actingAs($admin)
        ->get('/admin/chat-live/chats')
        ->assertInertia(fn ($page) => $page
            ->where('chats.data.0.preview', 'Probando el chat hace días'));
});

it('shows the media-only latest message in the sidebar preview', function () {
    // Regression: a visitor sending just an image (text empty, content
    // of media_ids filled) was being shown as "Sin mensajes aún"
    // because the old transform() only checked `content` and the
    // legacy Spatie `attachments` collection, NOT the new media_ids
    // references.
    $admin = makeAdmin();
    $visitor = User::factory()->create();
    $chat = Chat::factory()->for($visitor)->create();
    $chat->messages()->create([
        'sender_id' => $visitor->id,
        'sender_type' => 'visitor',
        'content' => null,
        // `media_ids` is a real `chat_messages.media_ids` JSON column;
        // an empty array is enough to trigger the preview fallback.
        'media_ids' => [],
    ]);

    // Insert a real MediaHolder + Media so the preview resolver has
    // something to count via referencedMedia(). Keep id references
    // consistent with what the front-end saves today.
    $holder = MediaHolder::firstOrCreate(['name' => 'default']);
    // Spatie's `media` table has a NOT NULL `manipulations` JSON column
    // (and others) that `Model::create()` won't auto-fill — use the
    // Spatie factory if available, otherwise hand-build the row with
    // every required column.
    $media = Media::create([
        'model_type' => MediaHolder::class,
        'model_id' => $holder->id,
        'collection_name' => 'default',
        'name' => 'fake',
        'file_name' => 'img.png',
        'mime_type' => 'image/png',
        'disk' => 'public',
        'size' => 1,
        'manipulations' => [],
        'custom_properties' => [],
        'generated_conversions' => [],
        'responsive_images' => [],
        'order_column' => 1,
    ]);
    $chat->messages()->latest('id')->first()->update([
        'media_ids' => [$media->id],
    ]);

    actingAs($admin)
        ->get('/admin/chat-live/chats')
        ->assertInertia(fn ($page) => $page
            ->where('chats.data.0.preview', '🖼️ Archivo adjunto'));
});
