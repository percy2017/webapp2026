<?php

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;
use function Pest\Laravel\seed;

beforeEach(function () {
    seed(DatabaseSeeder::class);
    Storage::fake('public');
});

it('renders the users index page for admin', function () {
    $admin = User::where('email', 'admin@admin.com')->first();
    $admin->givePermissionTo('manage-users');

    actingAs($admin)
        ->get('/admin/users')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('users/index')
            ->has('users.data')
            ->has('roles'));
});

it('forbids non-admin users without permission', function () {
    $user = User::factory()->create();

    actingAs($user)
        ->get('/admin/users')
        ->assertForbidden();
});

it('redirects guests to login', function () {
    get('/admin/users')->assertRedirect('/login');
});

it('searches users by name email or phone', function () {
    $admin = User::where('email', 'admin@admin.com')->first();
    $admin->givePermissionTo('manage-users');

    User::factory()->create(['name' => 'Juan Perez', 'phone' => '+1234567890']);
    User::factory()->create(['name' => 'Maria Lopez', 'phone' => '+0987654321']);

    actingAs($admin)
        ->get('/admin/users?search=juan')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('users.data', 1)
            ->where('users.data.0.name', 'Juan Perez'));
});

it('updates user basic fields', function () {
    $admin = User::where('email', 'admin@admin.com')->first();
    $admin->givePermissionTo('manage-users');
    $user = User::factory()->create(['name' => 'Old Name', 'phone' => null]);

    actingAs($admin)
        ->patch("/admin/users/{$user->id}", [
            'name' => 'New Name',
            'email' => $user->email,
            'phone' => '+1111111111',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $user->refresh();
    expect($user->name)->toBe('New Name');
    expect($user->phone)->toBe('+1111111111');
});

it('uploads an avatar when updating user', function () {
    $admin = User::where('email', 'admin@admin.com')->first();
    $admin->givePermissionTo('manage-users');
    $user = User::factory()->create();

    actingAs($admin)
        ->post(route('users.update', $user), [
            '_method' => 'PATCH',
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => UploadedFile::fake()->image('me.png'),
        ], ['force_form_data' => true])
        ->assertRedirect();

    expect($user->fresh()->getFirstMedia('avatar'))->not->toBeNull();
});

it('replaces existing avatar on new upload', function () {
    $admin = User::where('email', 'admin@admin.com')->first();
    $admin->givePermissionTo('manage-users');
    $user = User::factory()->create();
    $user->addMedia(UploadedFile::fake()->image('first.png'))
        ->toMediaCollection('avatar');

    expect($user->getMedia('avatar')->count())->toBe(1);

    actingAs($admin)
        ->post(route('users.update', $user), [
            '_method' => 'PATCH',
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => UploadedFile::fake()->image('second.png'),
        ], ['force_form_data' => true])
        ->assertRedirect();

    expect($user->fresh()->getMedia('avatar')->count())->toBe(1);
});

it('syncs roles when updating user', function () {
    $admin = User::where('email', 'admin@admin.com')->first();
    $admin->givePermissionTo('manage-users');
    $user = User::factory()->create();
    $role = Role::firstOrCreate(['name' => 'editor', 'guard_name' => 'web']);

    actingAs($admin)
        ->patch("/admin/users/{$user->id}", [
            'name' => $user->name,
            'email' => $user->email,
            'roles' => ['editor'],
        ])
        ->assertRedirect();

    expect($user->fresh()->hasRole('editor'))->toBeTrue();
});

it('updates user password when provided', function () {
    $admin = User::where('email', 'admin@admin.com')->first();
    $admin->givePermissionTo('manage-users');
    $user = User::factory()->create();

    actingAs($admin)
        ->patch("/admin/users/{$user->id}", [
            'name' => $user->name,
            'email' => $user->email,
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(password_verify('NewPassword123!', $user->fresh()->password))->toBeTrue();
});

it('keeps current password when not provided in update', function () {
    $admin = User::where('email', 'admin@admin.com')->first();
    $admin->givePermissionTo('manage-users');
    $user = User::factory()->create();
    $originalHash = $user->password;

    actingAs($admin)
        ->patch("/admin/users/{$user->id}", [
            'name' => $user->name,
            'email' => $user->email,
        ])
        ->assertRedirect();

    expect($user->fresh()->password)->toBe($originalHash);
});

it('accepts password update without confirmation field', function () {
    $admin = User::where('email', 'admin@admin.com')->first();
    $admin->givePermissionTo('manage-users');
    $user = User::factory()->create();

    actingAs($admin)
        ->patch("/admin/users/{$user->id}", [
            'name' => $user->name,
            'email' => $user->email,
            'password' => 'NewPassword123!',
        ])
        ->assertRedirect();

    expect(password_verify('NewPassword123!', $user->fresh()->password))->toBeTrue();
});

it('rejects update with duplicate email', function () {
    $admin = User::where('email', 'admin@admin.com')->first();
    $admin->givePermissionTo('manage-users');
    $existing = User::factory()->create(['email' => 'taken@example.com']);
    $user = User::factory()->create(['email' => 'me@example.com']);

    actingAs($admin)
        ->patch("/admin/users/{$user->id}", [
            'name' => $user->name,
            'email' => 'taken@example.com',
        ])
        ->assertSessionHasErrors('email');
});

it('deletes a user', function () {
    $admin = User::where('email', 'admin@admin.com')->first();
    $admin->givePermissionTo('manage-users');
    $user = User::factory()->create();

    actingAs($admin)
        ->delete("/admin/users/{$user->id}")
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(User::find($user->id))->toBeNull();
});

it('creates a new user with password and role', function () {
    $admin = User::where('email', 'admin@admin.com')->first();
    $admin->givePermissionTo('manage-users');
    Role::firstOrCreate(['name' => 'editor', 'guard_name' => 'web']);

    actingAs($admin)
        ->post('/admin/users', [
            'name' => 'Nuevo Usuario',
            'email' => 'nuevo@example.com',
            'phone' => '+1234567890',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'roles' => ['editor'],
        ])
        ->assertRedirect(route('users.index'))
        ->assertSessionHas('success');

    $user = User::where('email', 'nuevo@example.com')->first();
    expect($user)->not->toBeNull();
    expect($user->name)->toBe('Nuevo Usuario');
    expect($user->phone)->toBe('+1234567890');
    expect($user->hasRole('editor'))->toBeTrue();
});

it('rejects user creation with duplicate email', function () {
    $admin = User::where('email', 'admin@admin.com')->first();
    $admin->givePermissionTo('manage-users');
    User::factory()->create(['email' => 'taken@example.com']);

    actingAs($admin)
        ->post('/admin/users', [
            'name' => 'Test',
            'email' => 'taken@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ])
        ->assertSessionHasErrors('email');
});

it('rejects user creation when password is too weak', function () {
    $admin = User::where('email', 'admin@admin.com')->first();
    $admin->givePermissionTo('manage-users');

    actingAs($admin)
        ->post('/admin/users', [
            'name' => 'Test',
            'email' => 'test@example.com',
            'password' => '123',
            'password_confirmation' => '123',
        ])
        ->assertSessionHasErrors('password');
});

it('accepts user creation without confirmation field', function () {
    $admin = User::where('email', 'admin@admin.com')->first();
    $admin->givePermissionTo('manage-users');

    actingAs($admin)
        ->post('/admin/users', [
            'name' => 'Test',
            'email' => 'test@example.com',
            'password' => 'Password123!',
        ])
        ->assertRedirect();

    expect(User::where('email', 'test@example.com')->exists())->toBeTrue();
});

it('forbids user creation without permission', function () {
    $user = User::factory()->create();

    actingAs($user)
        ->post('/admin/users', [
            'name' => 'Test',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ])
        ->assertForbidden();
});
