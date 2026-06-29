import { ArrowRight, Clock, ImageIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SectionProps } from '@site/lib/template-registry';

type ServiceItem = {
    title?: string;
    description?: string;
    image_media_id?: number | { id: number; url?: string | null } | null;
    image_url?: string;
    duration_minutes?: number | string;
    price_from?: string;
    category?: string;
    cta_label?: string;
    cta_href?: string;
    highlighted?: boolean;
};

function resolveImage(item: ServiceItem): { url: string | null } {
    const raw = item.image_media_id;

    if (raw && typeof raw === 'object' && 'id' in raw) {
        const obj = raw as { id?: unknown; url?: unknown };

        if (typeof obj.url === 'string') {
            return { url: obj.url };
        }
    }

    if (typeof item.image_url === 'string') {
        return { url: item.image_url };
    }

    return { url: null };
}

function formatDuration(value: number | string | undefined): string {
    if (value === undefined || value === null || value === '') {
        return '';
    }

    const n =
        typeof value === 'number' ? value : Number.parseInt(String(value), 10);

    if (Number.isNaN(n) || n <= 0) {
        return '';
    }

    if (n < 60) {
        return `${n} min`;
    }

    const hours = Math.floor(n / 60);
    const mins = n % 60;

    if (mins === 0) {
        return `${hours} h`;
    }

    return `${hours} h ${mins} min`;
}

// Columnas desktop. En mobile se renderiza un carrusel horizontal con
// snap (no grid) — ver ServicesGridSection.
const COLS_CLASS: Record<string, string> = {
    '2': 'lg:grid-cols-2',
    '3': 'lg:grid-cols-3',
    '4': 'lg:grid-cols-4',
};

/**
 * Una card individual de servicio. Recibe `className` adicional para
 * que el wrapper móvil (carrusel horizontal) controle el ancho y el
 * wrapper desktop (grid) lo omita y deje que el grid lo estire.
 */
function ServiceCard({
    service,
    primaryColor,
    defaultCurrency,
    className = '',
}: {
    service: ServiceItem;
    primaryColor: string | undefined;
    defaultCurrency: string;
    className?: string;
}) {
    const image = resolveImage(service);
    const duration = formatDuration(service.duration_minutes);
    const price = service.price_from ?? '';
    const isFeatured = service.highlighted === true;

    return (
        <article
            className={`group flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${className} ${
                isFeatured ? 'ring-2 ring-primary' : 'border'
            }`}
            style={
                isFeatured && primaryColor
                    ? {
                          borderColor: primaryColor,
                          boxShadow: `0 0 0 2px ${primaryColor}`,
                      }
                    : undefined
            }
        >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                {image.url ? (
                    <img
                        src={image.url}
                        alt={service.title ?? ''}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted/40 text-muted-foreground">
                        <ImageIcon className="h-10 w-10" />
                    </div>
                )}
                {service.category && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold tracking-wider text-foreground uppercase shadow-sm backdrop-blur">
                        {service.category}
                    </span>
                )}
                {isFeatured && (
                    <span
                        className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow-sm"
                        style={
                            primaryColor
                                ? { backgroundColor: primaryColor }
                                : undefined
                        }
                    >
                        Más popular
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col p-5">
                {service.title && (
                    <h3 className="text-lg font-semibold text-foreground">
                        {service.title}
                    </h3>
                )}
                {service.description && (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {service.description}
                    </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {duration && (
                        <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {duration}
                        </span>
                    )}
                    {price && (
                        <span className="inline-flex items-baseline gap-1">
                            <span className="text-[10px] tracking-wider uppercase">
                                Desde
                            </span>
                            <span className="text-base font-bold text-foreground">
                                {price}
                            </span>
                            {defaultCurrency && (
                                <span className="text-xs text-muted-foreground">
                                    {defaultCurrency}
                                </span>
                            )}
                        </span>
                    )}
                </div>

                {service.cta_label && (
                    <div className="mt-5">
                        <Button
                            asChild
                            size="sm"
                            variant={isFeatured ? 'default' : 'outline'}
                            className="w-full"
                            style={
                                isFeatured && primaryColor
                                    ? {
                                          backgroundColor: primaryColor,
                                          borderColor: primaryColor,
                                      }
                                    : undefined
                            }
                        >
                            <a
                                href={service.cta_href || '#contact'}
                                aria-label={`${service.cta_label} — ${service.title ?? ''}`}
                            >
                                {service.cta_label}
                                <ArrowRight className="ml-2 h-3.5 w-3.5" />
                            </a>
                        </Button>
                    </div>
                )}
            </div>
        </article>
    );
}

export function ServicesGridSection({ content, theme }: SectionProps) {
    const {
        eyebrow = '',
        title = 'Nuestros servicios',
        subtitle = '',
        columns = '3',
        items = [],
        default_currency = '',
    } = content as {
        eyebrow?: string;
        title?: string;
        subtitle?: string;
        columns?: string;
        items?: ServiceItem[];
        default_currency?: string;
    };

    const primaryColor = theme?.primary_color;
    const list: ServiceItem[] = Array.isArray(items) ? items : [];
    const lgColsCls = COLS_CLASS[columns] ?? COLS_CLASS['3'];

    if (!title && list.length === 0) {
        return null;
    }

    return (
        <section
            id="services-grid"
            className="border-b bg-muted/30 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
        >
            <div className="mx-auto w-full max-w-6xl">
                {(eyebrow || title || subtitle) && (
                    <div className="mx-auto max-w-2xl text-center">
                        {eyebrow && (
                            <span
                                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                                style={
                                    primaryColor
                                        ? {
                                              backgroundColor: `${primaryColor}1a`,
                                              color: primaryColor,
                                          }
                                        : undefined
                                }
                            >
                                <Sparkles className="h-3 w-3" />
                                {eyebrow}
                            </span>
                        )}
                        {title && (
                            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                                {subtitle}
                            </p>
                        )}
                    </div>
                )}

                {list.length === 0 ? (
                    <p className="mt-10 text-center text-sm text-muted-foreground">
                        Agregá servicios desde el panel derecho.
                    </p>
                ) : (
                    <>
                        {/* Mobile: carrusel horizontal con scroll-snap.
                            Cada card tiene w-[85vw]; snap-start ancla la
                            siguiente al borde izquierdo. La barra nativa
                            se oculta vía [scrollbar-width:none] + WebKit
                            vendor. */}
                        <div className="mt-10 lg:hidden">
                            <div
                                className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                                role="region"
                                aria-label="Servicios"
                                aria-roledescription="carrusel"
                            >
                                {list.map((service, idx) => (
                                    <ServiceCard
                                        key={`m-${service.title}-${idx}`}
                                        service={service}
                                        primaryColor={primaryColor}
                                        defaultCurrency={default_currency}
                                        className="w-[85vw] shrink-0 snap-start"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Desktop: grid de columnas. Render separado del
                            mobile por la misma razón que en los demás
                            bloques: Tailwind no resuelve breakpoints
                            distintos en el mismo wrapper. */}
                        <div
                            className={`mt-10 hidden gap-6 lg:grid ${lgColsCls}`}
                        >
                            {list.map((service, idx) => (
                                <ServiceCard
                                    key={`d-${service.title}-${idx}`}
                                    service={service}
                                    primaryColor={primaryColor}
                                    defaultCurrency={default_currency}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
