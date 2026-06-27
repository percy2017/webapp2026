<?php

use App\Models\MediaHolder;
use App\Models\SiteTemplate;
use App\Models\User;
use App\Support\TemplateMediaUrl;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'manage-templates', 'guard_name' => 'web']);
    $admin = User::factory()->create();
    $admin->givePermissionTo('manage-templates');
    $this->actingAs($admin);
});

it('enriches sections with image_url from media library', function () {
    $holder = MediaHolder::firstOrCreate(['id' => 1], ['name' => 'Test']);
    $tmpPath = tempnam(sys_get_temp_dir(), 'img').'.png';
    file_put_contents($tmpPath, 'fake-image-content');
    $media = $holder->addMedia($tmpPath)->toMediaCollection();

    $template = SiteTemplate::factory()->create([
        'sections' => [
            [
                'id' => 'hero',
                'visible' => true,
                'content' => [
                    'headline' => 'Test',
                    'image_media_id' => $media->id,
                ],
            ],
        ],
    ]);

    $enriched = TemplateMediaUrl::enrichSections($template->sections);
    expect($enriched[0]['content']['image_url'])->toContain('/storage/');
    expect($enriched[0]['content']['image_url_thumb'])->toContain('/storage/');
    expect($enriched[0]['content']['image_media_id'])->toBe($media->id);
});

it('leaves non-image content untouched', function () {
    $sections = [
        [
            'id' => 'hero',
            'visible' => true,
            'content' => [
                'headline' => 'Hello',
                'image_media_id' => null,
            ],
        ],
    ];

    $enriched = TemplateMediaUrl::enrichSections($sections);
    expect($enriched[0]['content'])->not->toHaveKey('image_url');
    expect($enriched[0]['content']['headline'])->toBe('Hello');
});

it('does not break with invalid media ids', function () {
    $sections = [
        [
            'id' => 'hero',
            'visible' => true,
            'content' => [
                'headline' => 'Hello',
                'image_media_id' => 99999,
            ],
        ],
    ];

    $enriched = TemplateMediaUrl::enrichSections($sections);
    expect($enriched[0]['content'])->not->toHaveKey('image_url');
    expect($enriched[0]['content']['image_media_id'])->toBe(99999);
});

it('edit page receives enriched sections with image_url', function () {
    $holder = MediaHolder::firstOrCreate(['id' => 1], ['name' => 'Test']);
    $tmpPath = tempnam(sys_get_temp_dir(), 'img').'.png';
    file_put_contents($tmpPath, 'fake-image-content');
    $media = $holder->addMedia($tmpPath)->toMediaCollection();

    $template = SiteTemplate::factory()->create([
        'sections' => [
            [
                'id' => 'hero',
                'visible' => true,
                'content' => [
                    'headline' => 'Test',
                    'image_media_id' => $media->id,
                ],
            ],
        ],
    ]);

    $this->get(route('site-templates.edit', $template))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('template.sections.0.content.image_media_id', $media->id)
            ->where('template.sections.0.content.image_url', fn ($v) => str_contains($v, '/storage/'))
        );
});
