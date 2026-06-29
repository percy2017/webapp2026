import { Images, ZoomIn } from 'lucide-react';
import type { BlockProps } from '@site/lib/basic-blocks-registry';

const COLS_CLASS: Record<string, string> = {
    '2': 'sm:grid-cols-2',
    '3': 'sm:grid-cols-2 lg:grid-cols-3',
    '4': 'lg:grid-cols-4',
    '5': 'lg:grid-cols-5',
    '6': 'lg:grid-cols-6',
};

const ASPECT_CLASS: Record<string, string> = {
    auto: '',
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
    tall: 'aspect-[3/4]',
};

const GAP_CLASS: Record<string, string> = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-3 sm:gap-4',
    lg: 'gap-4 sm:gap-6',
};

const RADIUS_CLASS: Record<string, string> = {
    none: 'rounded-none',
    sm: 'rounded-md',
    md: 'rounded-xl',
    xl: 'rounded-2xl',
};

type GalleryItem = {
    image_media_id?: number | { id: number; url?: string | null } | null;
    image_url?: string;
    alt?: string;
    caption?: string;
};

function resolveItem(item: GalleryItem): {
    url: string | null;
    alt: string;
    caption: string;
} {
    const raw = item.image_media_id;
    let url: string | null = null;

    if (raw && typeof raw === 'object' && 'id' in raw) {
        const obj = raw as { url?: unknown };

        if (typeof obj.url === 'string') {
            url = obj.url;
        }
    }

    if (!url && typeof item.image_url === 'string' && item.image_url) {
        url = item.image_url;
    }

    return {
        url,
        alt: typeof item.alt === 'string' ? item.alt : '',
        caption: typeof item.caption === 'string' ? item.caption : '',
    };
}

/**
 * Una figura individual de galería. Recibe `className` adicional
 * para que el wrapper móvil (carrusel horizontal) pueda fijar el
 * ancho de la imagen y el wrapper desktop (grid) lo omita y deje
 * que el grid la estire.
 *
 * Si la imagen está vacía se renderiza un placeholder dashed igual
 * al del bloque original — el estado vacío se preserva en ambos
 * wrappers.
 */
function GalleryFigure({
    item,
    idx,
    aspectCls,
    radiusCls,
    showCaptions,
    className = '',
}: {
    item: GalleryItem;
    idx: number;
    aspectCls: string;
    radiusCls: string;
    showCaptions: boolean;
    className?: string;
}) {
    const { url, alt, caption } = resolveItem(item);

    if (!url) {
        return (
            <div
                key={idx}
                className={`flex aspect-square w-full flex-col items-center justify-center border-2 border-dashed bg-muted/30 text-xs text-muted-foreground ${radiusCls} ${className}`}
            >
                <Images className="mb-1 h-5 w-5 opacity-60" />
                Vacía
            </div>
        );
    }

    return (
        <figure
            className={`group relative overflow-hidden bg-muted ${radiusCls} ${aspectCls} ${className}`}
        >
            <img
                src={url}
                alt={alt}
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                loading="lazy"
            />

            {/* Hover overlay: solo visible cuando hay imagen */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {/* Icono de zoom */}
            <div className="pointer-events-none absolute top-3 right-3 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-white/90 text-foreground opacity-0 shadow-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <ZoomIn className="h-4 w-4" />
            </div>

            {/* Caption: dentro del figure, parte inferior */}
            {showCaptions && caption && (
                <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/80 to-black/0 px-3 py-3 text-sm font-medium text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:px-4 sm:py-4">
                    {caption}
                </figcaption>
            )}
        </figure>
    );
}

export function GalleryBlock({ content }: BlockProps) {
    const items = Array.isArray(content.items)
        ? (content.items as GalleryItem[])
        : [];

    const {
        eyebrow = '',
        title = '',
        subtitle = '',
        columns = '3',
        aspect = 'square',
        gap = 'md',
        radius = 'xl',
        show_captions = true,
    } = content as {
        eyebrow?: string;
        title?: string;
        subtitle?: string;
        columns?: string;
        aspect?: string;
        gap?: string;
        radius?: string;
        show_captions?: boolean;
    };

    const colsCls = COLS_CLASS[columns] ?? COLS_CLASS['3'];
    const aspectCls = ASPECT_CLASS[aspect] ?? ASPECT_CLASS['square'];
    const gapCls = GAP_CLASS[gap] ?? GAP_CLASS['md'];
    const radiusCls = RADIUS_CLASS[radius] ?? RADIUS_CLASS['xl'];

    if (items.length === 0) {
        return (
            <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/30 p-10 text-center text-sm text-muted-foreground">
                <Images className="mb-3 h-8 w-8 opacity-60" />
                Agregá imágenes desde el panel derecho para empezar.
            </div>
        );
    }

    return (
        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16 lg:py-20">
            {(eyebrow || title || subtitle) && (
                <div className="mb-8 text-center sm:mb-10">
                    {eyebrow && (
                        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                            <Images className="h-3.5 w-3.5" />
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
                </div>
            )}

            {/* Mobile: carrusel horizontal con scroll-snap, una imagen
                por fila (w-[85vw]) — la galeria es lo más importante
                del bloque, queremos que cada foto tenga su momento.
                Hidden a partir de sm: y el grid desktop se encarga del
                resto. */}
            <div className="sm:hidden">
                <div
                    className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    role="region"
                    aria-label="Galería"
                    aria-roledescription="carrusel"
                >
                    {items.map((item, idx) => (
                        <GalleryFigure
                            key={`m-${idx}`}
                            item={item}
                            idx={idx}
                            aspectCls={aspectCls}
                            radiusCls={radiusCls}
                            showCaptions={show_captions}
                            className="w-[85vw] shrink-0 snap-start"
                        />
                    ))}
                </div>
            </div>

            {/* Desktop: grid responsivo (sm:2 / md:3 / lg:columns).
                Render separado del mobile porque Tailwind no resuelve
                breakpoints distintos en el mismo wrapper. */}
            <div className={`hidden grid-cols-2 sm:grid ${gapCls} ${colsCls}`}>
                {items.map((item, idx) => (
                    <GalleryFigure
                        key={`d-${idx}`}
                        item={item}
                        idx={idx}
                        aspectCls={aspectCls}
                        radiusCls={radiusCls}
                        showCaptions={show_captions}
                    />
                ))}
            </div>
        </section>
    );
}
