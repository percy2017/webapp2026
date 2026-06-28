<?php

use App\Models\ChatWidgetSetting;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Spatie\Permission\Models\Role;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\seed;

beforeEach(function () {
    seed(DatabaseSeeder::class);
});

// Helper: return the default admin user with the `admin` role assigned
// (the DatabaseSeeder creates the user but we re-assign the role here
// defensively in case prior tests cached a stale role state).
function adminChatConfigUser(): User
{
    $admin = User::where('email', 'admin@admin.com')->firstOrFail();
    $admin->assignRole('admin');

    return $admin;
}

it('renders the configuration page for admins', function () {
    actingAs(adminChatConfigUser())
        ->get('/admin/chat-live/configuration')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('chat-live/configuration/index')
            ->has('settings'));
});

it('forbids non-admin users from viewing configuration', function () {
    $user = User::factory()->create();
    Role::firstOrCreate(['name' => 'user']);

    actingAs($user)
        ->get('/admin/chat-live/configuration')
        ->assertForbidden();
});

it('allows admin to update widget settings', function () {
    actingAs(adminChatConfigUser())
        ->patch('/admin/chat-live/configuration', [
            'enabled' => false,
            'position' => 'top-right',
            'primary_color' => '#ff0000',
            'welcome_message' => 'Hola!',
            'offline_message' => 'Fuera de horario',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $settings = ChatWidgetSetting::current();
    expect($settings->enabled)->toBeFalse();
    expect($settings->position)->toBe('top-right');
    expect($settings->primary_color)->toBe('#ff0000');
    expect($settings->welcome_message)->toBe('Hola!');
});

it('validates position value', function () {
    actingAs(adminChatConfigUser())
        ->patch('/admin/chat-live/configuration', [
            'enabled' => true,
            'position' => 'invalid',
            'primary_color' => '#000',
            'welcome_message' => 'a',
            'offline_message' => 'b',
        ])
        ->assertSessionHasErrors('position');
});

it('shares chatWidgetSettings with all inertia pages', function () {
    actingAs(adminChatConfigUser())
        ->get('/admin')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('chatWidgetSettings')
            ->has('chatWidgetSettings.enabled'));
});
