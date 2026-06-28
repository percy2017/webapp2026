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

const DAYS_ORDER = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

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

    const list: DaySlot[] = Array.isArray(slots) && slots.length > 0 ? slots : DEFAULT_SLOTS;
    const ordered = [...list].sort(
        (a, b) => DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day),
    );

    const accentKey: Accent = ACCENT_RING[accent] ? accent : 'primary';
    const ringCls = ACCENT_RING[accentKey];
    const badgeCls = ACCENT_BADGE[accentKey];
    const dotCls = ACCENT_DOT[accentKey];

    const todayIndex = (() => {
        if (!show_today) return -1;
        // JS: 0=Sun, 1=Mon ... 6=Sat
        const js = new Date().getDay();
        const map = [6, 0, 1, 2, 3, 4, 5]; // Sun..Sat -> index in DAYS_ORDER
        return map[js];
    })();

    return (
        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="mb-10 text-center sm:mb-12">
                {eyebrow && (
                    <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
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
                    <p className="mt-3 inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground/80">
                        <Clock className="h-3 w-3" />
                        Zona horaria: {timezone}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-7">
                {ordered.map((slot, idx) => {
                    const isToday = idx === todayIndex;
                    const isLive = Boolean(slot.active);

                    return (
                        <article
                            key={`${slot.day}-${idx}`}
                            className={`group relative flex h-full flex-col rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                                isToday ? `ring-2 ${ringCls}` : ''
                            } ${isLive ? '' : 'opacity-75'}`}
                        >
                            {isToday && (
                                <span
                                    className={`absolute -top-2.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm ${badgeCls}`}
                                >
                                    <Sparkles className="h-2.5 w-2.5" />
                                    Hoy
                                </span>
                            )}

                            <header className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {slot.day}
                                </span>
                                <span
                                    className={`flex h-2 w-2 shrink-0 rounded-full ${
                                        isLive ? dotCls : 'bg-muted-foreground/30'
                                    }`}
                                    aria-hidden
                                />
                            </header>

                            <div className="mt-3 font-mono text-3xl font-bold leading-none tracking-tight text-foreground tabular-nums">
                                {slot.time}
                            </div>

                            <p className="mt-3 line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {slot.title || (isLive ? 'Abierto' : 'Cerrado')}
                            </p>

                            <footer className="mt-auto pt-3">
                                <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
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