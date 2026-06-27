import {
    Clock,
    Mail,
    MapPin,
    Phone,
    type LucideIcon,
} from 'lucide-react';
import { MapBlock } from '@site/blocks/map-block';
import type { SectionProps } from '@site/lib/template-registry';

type ContactItem = {
    icon?: string;
    label?: string;
    value?: string;
    href?: string;
};

const ICON_MAP: Record<string, LucideIcon> = {
    MapPin,
    Phone,
    Mail,
    Clock,
};

function pickIcon(name?: string): LucideIcon {
    return (name && ICON_MAP[name]) || MapPin;
}

export function LocationSection({ content, theme }: SectionProps) {
    const items = Array.isArray(content.contact_info)
        ? (content.contact_info as ContactItem[])
        : [];

    const {
        eyebrow = 'Ubicación',
        title = '¿Dónde encontrarnos?',
        description = '',
        address = 'Obelisco, Buenos Aires',
        lat = -34.6037,
        lng = -58.3816,
        zoom = 15,
        marker = true,
        scroll_wheel_zoom = false,
        height = 'lg',
        radius = 'xl',
        show_contact_info = true,
        map_height = 'lg',
        map_radius = 'xl',
    } = content as {
        eyebrow?: string;
        title?: string;
        description?: string;
        address?: string;
        lat?: number | null;
        lng?: number | null;
        zoom?: number;
        marker?: boolean;
        scroll_wheel_zoom?: boolean;
        height?: string;
        radius?: string;
        show_contact_info?: boolean;
        map_height?: string;
        map_radius?: string;
    };

    const mapContent = {
        address,
        lat,
        lng,
        zoom,
        marker,
        scroll_wheel_zoom,
        height: map_height,
        radius: map_radius,
        caption: '',
    };

    return (
        <section className="bg-muted/30 px-4 py-12 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="mx-auto max-w-6xl">
                <div className="mx-auto max-w-2xl text-center">
                    {eyebrow && (
                        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                            {eyebrow}
                        </p>
                    )}
                    <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                        {title}
                    </h2>
                    {description && (
                        <p className="mt-4 text-lg text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>

                <div className="mt-12 grid gap-8 lg:grid-cols-5">
                    {show_contact_info && items.length > 0 && (
                        <div className="space-y-5 lg:col-span-2">
                            <ul className="space-y-5">
                                {items.map((item, idx) => {
                                    const Icon = pickIcon(item.icon);
                                    const value = item.value ?? '';
                                    const href = item.href ?? '';

                                    return (
                                        <li
                                            key={idx}
                                            className="flex items-start gap-4"
                                        >
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <Icon className="h-5 w-5" />
                                            </span>
                                            <div className="min-w-0">
                                                {item.label && (
                                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                        {item.label}
                                                    </p>
                                                )}
                                                {value &&
                                                    (href ? (
                                                        <a
                                                            href={href}
                                                            className="mt-0.5 block break-words text-base font-medium text-foreground hover:text-primary"
                                                        >
                                                            {value}
                                                        </a>
                                                    ) : (
                                                        <p className="mt-0.5 break-words text-base font-medium text-foreground">
                                                            {value}
                                                        </p>
                                                    ))}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}

                    <div
                        className={
                            show_contact_info && items.length > 0
                                ? 'lg:col-span-3'
                                : 'lg:col-span-5'
                        }
                    >
                        <MapBlock content={mapContent} />
                    </div>
                </div>
            </div>
        </section>
    );
}