<?php

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

use function Pest\Laravel\postJson;
use function Pest\Laravel\seed;

beforeEach(function () {
    seed(DatabaseSeeder::class);
});

it('logs in with valid credentials and returns user', function () {
    User::factory()->create([
        'email' => 'juan@example.com',
        'password' => Hash::make('secret123'),
    ]);

    postJson('/widget/auth/login', [
        'email' => 'juan@example.com',
        'password' => 'secret123',
    ])
        ->assertOk()
        ->assertJsonPath('user.email', 'juan@example.com');
});

it('rejects invalid credentials', function () {
    postJson('/widget/auth/login', [
        'email' => 'no@example.com',
        'password' => 'wrong',
    ])->assertJsonValidationErrors(['email']);
});

it('registers a new user without password and assigns user role', function () {
    postJson('/widget/auth/register', [
        'name' => 'Nuevo Visitante',
        'email' => 'nuevo@example.com',
        'phone' => '+5491155554444',
    ])
        ->assertOk()
        ->assertJsonPath('user.email', 'nuevo@example.com')
        ->assertJsonPath('user.phone', '+5491155554444');

    $user = User::where('email', 'nuevo@example.com')->first();

    expect($user)->not->toBeNull();
    expect($user->hasRole('user'))->toBeTrue();
    expect($user->email_verified_at)->toBeNull();
    expect($user->password)->not->toBeNull();
});

it('does not auto-verify email on widget register', function () {
    postJson('/widget/auth/register', [
        'name' => 'Sin Verificar',
        'email' => 'unverified@example.com',
        'phone' => '+5491100000000',
    ])->assertOk();

    $user = User::where('email', 'unverified@example.com')->first();

    expect($user->email_verified_at)->toBeNull();
});

it('validates unique email on register', function () {
    User::factory()->create(['email' => 'taken@example.com']);

    postJson('/widget/auth/register', [
        'name' => 'Otro',
        'email' => 'taken@example.com',
        'phone' => '+5491100001111',
    ])->assertJsonValidationErrors(['email']);
});

it('requires phone on register', function () {
    postJson('/widget/auth/register', [
        'name' => 'Sin teléfono',
        'email' => 'nophone@example.com',
    ])->assertJsonValidationErrors(['phone']);
});

it('validates phone format on register', function () {
    postJson('/widget/auth/register', [
        'name' => 'Con letras',
        'email' => 'letters@example.com',
        'phone' => 'abc123',
    ])->assertJsonValidationErrors(['phone']);
});

it('logs out authenticated user', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    postJson('/widget/auth/logout')
        ->assertOk()
        ->assertJsonPath('ok', true);
});

it('assigns only the user role on register (not admin)', function () {
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

    postJson('/widget/auth/register', [
        'name' => 'Visitor',
        'email' => 'visitor@example.com',
        'phone' => '+5491111111111',
    ])->assertOk();

    $user = User::where('email', 'visitor@example.com')->first();

    expect($user->hasRole('user'))->toBeTrue();
    expect($user->hasRole('admin'))->toBeFalse();
});
