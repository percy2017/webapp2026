<?php

use App\Models\MediaHolder;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;
use function Pest\Laravel\seed;

beforeEach(function () {
    seed(DatabaseSeeder::class);
    Storage::fake('public');
});

it('renders the media index page for authenticated users', function () {
    $user = User::factory()->create();

    actingAs($user)
        ->get('/admin/media')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('media/index'));
});

it('shows a list of media in the index page', function () {
    $user = User::factory()->create();
    $holder = MediaHolder::first();
    $holder->addMedia(UploadedFile::fake()->image('sample.png'))->toMediaCollection();

    actingAs($user)
        ->get('/admin/media')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('media/index')
            ->has('media.data', 1)
            ->where('media.data.0.file_name', 'sample.png'));
});

it('filters media by search query', function () {
    $user = User::factory()->create();
    $holder = MediaHolder::first();
    $holder->addMedia(UploadedFile::fake()->create('invoice.pdf', 100, 'application/pdf'))
        ->toMediaCollection();
    $holder->addMedia(UploadedFile::fake()->image('photo.png'))->toMediaCollection();

    actingAs($user)
        ->get('/admin/media?search=invoice')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('media.data', 1)
            ->where('media.data.0.file_name', 'invoice.pdf'));
});

it('filters media by mime type prefix', function () {
    $user = User::factory()->create();
    $holder = MediaHolder::first();
    $holder->addMedia(UploadedFile::fake()->image('photo.png'))->toMediaCollection();
    $holder->addMedia(UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf'))
        ->toMediaCollection();

    actingAs($user)
        ->get('/admin/media?type=image')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('media.data', 1)
            ->where('media.data.0.mime_type', 'image/png'));
});

it('uploads a file via the store endpoint', function () {
    $user = User::factory()->create();

    actingAs($user)
        ->post('/admin/media', [
            'file' => UploadedFile::fake()->image('avatar.png'),
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(Media::where('model_type', MediaHolder::class)->count())->toBe(1);
    expect(Media::where('model_type', MediaHolder::class)->first()->mime_type)->toBe('image/png');
});

it('rejects upload when no file is provided', function () {
    $user = User::factory()->create();

    actingAs($user)
        ->post('/admin/media', [])
        ->assertSessionHasErrors('file');

    expect(Media::count())->toBe(0);
});

it('rejects upload when file exceeds max size', function () {
    $user = User::factory()->create();

    actingAs($user)
        ->post('/admin/media', [
            'file' => UploadedFile::fake()->create('big.pdf', 11000),
        ])
        ->assertSessionHasErrors('file');

    expect(Media::count())->toBe(0);
});

it('deletes a media file', function () {
    $user = User::factory()->create();
    $holder = MediaHolder::first();
    $media = $holder->addMedia(UploadedFile::fake()->image('temp.png'))->toMediaCollection();

    actingAs($user)
        ->delete("/admin/media/{$media->id}")
        ->assertRedirect();

    expect(Media::find($media->id))->toBeNull();
});

it('paginates media with 24 per page', function () {
    $user = User::factory()->create();
    $holder = MediaHolder::first();
    for ($i = 0; $i < 30; $i++) {
        $holder->addMedia(UploadedFile::fake()->image("file{$i}.png"))->toMediaCollection();
    }

    actingAs($user)
        ->get('/admin/media')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('media.per_page', 24)
            ->where('media.total', 30)
            ->where('media.last_page', 2)
            ->has('media.data', 24));
});

it('redirects guests to login', function () {
    get('/admin/media')->assertRedirect('/login');
});
