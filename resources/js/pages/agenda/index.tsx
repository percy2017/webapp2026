import type {
    DateClickArg,
    DateSelectArg,
    EventClickArg,
    EventDropArg,
    EventInput,
} from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Head, router, usePage } from '@inertiajs/react';
import { Loader2, MapPin, Pencil, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { admin } from '@/routes';
import { destroy, store, update, events as eventsRoute } from '@/routes/agenda';

type Props = Record<string, never>;

type EventFormState = {
    id?: number;
    title: string;
    description: string;
    start_at: string;
    end_at: string;
    all_day: boolean;
    color: string;
    location: string;
};

type FlashProps = { flash?: { success?: string } };

const COLOR_OPTIONS = [
    { value: '', label: 'Predeterminado', class: 'bg-primary' },
    { value: '#3b82f6', label: 'Azul', class: 'bg-blue-500' },
    { value: '#10b981', label: 'Verde', class: 'bg-emerald-500' },
    { value: '#f59e0b', label: 'Ámbar', class: 'bg-amber-500' },
    { value: '#ef4444', label: 'Rojo', class: 'bg-red-500' },
    { value: '#8b5cf6', label: 'Violeta', class: 'bg-violet-500' },
    { value: '#ec4899', label: 'Rosa', class: 'bg-pink-500' },
];

const EMPTY_FORM: EventFormState = {
    title: '',
    description: '',
    start_at: '',
    end_at: '',
    all_day: false,
    color: '',
    location: '',
};

function toLocalInput(date: Date | string | null, allDay = false): string {
    if (!date) {
        return '';
    }

    const d = typeof date === 'string' ? new Date(date) : date;

    if (Number.isNaN(d.getTime())) {
        return '';
    }

    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());

    if (allDay) {
        return `${yyyy}-${mm}-${dd}`;
    }

    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());

    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function defaultEnd(start: string, allDay: boolean): string {
    if (!start) {
        return '';
    }

    const d = new Date(start);

    if (allDay) {
        return toLocalInput(d, true);
    }

    d.setHours(d.getHours() + 1);

    return toLocalInput(d);
}

export default function AgendaIndex(_: Props) {
    const { props } = usePage<FlashProps>();
    const calendarRef = useRef<FullCalendar | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState<EventInput | null>(null);
    const [form, setForm] = useState<EventFormState>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function openCreate(date?: Date) {
        const start = date ? toLocalInput(date, false) : '';
        setForm({
            ...EMPTY_FORM,
            start_at: start,
            end_at: start ? defaultEnd(start, false) : '',
        });
        setError(null);
        setDialogOpen(true);
    }

    function openEdit(event: EventInput) {
        const extended = (event.extendedProps ?? {}) as {
            description?: string;
            location?: string;
            can_edit?: boolean;
        };
        const allDay = Boolean(event.allDay);
        const start = event.start
            ? toLocalInput(new Date(event.start), allDay)
            : '';
        const end = event.end ? toLocalInput(new Date(event.end), allDay) : '';
        setForm({
            id:
                typeof event.id === 'string' || typeof event.id === 'number'
                    ? Number(event.id)
                    : undefined,
            title: event.title ?? '',
            description: extended.description ?? '',
            start_at: start,
            end_at: end,
            all_day: allDay,
            color: (event.backgroundColor as string) ?? '',
            location: extended.location ?? '',
        });
        setError(null);
        setDialogOpen(true);
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const payload = {
            title: form.title,
            description: form.description || null,
            start_at: form.start_at,
            end_at: form.all_day ? null : form.end_at || null,
            all_day: form.all_day,
            color: form.color || null,
            location: form.location || null,
        };

        const onFinish = () => setSaving(false);
        const onError = (errors: Record<string, string>) => {
            const first = Object.values(errors)[0];
            setError(first ?? 'Error al guardar el evento.');
        };

        if (form.id) {
            router.patch(update(form.id), payload, { onFinish, onError });
        } else {
            router.post(store(), payload, { onFinish, onError });
        }
    }

    function handleDelete() {
        if (!deleting?.id) {
            return;
        }

        const id = Number(deleting.id);
        router.delete(destroy(id), {
            onFinish: () => setDeleting(null),
        });
    }

    function handleDateSelect(selectInfo: DateSelectArg) {
        calendarRef.current?.getApi().unselect();
        openCreate(selectInfo.start);
    }

    function handleDateClick(clickInfo: DateClickArg) {
        openCreate(clickInfo.date);
    }

    function handleEventClick(clickInfo: EventClickArg) {
        const extended = (clickInfo.event.extendedProps ?? {}) as {
            can_edit?: boolean;
            can_delete?: boolean;
        };

        if (!extended.can_edit && !extended.can_delete) {
            return;
        }

        openEdit({
            id: clickInfo.event.id,
            title: clickInfo.event.title,
            start: clickInfo.event.startStr,
            end: clickInfo.event.endStr,
            allDay: clickInfo.event.allDay,
            backgroundColor: clickInfo.event.backgroundColor,
            extendedProps: clickInfo.event.extendedProps,
        });
    }

    function handleEventDrop(dropInfo: EventDropArg) {
        const event = dropInfo.event;
        const extended = (event.extendedProps ?? {}) as { can_edit?: boolean };

        if (!extended.can_edit) {
            dropInfo.revert();

            return;
        }

        router.patch(
            update(Number(event.id)),
            {
                title: event.title,
                description: extended.description ?? null,
                start_at: event.start?.toISOString() ?? '',
                end_at: event.end?.toISOString() ?? null,
                all_day: event.allDay,
                color: event.backgroundColor || null,
                location: extended.location ?? null,
            },
            {
                onError: () => dropInfo.revert(),
            },
        );
    }

    function fetchEvents(
        fetchInfo: { startStr: string; endStr: string },
        success: (events: EventInput[]) => void,
    ) {
        const url = eventsRoute({
            query: {
                start: fetchInfo.startStr,
                end: fetchInfo.endStr,
            },
        }).url;

        fetch(url, {
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
        })
            .then((r) => r.json())
            .then((data) => success(data as EventInput[]))
            .catch(() => success([]));
    }

    return (
        <>
            <Head title="Agenda" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {props.flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
                        {props.flash.success}
                    </div>
                )}

                <div className="agenda-calendar rounded-lg border bg-card p-4">
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[
                            dayGridPlugin,
                            timeGridPlugin,
                            listPlugin,
                            interactionPlugin,
                        ]}
                        initialView="dayGridMonth"
                        locale={esLocale}
                        firstDay={1}
                        height="auto"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
                        }}
                        buttonText={{
                            today: 'Hoy',
                            month: 'Mes',
                            week: 'Semana',
                            day: 'Día',
                            list: 'Lista',
                        }}
                        selectable
                        selectMirror
                        editable
                        dayMaxEvents
                        nowIndicator
                        events={fetchEvents}
                        select={handleDateSelect}
                        dateClick={handleDateClick}
                        eventClick={handleEventClick}
                        eventDrop={handleEventDrop}
                    />
                </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {form.id ? 'Editar evento' : 'Nuevo evento'}
                        </DialogTitle>
                        <DialogDescription>
                            Completa los datos del evento.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título</Label>
                            <Input
                                id="title"
                                value={form.title}
                                onChange={(e) =>
                                    setForm({ ...form, title: e.target.value })
                                }
                                required
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_at">Inicio</Label>
                                <Input
                                    id="start_at"
                                    type={
                                        form.all_day ? 'date' : 'datetime-local'
                                    }
                                    value={form.start_at}
                                    onChange={(e) => {
                                        const start = e.target.value;
                                        setForm((prev) => ({
                                            ...prev,
                                            start_at: start,
                                            end_at:
                                                prev.end_at &&
                                                prev.end_at >= start
                                                    ? prev.end_at
                                                    : defaultEnd(
                                                          start,
                                                          prev.all_day,
                                                      ),
                                        }));
                                    }}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="end_at">Fin</Label>
                                <Input
                                    id="end_at"
                                    type={
                                        form.all_day ? 'date' : 'datetime-local'
                                    }
                                    value={form.end_at}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            end_at: e.target.value,
                                        })
                                    }
                                    disabled={form.all_day}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="all_day"
                                checked={form.all_day}
                                onCheckedChange={(checked) => {
                                    const isAllDay = checked === true;
                                    setForm((prev) => ({
                                        ...prev,
                                        all_day: isAllDay,
                                        end_at: isAllDay
                                            ? toLocalInput(
                                                  new Date(prev.start_at),
                                                  true,
                                              )
                                            : defaultEnd(prev.start_at, false),
                                    }));
                                }}
                            />
                            <Label htmlFor="all_day" className="cursor-pointer">
                                Todo el día
                            </Label>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    Ubicación
                                </span>
                            </Label>
                            <Input
                                id="location"
                                value={form.location}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        location: e.target.value,
                                    })
                                }
                                placeholder="Sala, dirección..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="description"
                                value={form.description}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        description: e.target.value,
                                    })
                                }
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Color</Label>
                            <div className="flex flex-wrap gap-2">
                                {COLOR_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        title={option.label}
                                        onClick={() =>
                                            setForm({
                                                ...form,
                                                color: option.value,
                                            })
                                        }
                                        className={`h-7 w-7 rounded-full border-2 transition ${option.class} ${
                                            form.color === option.value
                                                ? 'border-foreground ring-2 ring-offset-2 ring-offset-background'
                                                : 'border-transparent'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        <DialogFooter className="gap-2">
                            {form.id && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => {
                                        setDialogOpen(false);
                                        setDeleting({
                                            id: form.id,
                                            title: form.title,
                                            start: form.start_at,
                                            end: form.end_at,
                                            allDay: form.all_day,
                                            extendedProps: {},
                                        });
                                    }}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                </Button>
                            )}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDialogOpen(false)}
                                disabled={saving}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                <Pencil className="mr-2 h-4 w-4" />
                                {form.id ? 'Actualizar' : 'Crear'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="¿Eliminar evento?"
                description={
                    deleting?.title
                        ? `Se eliminará "${String(deleting.title)}". Esta acción no se puede deshacer.`
                        : 'Esta acción no se puede deshacer.'
                }
                confirmText="Eliminar"
                variant="destructive"
                onConfirm={handleDelete}
            />
        </>
    );
}

AgendaIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: admin() },
        { title: 'Agenda', href: '/admin/agenda' },
    ],
};
