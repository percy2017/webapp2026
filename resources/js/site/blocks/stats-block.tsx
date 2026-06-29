import {
    Heart,
    Clock,
    Eye,
    Star,
    Trophy,
    Users,
    Video,
    Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { BlockProps } from '@site/lib/basic-blocks-registry';

const ICON_MAP: Record<string, typeof Users> = {
    Users,
    Eye,
    Clock,
    Heart,
    Video,
    Star,
    Trophy,
    Zap,
};

type StatItem = {
    icon?: string;
    value?: number | string;
    suffix?: string;
    label: string;
};

const DEFAULT_ITEMS: StatItem[] = [
    { icon: 'Users', value: 12500, suffix: '+', label: 'Suscriptores' },
    { icon: 'Eye', value: 850000, suffix: '', label: 'Vistas totales' },
    { icon: 'Clock', value: 2400, suffix: ' h', label: 'Horas en vivo' },
    { icon: 'Heart', value: 4800, suffix: '+', label: 'Miembros' },
];

function parseNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string') {
        const cleaned = value.replace(/[^\d.-]/g, '');
        const n = Number.parseFloat(cleaned);

        return Number.isFinite(n) ? n : null;
    }

    return null;
}

function formatNumber(value: number): string {
    if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
    }

    if (value >= 1_000) {
        return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}K`;
    }

    return value.toString();
}

function useCountUp(target: number, duration = 1500) {
    const [value, setValue] = useState(0);
    const startedRef = useRef(false);

    useEffect(() => {
        if (startedRef.current) {
            return;
        }

        startedRef.current = true;

        const start = performance.now();
        let frame = 0;
        const tick = (now: number) => {
            const elapsed = now - start;
            const t = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - t, 3);
            setValue(Math.round(target * eased));

            if (t < 1) {
                frame = requestAnimationFrame(tick);
            }
        };
        frame = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(frame);
    }, [target, duration]);

    return value;
}

function StatCard({ item }: { item: StatItem }) {
    const target = parseNumber(item.value) ?? 0;
    const animated = useCountUp(target);
    const Icon = ICON_MAP[item.icon ?? 'Users'] ?? Users;
    const displayValue =
        parseNumber(item.value) === null
            ? String(item.value ?? '')
            : formatNumber(animated);

    return (
        <div className="group flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card/60 p-6 text-center shadow-sm backdrop-blur transition hover:border-primary/40 hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-6 w-6" />
            </div>
            <div className="font-mono text-3xl font-bold text-foreground tabular-nums sm:text-4xl">
                {displayValue}
                {item.suffix}
            </div>
            <div className="text-xs font-medium tracking-wider text-muted-foreground uppercase sm:text-sm">
                {item.label}
            </div>
        </div>
    );
}

export function StatsBlock({ content }: BlockProps) {
    const {
        eyebrow = '',
        title = 'En números',
        subtitle = '',
        items = DEFAULT_ITEMS,
        accent = 'primary',
    } = content as {
        eyebrow?: string;
        title?: string;
        subtitle?: string;
        items?: StatItem[];
        accent?: 'primary' | 'violet' | 'cyan';
    };

    const accentRing = {
        primary: 'ring-primary/20',
        violet: 'ring-violet-500/20',
        cyan: 'ring-cyan-500/20',
    }[accent];

    const list =
        Array.isArray(items) && items.length > 0 ? items : DEFAULT_ITEMS;

    return (
        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            {(eyebrow || title || subtitle) && (
                <div className="mb-8 text-center sm:mb-10">
                    {eyebrow && (
                        <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                            {eyebrow}
                        </p>
                    )}
                    {title && (
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            {title}
                        </h2>
                    )}
                    {subtitle && (
                        <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}
            <div
                className={`grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 ${accentRing}`}
            >
                {list.map((item, idx) => (
                    <StatCard key={`${item.label}-${idx}`} item={item} />
                ))}
            </div>
        </section>
    );
}
