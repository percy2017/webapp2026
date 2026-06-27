<?php

use App\Models\SiteTemplate;
use App\Models\User;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'manage-templates', 'guard_name' => 'web']);
    $admin = User::factory()->create();
    $admin->givePermissionTo('manage-templates');
    $this->actingAs($admin);
});

it('serves edit page with template having 1 hero section', function () {
    $template = SiteTemplate::factory()->create([
        'name' => 'Test',
        'slug' => 'test',
        'sections' => [
            [
                'id' => 'hero',
                'visible' => true,
                'content' => [
                    'eyebrow' => 'My eyebrow',
                    'headline' => 'My headline',
                    'subheadline' => 'My sub',
                    'cta_label' => 'CTA',
                    'cta_href' => '#contact',
                    'secondary_label' => 'Sec',
                    'secondary_href' => '#features',
                    'image_media_id' => null,
                ],
            ],
        ],
    ]);

    $this->get(route('site-templates.edit', $template))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('site-templates/edit')
            ->where('template.id', $template->id)
            ->where('template.sections.0.id', 'hero')
            ->where('template.sections.0.visible', true)
            ->where('template.sections.0.content.headline', 'My headline')
        );
});

it('preserves section content through adapter round-trip', function () {
    $template = SiteTemplate::factory()->create([
        'sections' => [
            [
                'id' => 'hero',
                'visible' => true,
                'content' => [
                    'headline' => 'Original headline',
                    'subheadline' => 'Original sub',
                ],
            ],
        ],
    ]);

    $this->patch(route('site-templates.update', $template), [
        'name' => $template->name,
        'slug' => $template->slug,
        'sections' => [
            [
                'id' => 'hero',
                'visible' => true,
                'content' => [
                    'headline' => 'Updated headline',
                    'subheadline' => 'Updated sub',
                ],
            ],
        ],
    ])->assertRedirect();

    $template->refresh();
    expect($template->sections[0]['content']['headline'])->toBe('Updated headline');
});
