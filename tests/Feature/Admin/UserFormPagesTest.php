<?php

use App\Models\MediaHolder;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Permission\Models\Role;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;
use function Pest\Laravel\seed;

beforeEach(function () {
    seed(DatabaseSeeder::class);
    Storage::fake('public');
});

function adminUser(): User
{
    $admin = User::where('email', 'admin@admin.com')->first();
    $admin->givePermissionTo('manage-users');

    return $admin;
}

it('renders the create user page', function () {
    actingAs(adminUser())
        ->get('/admin/users/create')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('users/create')
            ->has('roles'));
});

it('renders the edit user page', function () {
    $user = User::factory()->create();

    actingAs(adminUser())
        ->get("/admin/users/{$user->id}/edit")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('users/edit')
            ->where('user.id', $user->id)
            ->has('roles'));
});

it('creates a user with media_id from library', function () {
    $holder = MediaHolder::firstOrCreate(['name' => 'default']);
    $media = $holder
        ->addMedia(UploadedFile::fake()->image('avatar.jpg'))
        ->toMediaCollection();

    actingAs(adminUser())
        ->post('/admin/users', [
            'name' => 'Maria',
            'email' => 'maria@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '+5491112345678',
            'media_id' => $media->id,
        ])
        ->assertRedirect('/admin/users')
        ->assertSessionHas('success');

    $user = User::where('email', 'maria@example.com')->first();
    expect($user)->not->toBeNull();
    expect($user->avatar_media_id)->toBe($media->id);
    expect($user->avatar_url)->not->toBeNull();
    expect($user->phone)->toBe('+5491112345678');
});

it('updates a user using media_id from library', function () {
    $admin = adminUser();
    $user = User::factory()->create(['name' => 'Original']);

    $holder = MediaHolder::firstOrCreate(['name' => 'default']);
    $media = $holder
        ->addMedia(UploadedFile::fake()->image('pic.jpg'))
        ->toMediaCollection();

    actingAs($admin)
        ->patch("/admin/users/{$user->id}", [
            'name' => 'Actualizado',
            'email' => $user->email,
            'media_id' => $media->id,
        ])
        ->assertRedirect('/admin/users');

    expect($user->fresh()->name)->toBe('Actualizado');
    expect($user->fresh()->avatar_media_id)->toBe($media->id);
});

it('removes avatar when remove_avatar is true', function () {
    $admin = adminUser();
    $user = User::factory()->create();
    $holder = MediaHolder::firstOrCreate(['name' => 'default']);
    $media = $holder
        ->addMedia(UploadedFile::fake()->image('old.jpg'))
        ->toMediaCollection();
    $user->update(['avatar_media_id' => $media->id]);

    expect($user->fresh()->avatar_media_id)->toBe($media->id);

    actingAs($admin)
        ->patch("/admin/users/{$user->id}", [
            'name' => $user->name,
            'email' => $user->email,
            'remove_avatar' => true,
        ])
        ->assertRedirect('/admin/users');

    expect($user->fresh()->avatar_media_id)->toBeNull();
});

it('does not create a new media entry when assigning an avatar', function () {
    $admin = adminUser();
    $holder = MediaHolder::firstOrCreate(['name' => 'default']);
    $media = $holder
        ->addMedia(UploadedFile::fake()->image('one.jpg'))
        ->toMediaCollection();

    $mediaCountBefore = Media::count();

    $user = User::factory()->create();

    actingAs($admin)
        ->patch("/admin/users/{$user->id}", [
            'name' => $user->name,
            'email' => $user->email,
            'media_id' => $media->id,
        ])
        ->assertRedirect('/admin/users');

    expect(Media::count())
        ->toBe($mediaCountBefore);
    expect($user->fresh()->avatar_media_id)->toBe($media->id);
});

it('forbids non-admin users from create page', function () {
    $user = User::factory()->create();
    Role::firstOrCreate(['name' => 'user']);

    actingAs($user)
        ->get('/admin/users/create')
        ->assertForbidden();
});

it('redirects guests from create page', function () {
    get('/admin/users/create')->assertRedirect('/login');
});
