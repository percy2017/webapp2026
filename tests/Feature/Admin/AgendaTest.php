<?php

use App\Models\Event;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;
use function Pest\Laravel\seed;

beforeEach(function () {
    seed(DatabaseSeeder::class);
});

it('renders the agenda page for authenticated users', function () {
    $admin = User::where('email', 'admin@admin.com')->first();

    actingAs($admin)
        ->get('/admin/agenda')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('agenda/index'));
});

it('redirects guests to login', function () {
    get('/admin/agenda')->assertRedirect('/login');
});

it('returns events within the requested range as JSON', function () {
    $user = User::factory()->create();
    Event::factory()->for($user)->create([
        'title' => 'Reunión',
        'start_at' => '2026-07-01 10:00:00',
        'end_at' => '2026-07-01 11:00:00',
    ]);
    Event::factory()->for($user)->create([
        'title' => 'Fuera de rango',
        'start_at' => '2027-01-01 10:00:00',
        'end_at' => '2027-01-01 11:00:00',
    ]);

    $response = actingAs($user)
        ->getJson('/admin/agenda/events?start=2026-06-01&end=2026-07-31')
        ->assertOk()
        ->json();

    expect(collect($response)->pluck('title')->all())->toBe(['Reunión']);
});

it('validates start and end parameters on the json endpoint', function () {
    $user = User::where('email', 'admin@admin.com')->first();

    $response = $this->actingAs($user)->getJson('/admin/agenda/events');

    expect($response->status())->toBe(422);
    expect($response->json('errors'))->toHaveKeys(['start', 'end']);
});

it('creates an event', function () {
    $user = User::factory()->create();

    actingAs($user)
        ->post('/admin/agenda', [
            'title' => 'Lanzamiento',
            'description' => 'Demo',
            'start_at' => '2026-08-01 09:00:00',
            'end_at' => '2026-08-01 10:00:00',
            'all_day' => false,
            'location' => 'Oficina',
            'color' => '#3b82f6',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $event = Event::first();
    expect($event)->not->toBeNull();
    expect($event->title)->toBe('Lanzamiento');
    expect($event->user_id)->toBe($user->id);
});

it('requires a title on create', function () {
    $user = User::factory()->create();

    actingAs($user)
        ->from('/admin/agenda')
        ->post('/admin/agenda', [
            'start_at' => '2026-08-01 09:00:00',
        ])
        ->assertRedirect('/admin/agenda')
        ->assertSessionHasErrors('title');
});

it('allows the owner to update the event', function () {
    $user = User::factory()->create();
    $event = Event::factory()->for($user)->create(['title' => 'Original']);

    actingAs($user)
        ->patch("/admin/agenda/{$event->id}", [
            'title' => 'Actualizado',
            'start_at' => '2026-08-01 09:00:00',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($event->fresh()->title)->toBe('Actualizado');
});

it('allows an admin to update any event', function () {
    $admin = User::where('email', 'admin@admin.com')->first();
    $owner = User::factory()->create();
    $event = Event::factory()->for($owner)->create(['title' => 'Original']);

    actingAs($admin)
        ->patch("/admin/agenda/{$event->id}", [
            'title' => 'Editado por admin',
            'start_at' => '2026-08-01 09:00:00',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($event->fresh()->title)->toBe('Editado por admin');
});

it('forbids a regular user from updating another user event', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $event = Event::factory()->for($owner)->create();

    actingAs($intruder)
        ->patch("/admin/agenda/{$event->id}", [
            'title' => 'Hack',
            'start_at' => '2026-08-01 09:00:00',
        ])
        ->assertForbidden();
});

it('allows owner to delete the event', function () {
    $user = User::factory()->create();
    $event = Event::factory()->for($user)->create();

    actingAs($user)
        ->delete("/admin/agenda/{$event->id}")
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(Event::find($event->id))->toBeNull();
});

it('allows admin to delete any event', function () {
    $admin = User::where('email', 'admin@admin.com')->first();
    $event = Event::factory()->create();

    actingAs($admin)
        ->delete("/admin/agenda/{$event->id}")
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(Event::find($event->id))->toBeNull();
});

it('forbids non-owner non-admin from deleting', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $event = Event::factory()->for($owner)->create();

    actingAs($intruder)
        ->delete("/admin/agenda/{$event->id}")
        ->assertForbidden();
});

it('reports can_edit and can_delete flags in JSON', function () {
    $owner = User::factory()->create();
    $event = Event::factory()->for($owner)->create([
        'start_at' => '2026-07-01 10:00:00',
        'end_at' => '2026-07-01 11:00:00',
    ]);

    $intruder = User::factory()->create();
    $response = actingAs($intruder)
        ->getJson('/admin/agenda/events?start=2026-06-01&end=2026-07-31')
        ->json();

    expect($response[0]['extendedProps']['can_edit'])->toBeFalse();
    expect($response[0]['extendedProps']['can_delete'])->toBeFalse();

    $responseOwner = actingAs($owner)
        ->getJson('/admin/agenda/events?start=2026-06-01&end=2026-07-31')
        ->json();

    expect($responseOwner[0]['extendedProps']['can_edit'])->toBeTrue();
    expect($responseOwner[0]['extendedProps']['can_delete'])->toBeTrue();
});
