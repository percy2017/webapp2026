<?php

use App\Listeners\AssignAdminRoleOnFirstRegistration;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Auth\Events\Registered;
use Spatie\Permission\Models\Role;

use function Pest\Laravel\seed;

beforeEach(function () {
    seed(DatabaseSeeder::class);
});

it('assigns admin role to the first registered user when no admin exists', function () {
    Role::where('name', 'admin')->delete();
    DB::table('model_has_roles')->truncate();

    $user = User::factory()->create(['email' => 'first@example.com']);

    event(new Registered($user));

    expect($user->fresh()->hasRole('admin'))->toBeTrue();
});

it('does not assign admin role when an admin already exists', function () {
    $existing = User::factory()->create(['email' => 'existing-admin@admin.com']);
    $existing->assignRole('admin');

    $newUser = User::factory()->create(['email' => 'second@example.com']);

    event(new Registered($newUser));

    expect($newUser->fresh()->hasRole('admin'))->toBeFalse();
});

it('assigns admin role via the listener directly', function () {
    $listener = new AssignAdminRoleOnFirstRegistration;

    Role::where('name', 'admin')->delete();
    DB::table('model_has_roles')->truncate();

    $user = User::factory()->create();

    $listener->handle(new Registered($user));

    expect($user->fresh()->hasRole('admin'))->toBeTrue();
});
