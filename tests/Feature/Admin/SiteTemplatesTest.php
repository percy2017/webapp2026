<?php

use App\Models\SiteMenuItem;
use App\Models\SiteSetting;
use App\Models\SiteTemplate;
use App\Models\User;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'manage-templates', 'guard_name' => 'web']);
    $this->admin = User::factory()->create();
    $this->admin->givePermissionTo('manage-templates');
    $this->actingAs($this->admin);
});

it('lists site templates for authorized user', function () {
    $templates = SiteTemplate::factory()->count(3)->create();

    $this->get(route('site-templates.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('site-templates/index')
            ->has('templates.data', 3)
        );
});

it('denies access to users without manage-templates permission', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('site-templates.index'))
        ->assertForbidden();
});

it('creates a site template', function () {
    $response = $this->post(route('site-templates.store'), [
        'name' => 'Tienda',
        'slug' => 'tienda',
        'description' => 'Para tiendas online',
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('site_templates', [
        'name' => 'Tienda',
        'slug' => 'tienda',
    ]);
});

it('creates an empty site template without a preset', function () {
    // The frontend lets users skip the preset step and start from a blank
    // canvas — this test pins that the backend accepts that and stores
    // a template with no sections / blocks / menu items.
    $response = $this->post(route('site-templates.store'), [
        'name' => 'Página en blanco',
        'slug' => 'pagina-en-blanco',
    ]);

    $template = SiteTemplate::query()->where('slug', 'pagina-en-blanco')->firstOrFail();
    $response->assertRedirect(route('site-templates.edit', $template));

    expect($template->name)->toBe('Página en blanco');
    expect($template->sections)->toBeNull();
    expect($template->blocks()->count())->toBe(0);
    expect(SiteMenuItem::query()->where('site_template_id', $template->id)->count())->toBe(0);
});

it('validates slug uniqueness on create', function () {
    SiteTemplate::factory()->create(['slug' => 'default']);

    $this->post(route('site-templates.store'), [
        'name' => 'Otra',
        'slug' => 'default',
    ])->assertSessionHasErrors(['slug']);
});

it('updates a site template sections and theme', function () {
    $template = SiteTemplate::factory()->create([
        'name' => 'Antes',
        'slug' => 'antes',
        'theme' => ['primary_color' => '#000000'],
    ]);

    $this->patch(route('site-templates.update', $template), [
        'name' => 'Después',
        'slug' => 'despues',
        'sections' => [
            ['id' => 'hero', 'visible' => true, 'content' => ['headline' => 'Nuevo']],
            ['id' => 'contact', 'visible' => false, 'content' => []],
        ],
        'theme' => ['primary_color' => '#ff0000', 'accent_color' => '#00ff00'],
    ])->assertRedirect();

    $template->refresh();
    expect($template->name)->toBe('Después');
    expect($template->theme['primary_color'])->toBe('#ff0000');
    expect($template->sections)->toHaveCount(2);
    expect($template->sections[0]['id'])->toBe('hero');
});

it('round-trips puck-shaped data through the adapter pattern', function () {
    $template = SiteTemplate::factory()->create(['slug' => 'pucktest']);

    $puckData = [
        'content' => [
            ['type' => 'hero', 'props' => ['headline' => 'Puck test', 'hidden' => false]],
            ['type' => 'menu', 'props' => ['title' => 'Carta', 'hidden' => true]],
        ],
        'root' => ['props' => []],
    ];

    $sections = collect($puckData['content'])
        ->filter(fn ($b) => ! empty($b['type']))
        ->map(fn ($b) => [
            'id' => $b['type'],
            'visible' => ($b['props']['hidden'] ?? false) !== true,
            'content' => collect($b['props'])
                ->reject(fn ($_, $k) => $k === 'hidden')
                ->all(),
        ])
        ->values()
        ->all();

    $response = $this->patch(route('site-templates.update', $template), [
        'name' => $template->name,
        'slug' => $template->slug,
        'sections' => $sections,
        'theme' => ['primary_color' => '#000000'],
    ]);

    $response->assertRedirect();

    $template->refresh();
    expect($template->sections)->toHaveCount(2);
    expect($template->sections[0]['id'])->toBe('hero');
    expect($template->sections[0]['visible'])->toBeTrue();
    expect($template->sections[0]['content']['headline'])->toBe('Puck test');
    expect($template->sections[1]['id'])->toBe('menu');
    expect($template->sections[1]['visible'])->toBeFalse();
    expect($template->sections[1]['content']['title'])->toBe('Carta');
    expect(array_key_exists('hidden', $template->sections[1]['content']))->toBeFalse();
});

it('activates a template and deactivates others', function () {
    $a = SiteTemplate::factory()->create(['slug' => 'a', 'is_active' => true]);
    $b = SiteTemplate::factory()->create(['slug' => 'b', 'is_active' => false]);

    $this->post(route('site-templates.activate', $b))
        ->assertRedirect();

    expect($a->fresh()->is_active)->toBeFalse();
    expect($b->fresh()->is_active)->toBeTrue();
    expect(SiteSetting::instance()->active_template_slug)->toBe('b');
});

it('deletes a site template', function () {
    $template = SiteTemplate::factory()->create();

    $this->delete(route('site-templates.destroy', $template))
        ->assertRedirect(route('site-templates.index'));

    $this->assertDatabaseMissing('site_templates', ['id' => $template->id]);
});

it('clears active_template_slug when deleting active template', function () {
    $template = SiteTemplate::factory()->create(['is_active' => true]);
    SiteSetting::instance()->update(['active_template_slug' => $template->slug]);

    $this->delete(route('site-templates.destroy', $template));

    expect(SiteSetting::instance()->active_template_slug)->toBeNull();
});

it('renders the public home with the active template', function () {
    SiteTemplate::factory()->create([
        'slug' => 'default',
        'is_active' => true,
        'sections' => [
            ['id' => 'hero', 'visible' => true, 'content' => ['headline' => 'HOLA TEST']],
        ],
    ]);
    SiteSetting::instance()->update(['active_template_slug' => 'default']);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('site/landing')
            ->where('template.slug', 'default')
            ->where('template.sections.0.content.headline', 'HOLA TEST')
        );
});

it('renders the public home with the requested template via query', function () {
    SiteTemplate::factory()->create([
        'slug' => 'restaurant',
        'is_active' => false,
        'sections' => [
            ['id' => 'menu', 'visible' => true, 'content' => ['title' => 'Carta']],
        ],
    ]);

    $this->get('/?template=restaurant')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('template.slug', 'restaurant')
            ->where('template.sections.0.content.title', 'Carta')
        );
});
