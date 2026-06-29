<?php

use App\Models\MediaHolder;
use App\Models\SiteSetting;
use App\Models\SiteTemplate;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;
use function Pest\Laravel\seed;

beforeEach(function () {
    seed(DatabaseSeeder::class);
});

function adminUser(): User
{
    $user = User::firstOrCreate(
        ['email' => 'admin@admin.com'],
        ['name' => 'Admin', 'password' => bcrypt('Admin2026$')],
    );
    $user->assignRole('admin');

    return $user;
}

function makeSiteTemplate(array $attrs = []): SiteTemplate
{
    return SiteTemplate::create(array_merge([
        'name' => 'Plantilla Test',
        'slug' => 'plantilla-test',
        'description' => 'desc',
        'is_active' => false,
    ], $attrs));
}

function makeMedia(string $mime = 'image/png'): Media
{
    return Media::create([
        'model_type' => MediaHolder::class,
        'model_id' => MediaHolder::firstOrCreate(['name' => 'default'])->id,
        'collection_name' => 'default',
        'name' => 'logo',
        'file_name' => 'logo.png',
        'mime_type' => $mime,
        'disk' => 'public',
        'size' => 1,
        'manipulations' => [],
        'custom_properties' => [],
        'generated_conversions' => [],
        'responsive_images' => [],
        'order_column' => 1,
    ]);
}

it('activates a template and points SiteSetting at its slug', function () {
    $admin = adminUser();
    $template = makeSiteTemplate();

    actingAs($admin)
        ->post("/admin/site-templates/{$template->id}/activate")
        ->assertRedirect();

    expect($template->fresh()->is_active)->toBeTrue();
    expect(SiteSetting::instance()->active_template_slug)->toBe(
        'plantilla-test',
    );
});

it('does not copy brand fields onto SiteSetting on activation', function () {
    // Brand identity (logo, favicon, PWA theme) lives on SiteSetting,
    // not on the template. Activating a template does NOT touch those
    // columns — operators configure them on /admin/site-settings.
    $admin = adminUser();

    SiteSetting::instance()->fill([
        'logo_media_id' => null,
        'favicon_media_id' => null,
        'pwa_theme_color' => '#abcdef',
        'pwa_background_color' => '#123456',
        'pwa_short_name' => 'PizzaApp',
    ])->save();

    $template = makeSiteTemplate();
    actingAs($admin)->post("/admin/site-templates/{$template->id}/activate");

    $setting = SiteSetting::instance();
    expect($setting->logo_media_id)->toBeNull();
    expect($setting->pwa_theme_color)->toBe('#abcdef');
    expect($setting->pwa_background_color)->toBe('#123456');
    expect($setting->pwa_short_name)->toBe('PizzaApp');
});

it('deactivates all other templates when activating one', function () {
    $admin = adminUser();
    $a = makeSiteTemplate(['slug' => 'a', 'is_active' => true]);
    $b = makeSiteTemplate(['slug' => 'b', 'is_active' => false]);

    actingAs($admin)->post("/admin/site-templates/{$b->id}/activate");

    expect($a->fresh()->is_active)->toBeFalse();
    expect($b->fresh()->is_active)->toBeTrue();
});

it('serves /manifest.webmanifest derived from SiteSetting (PWA panel source of truth)', function () {
    // /admin/site-settings writes pwa_short_name / description /
    // theme / background / logo to the SiteSetting singleton, and the
    // dynamic manifest reads them straight off SiteSetting (no per-
    // template brand duplication).
    $admin = adminUser();
    $logo = makeMedia();
    $favicon = makeMedia('image/svg+xml');

    SiteSetting::instance()->fill([
        'site_name' => 'Pizza Hostbol',
        'logo_media_id' => $logo->id,
        'favicon_media_id' => $favicon->id,
        'pwa_short_name' => 'PizzaApp',
        'pwa_description' => 'Pizzería Don Pepe',
        'pwa_theme_color' => '#aa1133',
        'pwa_background_color' => '#220011',
    ])->save();

    $response = get('/manifest.webmanifest');
    $response->assertOk();
    $response->assertHeader('Content-Type', 'application/json');

    $body = $response->json();
    expect($body['short_name'])->toBe('PizzaApp');
    expect($body['description'])->toBe('Pizzería Don Pepe');
    expect($body['theme_color'])->toBe('#aa1133');
    expect($body['background_color'])->toBe('#220011');
    expect($body['icons'])->not->toBeEmpty();

    // Logo URL is referenced on at least one icon entry.
    $logoUrl = $logo->getUrl();
    $srcs = array_column($body['icons'], 'src');
    expect(in_array($logoUrl, $srcs, true))->toBeTrue();
});

it('falls back to the default PWA values when SiteSetting is empty', function () {
    SiteSetting::instance()->update([
        'pwa_theme_color' => null,
        'pwa_background_color' => null,
        'pwa_short_name' => null,
    ]);

    $response = get('/manifest.webmanifest');

    $response->assertOk();
    $body = $response->json();
    expect($body['theme_color'])->toBe('#0f172a');
    expect($body['background_color'])->toBe('#0f172a');
});
