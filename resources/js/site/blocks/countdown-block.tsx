import { Timer } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { BlockProps } from '@site/lib/basic-blocks-registry';

const ACCENT_CLASS: Record<string, string> = {
    primary: 'bg-primary text-primary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    muted: 'bg-card text-foreground ring-1 ring-border',
};

const ACCENT_RING: Record<string, string> = {
    primary: 'ring-primary/20',
    destructive: 'ring-destructive/20',
    muted: 'ring-border',
};

const SIZE_CLASS: Record<string, Record<string, string>> = {
    sm: { value: 'text-2xl', label: 'text-[10px]' },
    md: { value: 'text-4xl', label: 'text-xs' },
    lg: { value: 'text-6xl', label: 'text-sm' },
};

type Countdown = {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    done: boolean;
};

function diff(targetMs: number): Countdown {
    const now = Date.now();
    const delta = targetMs - now;
    if (delta <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
    }
    const seconds = Math.floor(delta / 1000) % 60;
    const minutes = Math.floor(delta / (1000 * 60)) % 60;
    const hours = Math.floor(delta / (1000 * 60 * 60)) % 24;
    const days = Math.floor(delta / (1000 * 60 * 60 * 24));
    return { days, hours, minutes, seconds, done: false };
}

function parseTarget(value: unknown): number | null {
    if (typeof value !== 'string' || !value.trim()) return null;
    const direct = new Date(value);
    if (!Number.isNaN(direct.getTime())) return direct.getTime();

    const match = value
        .trim()
        .match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?$/);
    if (!match) return null;
    const [, y, m, d, hh = '00', mm = '00'] = match;
    const iso = `${y}-${m}-${d}T${hh}:${mm}:00`;
    const fallback = new Date(iso);
    return Number.isNaN(fallback.getTime()) ? null : fallback.getTime();
}

function pad(n: number): string {
    return n.toString().padStart(2, '0');
}

export function CountdownBlock({ content }: BlockProps) {
    const {
        target_date = '',
        title = 'Oferta termina en',
        expired_text = '¡Oferta terminada!',
        variant = 'boxes',
        size = 'md',
        accent = 'primary',
    } = content as {
        target_date?: string;
        title?: string;
        expired_text?: string;
        variant?: string;
        size?: string;
        accent?: string;
    };

    const [time, setTime] = useState<Countdown>(() =>
        parseTarget(target_date)
            ? diff(parseTarget(target_date) as number)
            : { days: 0, hours: 0, minutes: 0, seconds: 0, done: true },
    );

    useEffect(() => {
        const targetMs = parseTarget(target_date);
        if (targetMs === null) {
            setTime({ days: 0, hours: 0, minutes: 0, seconds: 0, done: true });
            return;
        }

        setTime(diff(targetMs));
        const tick = setInterval(() => {
            const next = diff(targetMs);
            setTime(next);
            if (next.done) clearInterval(tick);
        }, 1000);

        return () => clearInterval(tick);
    }, [target_date]);

    if (!parseTarget(target_date)) {
        return (
            <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
                <Timer className="mb-2 h-8 w-8" />
                Configurá una fecha objetivo en el panel derecho.
            </div>
        );
    }

    const accentCls = ACCENT_CLASS[accent] ?? ACCENT_CLASS['primary'];
    const ringCls = ACCENT_RING[accent] ?? ACCENT_RING['primary'];
    const sizeCls = SIZE_CLASS[size] ?? SIZE_CLASS['md'];

    if (time.done) {
        return (
            <div className={`mx-auto max-w-md rounded-2xl px-6 py-5 text-center ${accentCls}`}>
                <p className="text-lg font-semibold sm:text-xl">
                    {expired_text}
                </p>
            </div>
        );
    }

    if (variant === 'inline') {
        return (
            <div className="flex flex-col items-center gap-2 text-center">
                {title && (
                    <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                        {title}
                    </p>
                )}
                <p
                    className={`font-mono font-bold tabular-nums ${sizeCls.value}`}
                >
                    {time.days}d {pad(time.hours)}h {pad(time.minutes)}m{' '}
                    {pad(time.seconds)}s
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-4 text-center">
            {title && (
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                    {title}
                </p>
            )}
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {(
                    [
                        { label: 'Días', value: time.days },
                        { label: 'Horas', value: time.hours },
                        { label: 'Minutos', value: time.minutes },
                        { label: 'Segundos', value: time.seconds },
                    ] as const
                ).map((unit) => (
                    <div
                        key={unit.label}
                        className={`flex min-w-[4rem] flex-col items-center justify-center rounded-xl px-3 py-3 ring-1 sm:min-w-[5rem] sm:px-4 sm:py-4 ${accentCls} ${ringCls}`}
                    >
                        <span
                            className={`font-mono font-bold leading-none tabular-nums ${sizeCls.value}`}
                        >
                            {pad(unit.value)}
                        </span>
                        <span
                            className={`mt-1.5 font-medium uppercase tracking-wider opacity-80 ${sizeCls.label}`}
                        >
                            {unit.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}