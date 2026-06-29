import { Calendar, Clock, Sparkles } from 'lucide-react';
import type { BlockProps } from '@site/lib/basic-blocks-registry';

type DaySlot = {
    day: string;
    time: string;
    title: string;
    active?: boolean;
};

const DEFAULT_SLOTS: DaySlot[] = [
    { day: 'Lunes', time: '20:00', title: 'Gaming · Ranked', active: true },
    { day: 'Martes', time: '20:00', title: 'IRL · Paseo', active: true },
    { day: 'Miércoles', time: '21:00', title: 'Just Chatting', active: true },
    { day: 'Jueves', time: '20:00', title: 'Gaming · Coop', active: true },
    { day: 'Viernes', time: '22:00', title: 'Torneo comunidad', active: true },
    { day: 'Sábado', time: '18:00', title: 'Maratón', active: true },
    { day: 'Domingo', time: '—', title: 'Descanso', active: false },
];

const DAYS_ORDER = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
];

/**
 * Divide un array en grupos de `size` elementos. La última fila puede
 * quedar con un solo elemento si la cantidad total es impar (ej. 7
 * días → 4 filas: [2, 2, 2, 1]).
 */
function chunk<T>(arr: T[], size: number): T[][] {
    const out: T[][] = [];

    for (let i = 0; i < arr.length; i += size) {
        out.push(arr.slice(i, i + size));
    }

    return out;
}

type Accent = 'primary' | 'violet' | 'cyan' | 'rose' | 'amber' | 'emerald';

const ACCENT_RING: Record<Accent, string> = {
    primary: 'ring-primary/30 bg-primary/5',
    violet: 'ring-violet-500/30 bg-violet-500/5',
    cyan: 'ring-cyan-500/30 bg-cyan-500/5',
    rose: 'ring-rose-500/30 bg-rose-500/5',
    amber: 'ring-amber-500/30 bg-amber-500/5',
    emerald: 'ring-emerald-500/30 bg-emerald-500/5',
};

const ACCENT_BADGE: Record<Accent, string> = {
    primary: 'bg-primary text-primary-foreground',
    violet: 'bg-violet-500 text-white',
    cyan: 'bg-cyan-500 text-white',
    rose: 'bg-rose-500 text-white',
    amber: 'bg-amber-500 text-white',
    emerald: 'bg-emerald-500 text-white',
};

const ACCENT_DOT: Record<Accent, string> = {
    primary: 'bg-primary',
    violet: 'bg-violet-500',
    cyan: 'bg-cyan-500',
    rose: 'bg-rose-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
};

export function ScheduleBlock({ content }: BlockProps) {
    const {
        eyebrow = 'Agenda semanal',
        title = 'Cuándo stream',
        subtitle = 'Mismos horarios cada semana. BO = UTC-4.',
        timezone = 'BO (UTC-4)',
        slots = DEFAULT_SLOTS,
        accent = 'primary',
        show_today = true,
    } = content as {
        eyebrow?: string;
        title?: string;
        subtitle?: string;
        timezone?: string;
        slots?: DaySlot[];
        accent?: Accent;
        show_today?: boolean;
    };

    const list: DaySlot[] =
        Array.isArray(slots) && slots.length > 0 ? slots : DEFAULT_SLOTS;
    const ordered = [...list].sort(
        (a, b) => DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day),
    );

    const accentKey: Accent = ACCENT_RING[accent] ? accent : 'primary';
    const ringCls = ACCENT_RING[accentKey];
    const badgeCls = ACCENT_BADGE[accentKey];
    const dotCls = ACCENT_DOT[accentKey];

    const todayIndex = (() => {
        if (!show_today) {
            return -1;
        }

        // JS: 0=Sun, 1=Mon ... 6=Sat
        const js = new Date().getDay();
        const map = [6, 0, 1, 2, 3, 4, 5]; // Sun..Sat -> index in DAYS_ORDER

        return map[js];
    })();

    return (
        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="mb-10 text-center sm:mb-12">
                {eyebrow && (
                    <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                        <Calendar className="h-3.5 w-3.5" />
                        {eyebrow}
                    </span>
                )}
                {title && (
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        {title}
                    </h2>
                )}
                {subtitle && (
                    <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
                        {subtitle}
                    </p>
                )}
                {timezone && (
                    <p className="mt-3 inline-flex items-center gap-1.5 text-xs tracking-wider text-muted-foreground/80 uppercase">
                        <Clock className="h-3 w-3" />
                        Zona horaria: {timezone}
                    </p>
                )}
            </div>

            {/* Mobile: scroll horizontal de a 2 cards por fila
                (snap-start por fila). Para 7 días quedan 4 stops
                (Lun-Mar, Mié-Jue, Vie-Sáb, Dom aislado) en vez de 7
                stops uno por día, lo que se siente más natural al
                pulgar. Cards dentro de cada fila mantienen
                `basis-[calc(50%-6px)]` para respetar el gap. */}
            <div className="md:hidden">
                <div
                    className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    role="region"
                    aria-label="Agenda semanal"
                    aria-roledescription="carrusel"
                >
                    {chunk(ordered, 2).map((row, rowIdx) => (
                        <div
                            key={`row-${rowIdx}`}
                            className="flex w-[calc(100vw-2rem)] shrink-0 snap-start gap-3"
                        >
                            {row.map((slot, slotIdx) => {
                                const idx = rowIdx * 2 + slotIdx;
                                const isToday = idx === todayIndex;
                                const isLive = Boolean(slot.active);

                                return (
                                    <article
                                        key={`m-${slot.day}-${idx}`}
                                        className={`group relative flex h-full basis-[calc(50%-6px)] flex-col rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                                            isToday ? `ring-2 ${ringCls}` : ''
                                        } ${isLive ? '' : 'opacity-75'}`}
                                    >
                                        {isToday && (
                                            <span
                                                className={`absolute -top-2.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase shadow-sm ${badgeCls}`}
                                            >
                                                <Sparkles className="h-2.5 w-2.5" />
                                                Hoy
                                            </span>
                                        )}

                                        <header className="flex items-center justify-between gap-2">
                                            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                {slot.day}
                                            </span>
                                            <span
                                                className={`flex h-2 w-2 shrink-0 rounded-full ${
                                                    isLive
                                                        ? dotCls
                                                        : 'bg-muted-foreground/30'
                                                }`}
                                                aria-hidden
                                            />
                                        </header>

                                        <div className="mt-3 font-mono text-3xl leading-none font-bold tracking-tight text-foreground tabular-nums">
                                            {slot.time}
                                        </div>

                                        <p className="mt-3 line-clamp-2 text-sm leading-snug text-muted-foreground">
                                            {slot.title ||
                                                (isLive
                                                    ? 'Abierto'
                                                    : 'Cerrado')}
                                        </p>

                                        <footer className="mt-auto pt-3">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${
                                                    isLive
                                                        ? `${badgeCls}`
                                                        : 'bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                {isLive
                                                    ? 'En vivo'
                                                    : 'Cerrado'}
                                            </span>
                                        </footer>
                                    </article>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Desktop: grid estático de 3 columnas (md:) y 7
                columnas (lg:). Render separado del mobile porque
                Tailwind no resuelve breakpoints distintos en el mismo
                wrapper. */}
            <div className="hidden gap-4 md:grid md:grid-cols-3 lg:grid-cols-7">
                {ordered.map((slot, idx) => {
                    const isToday = idx === todayIndex;
                    const isLive = Boolean(slot.active);

                    return (
                        <article
                            key={`d-${slot.day}-${idx}`}
                            className={`group relative flex h-full flex-col rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                                isToday ? `ring-2 ${ringCls}` : ''
                            } ${isLive ? '' : 'opacity-75'}`}
                        >
                            {isToday && (
                                <span
                                    className={`absolute -top-2.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase shadow-sm ${badgeCls}`}
                                >
                                    <Sparkles className="h-2.5 w-2.5" />
                                    Hoy
                                </span>
                            )}

                            <header className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    {slot.day}
                                </span>
                                <span
                                    className={`flex h-2 w-2 shrink-0 rounded-full ${
                                        isLive
                                            ? dotCls
                                            : 'bg-muted-foreground/30'
                                    }`}
                                    aria-hidden
                                />
                            </header>

                            <div className="mt-3 font-mono text-3xl leading-none font-bold tracking-tight text-foreground tabular-nums">
                                {slot.time}
                            </div>

                            <p className="mt-3 line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {slot.title || (isLive ? 'Abierto' : 'Cerrado')}
                            </p>

                            <footer className="mt-auto pt-3">
                                <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${
                                        isLive
                                            ? `${badgeCls}`
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {isLive ? 'En vivo' : 'Cerrado'}
                                </span>
                            </footer>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
