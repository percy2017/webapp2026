import { Quote, Star } from 'lucide-react';
import type { SectionProps } from '@site/lib/template-registry';

type TestimonialItem = {
    quote?: string;
    author_name?: string;
    author_role?: string;
    author_image_media_id?:
        | number
        | { id: number; url?: string | null }
        | null;
    author_image_url?: string;
    rating?: number;
};

function resolveImage(
    item: TestimonialItem,
): { id: number | null; url: string | null } {
    const raw = item.author_image_media_id;
    if (raw && typeof raw === 'object' && 'id' in raw) {
        const obj = raw as { id?: unknown; url?: unknown };
        return {
            id: typeof obj.id === 'number' ? obj.id : null,
            url: typeof obj.url === 'string' ? obj.url : null,
        };
    }
    if (typeof raw === 'number') {
        return { id: raw, url: null };
    }
    if (typeof item.author_image_url === 'string') {
        return { id: null, url: item.author_image_url };
    }
    return { id: null, url: null };
}

function initials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
}

export function TestimonialsSection({ content, theme }: SectionProps) {
    const items = Array.isArray(content.items)
        ? (content.items as TestimonialItem[])
        : [];

    const {
        eyebrow = 'Testimonios',
        title = 'Lo que dicen nuestros clientes',
        description = '',
        columns = '3',
        variant = 'card',
        show_rating = false,
    } = content as {
        eyebrow?: string;
        title?: string;
        description?: string;
        columns?: string;
        variant?: string;
        show_rating?: boolean;
    };

    const colsCls =
        {
            '2': 'grid-cols-1 sm:grid-cols-2',
            '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
            '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        }[columns] ?? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

    if (items.length === 0) {
        return (
<section className="bg-muted/30 px-4 py-12 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
                <div className="mx-auto max-w-6xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        {title}
                    </h2>
                    {description && (
                        <p className="mt-4 text-lg text-muted-foreground">
                            {description}
                        </p>
                    )}
                    <p className="mt-6 text-sm text-muted-foreground">
                        Agregá testimonios desde el panel derecho.
                    </p>
                </div>
            </section>
        );
    }

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

                <div className={`mt-12 grid gap-6 ${colsCls}`}>
                    {items.map((item, idx) => {
                        const image = resolveImage(item);
                        const name = item.author_name ?? 'Anónimo';
                        const role = item.author_role ?? '';
                        const rating =
                            typeof item.rating === 'number'
                                ? Math.max(0, Math.min(5, Math.round(item.rating)))
                                : 0;
                        const isMinimal = variant === 'minimal';

                        return (
                            <figure
                                key={idx}
                                className={`relative flex h-full flex-col rounded-2xl p-6 shadow-sm ${
                                    isMinimal
                                        ? 'bg-transparent shadow-none'
                                        : 'bg-card ring-1 ring-border'
                                }`}
                            >
                                <Quote
                                    className="h-7 w-7 text-primary/30"
                                    aria-hidden
                                />

                                {item.quote && (
                                    <blockquote
                                        className="mt-3 flex-1 text-sm leading-relaxed text-foreground"
                                        dangerouslySetInnerHTML={{
                                            __html: item.quote,
                                        }}
                                    />
                                )}

                                {show_rating && rating > 0 && (
                                    <div
                                        className="mt-4 flex items-center gap-0.5"
                                        aria-label={`${rating} de 5 estrellas`}
                                    >
                                        {Array.from({ length: 5 }).map(
                                            (_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${
                                                        i < rating
                                                            ? 'fill-amber-400 text-amber-400'
                                                            : 'text-muted/30'
                                                    }`}
                                                />
                                            ),
                                        )}
                                    </div>
                                )}

                                <figcaption className="mt-6 flex items-center gap-3 border-t border-border/60 pt-4">
                                    <div
                                        className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold text-primary"
                                        aria-hidden
                                    >
                                        {image.url ? (
                                            <img
                                                src={image.url}
                                                alt={name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span>{initials(name) || '?'}</span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold">
                                            {name}
                                        </p>
                                        {role && (
                                            <p className="truncate text-xs text-muted-foreground">
                                                {role}
                                            </p>
                                        )}
                                    </div>
                                </figcaption>
                            </figure>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}