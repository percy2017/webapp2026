<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreEventRequest;
use App\Http\Requests\Admin\UpdateEventRequest;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('agenda/index');
    }

    public function eventsJson(Request $request): JsonResponse
    {
        $request->validate([
            'start' => ['required', 'date'],
            'end' => ['required', 'date', 'after:start'],
        ]);

        $user = $request->user();

        $events = Event::query()
            ->where(function ($query) use ($request) {
                $query->whereBetween('start_at', [$request->start, $request->end])
                    ->orWhereBetween('end_at', [$request->start, $request->end])
                    ->orWhere(function ($q) use ($request) {
                        $q->where('start_at', '<=', $request->start)
                            ->where(function ($q2) use ($request) {
                                $q2->whereNull('end_at')
                                    ->orWhere('end_at', '>=', $request->end);
                            });
                    });
            })
            ->orderBy('start_at')
            ->get()
            ->map(fn (Event $event) => $this->transform($event, $user->can('update', $event), $user->can('delete', $event)));

        return response()->json($events);
    }

    public function store(StoreEventRequest $request)
    {
        $event = Event::create($request->validated() + ['user_id' => $request->user()->id]);

        return back()->with('success', 'Evento creado correctamente.');
    }

    public function update(UpdateEventRequest $request, Event $event)
    {
        $event->update($request->validated());

        return back()->with('success', 'Evento actualizado correctamente.');
    }

    public function destroy(Event $event)
    {
        $this->authorize('delete', $event);

        $event->delete();

        return back()->with('success', 'Evento eliminado.');
    }

    private function transform(Event $event, bool $canEdit, bool $canDelete): array
    {
        return [
            'id' => $event->id,
            'title' => $event->title,
            'start' => $event->start_at->toIso8601String(),
            'end' => $event->end_at?->toIso8601String(),
            'allDay' => $event->all_day,
            'backgroundColor' => $event->color,
            'borderColor' => $event->color,
            'extendedProps' => [
                'description' => $event->description,
                'location' => $event->location,
                'user' => $event->user?->name,
                'can_edit' => $canEdit,
                'can_delete' => $canDelete,
            ],
        ];
    }
}
