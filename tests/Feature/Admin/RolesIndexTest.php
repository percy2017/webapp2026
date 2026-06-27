<?php

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;
use function Pest\Laravel\seed;

beforeEach(function () {
    seed(DatabaseSeeder::class);
});

it('renders the roles index page for admin', function () {
    $admin = User::where('email', 'admin@admin.com')->first();
    $admin->givePermissionTo('manage-roles');

    actingAs($admin)
        ->get('/admin/roles')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('roles/index')
            ->has('roles')
            ->has('permissions'));
});

it('forbids users without manage-roles permission', function () {
    $user = User::factory()->create();

    actingAs($user)
        ->get('/admin/roles')
        ->assertForbidden();
});

it('creates a role with permissions', function () {
    $admin = User::where('email', 'admin@admin.com')->first();
    $admin->givePermissionTo('manage-roles');
    Permission::firstOrCreate(['name' => 'edit-posts', 'guard_name' => 'web']);

    actingAs($admin)
        ->post('/admin/roles', [
            'name' => 'editor',
            'permissions' => ['edit-posts'],
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $role = Role::where('name', 'editor')->first();
    expect($role)->not->toBeNull();
    expect($role->hasPermissionTo('edit-posts'))->toBeTrue();
});

it('rejects duplicate role name', function () {
    $admin = User::where('email', 'admin@admin.com')->first();
    $admin->givePermissionTo('manage-roles');

    actingAs($admin)
        ->post('/admin/roles', ['name' => 'admin'])
        ->assertSessionHasErrors('name');
});

it('updates a role name and permissions', function () {
    $admin = User::where('email', 'admin@admin.com')->first();
    $admin->givePermissionTo('manage-roles');
    $role = Role::firstOrCreate(['name' => 'writer', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'publish', 'guard_name' => 'web']);

    actingAs($admin)
        ->patch("/admin/roles/{$role->id}", [
            'name' => 'author',
            'permissions' => ['publish'],
        ])
        ->assertRedirect();

    $role->refresh();
    expect($role->name)->toBe('author');
    expect($role->hasPermissionTo('publish'))->toBeTrue();
});

it('deletes a role', function () {
    $admin = User::where('email', 'admin@admin.com')->first();
    $admin->givePermissionTo('manage-roles');
    $role = Role::firstOrCreate(['name' => 'temp', 'guard_name' => 'web']);

    actingAs($admin)
        ->delete("/admin/roles/{$role->id}")
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(Role::find($role->id))->toBeNull();
});

it('redirects guests to login', function () {
    get('/admin/roles')->assertRedirect('/login');
});
