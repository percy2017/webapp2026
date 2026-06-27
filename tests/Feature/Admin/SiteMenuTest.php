<?php

use App\Models\SiteMenuItem;
use App\Models\User;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'manage-settings', 'guard_name' => 'web']);
    $admin = User::factory()->create();
    $admin->givePermissionTo('manage-settings');
    $this->actingAs($admin);
});

it('lists menu items ordered by sort', function () {
    SiteMenuItem::create(['label' => 'C', 'href' => '#c', 'sort' => 3]);
    SiteMenuItem::create(['label' => 'A', 'href' => '#a', 'sort' => 1]);
    SiteMenuItem::create(['label' => 'B', 'href' => '#b', 'sort' => 2]);

    $this->get(route('site-menu.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('site-menu/index')
            ->has('items', 3)
            ->where('items.0.label', 'A')
            ->where('items.1.label', 'B')
            ->where('items.2.label', 'C')
        );
});

it('denies access without manage-settings', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('site-menu.index'))->assertForbidden();
});

it('creates a new menu item', function () {
    $this->post(route('site-menu.store'), [
        'label' => 'Inicio',
        'href' => '#hero',
        'is_active' => true,
    ])->assertRedirect();

    $this->assertDatabaseHas('site_menu_items', [
        'label' => 'Inicio',
        'href' => '#hero',
    ]);
});

it('updates a menu item', function () {
    $item = SiteMenuItem::create([
        'label' => 'Antes',
        'href' => '#old',
        'sort' => 1,
    ]);

    $this->patch(route('site-menu.update', $item), [
        'label' => 'Después',
        'href' => '#new',
        'is_active' => false,
    ])->assertRedirect();

    $item->refresh();
    expect($item->label)->toBe('Después');
    expect($item->href)->toBe('#new');
    expect($item->is_active)->toBeFalse();
});

it('deletes a menu item', function () {
    $item = SiteMenuItem::create([
        'label' => 'Borrame',
        'href' => '#x',
    ]);

    $this->delete(route('site-menu.destroy', $item))->assertRedirect();

    $this->assertDatabaseMissing('site_menu_items', ['id' => $item->id]);
});

it('moves items up and down by swapping sort values', function () {
    $a = SiteMenuItem::create(['label' => 'A', 'href' => '#a', 'sort' => 1]);
    $b = SiteMenuItem::create(['label' => 'B', 'href' => '#b', 'sort' => 2]);
    $c = SiteMenuItem::create(['label' => 'C', 'href' => '#c', 'sort' => 3]);

    $this->post(route('site-menu.down', $a))->assertRedirect();

    expect($a->fresh()->sort)->toBe(2);
    expect($b->fresh()->sort)->toBe(1);

    $this->post(route('site-menu.up', $b))->assertRedirect();

    expect($b->fresh()->sort)->toBe(1);
    expect($a->fresh()->sort)->toBe(2);
    expect($c->fresh()->sort)->toBe(3);
});

it('serves active primary menu items to the public site', function () {
    SiteMenuItem::create(['label' => 'Inicio', 'href' => '#hero', 'sort' => 1, 'is_active' => true]);
    SiteMenuItem::create(['label' => 'Oculto', 'href' => '#hidden', 'sort' => 2, 'is_active' => false]);

    $items = SiteMenuItem::forLocationOrdered(SiteMenuItem::LOCATION_PRIMARY);

    expect($items)->toHaveCount(1);
    expect($items[0]['label'])->toBe('Inicio');
});
