<?php

use App\Models\SiteSetting;
use App\Models\SiteTemplate;
use App\Models\User;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'manage-settings', 'guard_name' => 'web']);
    $this->admin = User::factory()->create();
    $this->admin->givePermissionTo('manage-settings');
    $this->actingAs($this->admin);
});

it('renders the settings edit page', function () {
    $templates = SiteTemplate::factory()->count(2)->create();

    $this->get(route('site-settings.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('site-settings/index')
            ->has('settings')
            ->has('templates', 2)
        );
});

it('updates site settings', function () {
    $this->patch(route('site-settings.update'), [
        'site_name' => 'Mi Sitio',
        'site_tagline' => 'Nuevo eslogan',
        'active_template_slug' => null,
        'contact_info' => [
            'email' => 'info@test.com',
            'phone' => '+54 11 1234',
            'social' => ['twitter' => 'https://x.com/foo'],
        ],
        'default_seo' => [
            'title' => 'SEO Title',
            'description' => 'SEO desc',
        ],
    ])->assertRedirect();

    $settings = SiteSetting::instance()->fresh();
    expect($settings->site_name)->toBe('Mi Sitio');
    expect($settings->site_tagline)->toBe('Nuevo eslogan');
    expect($settings->contact_info['email'])->toBe('info@test.com');
    expect($settings->default_seo['title'])->toBe('SEO Title');
});

it('activating a template via settings flips is_active flags', function () {
    $t1 = SiteTemplate::factory()->create(['slug' => 'uno', 'is_active' => true]);
    $t2 = SiteTemplate::factory()->create(['slug' => 'dos', 'is_active' => false]);

    $this->patch(route('site-settings.update'), [
        'site_name' => 'HostBol',
        'active_template_slug' => 'dos',
    ]);

    expect($t1->fresh()->is_active)->toBeFalse();
    expect($t2->fresh()->is_active)->toBeTrue();
    expect(SiteSetting::instance()->active_template_slug)->toBe('dos');
});

it('denies access without manage-settings permission', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('site-settings.edit'))->assertForbidden();
});
