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

it('saves edited sections through the puck adapter flow', function () {
    $template = SiteTemplate::factory()->create([
        'name' => 'Puck Test',
        'slug' => 'puck-test',
        'sections' => [
            [
                'id' => 'hero',
                'visible' => true,
                'content' => [
                    'eyebrow' => 'Original eyebrow',
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
                    'eyebrow' => 'Edited eyebrow',
                    'headline' => 'Edited headline',
                    'subheadline' => 'Edited sub',
                ],
            ],
        ],
    ])->assertRedirect();

    $template->refresh();
    expect($template->sections[0]['content']['headline'])->toBe('Edited headline');
    expect($template->sections[0]['content']['eyebrow'])->toBe('Edited eyebrow');
});

it('fails to save puck data without required fields', function () {
    $template = SiteTemplate::factory()->create([
        'sections' => [
            ['id' => 'hero', 'visible' => true, 'content' => ['headline' => 'X']],
        ],
    ]);

    $this->patch(route('site-templates.update', $template), [
        'sections' => [
            [
                'id' => 'hero',
                'visible' => true,
                'content' => ['headline' => 'Edited'],
            ],
        ],
    ])->assertSessionHasErrors(['name', 'slug']);

    $template->refresh();
    expect($template->sections[0]['content']['headline'])->toBe('X');
});
