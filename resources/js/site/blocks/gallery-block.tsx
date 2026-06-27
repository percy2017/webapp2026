import { ImageIcon } from 'lucide-react';
import type { BlockProps } from '@site/lib/basic-blocks-registry';

const COLS_CLASS: Record<string, string> = {
    '2': 'grid-cols-2',
    '3': 'grid-cols-2 sm:grid-cols-3',
    '4': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    '5': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
    '6': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
};

const ASPECT_CLASS: Record<string, string> = {
    auto: '',
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
};

const GAP_CLASS: Record<string, string> = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
};

const RADIUS_CLASS: Record<string, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-lg',
    xl: 'rounded-xl',
};

type GalleryItem = {
    image_media_id?: number | { id: number; url?: string | null } | null;
    image_url?: string;
    alt?: string;
    caption?: string;
};

function resolveItem(item: GalleryItem): {
    id: number | null;
    url: string | null;
    alt: string;
    caption: string;
} {
    const raw = item.image_media_id;
    let id: number | null = null;
    let url: string | null = null;

    if (raw && typeof raw === 'object' && 'id' in raw) {
        id = typeof raw.id === 'number' ? raw.id : null;
        url = typeof raw.url === 'string' ? raw.url : null;
    } else if (typeof raw === 'number') {
        id = raw;
    }

    if (!url && typeof item.image_url === 'string') {
        url = item.image_url;
    }

    return {
        id,
        url,
        alt: typeof item.alt === 'string' ? item.alt : '',
        caption: typeof item.caption === 'string' ? item.caption : '',
    };
}

export function GalleryBlock({ content }: BlockProps) {
    const items = Array.isArray(content.items)
        ? (content.items as GalleryItem[])
        : [];

    const {
        columns = '3',
        aspect = 'square',
        gap = 'md',
        radius = 'md',
    } = content as {
        columns?: string;
        aspect?: string;
        gap?: string;
        radius?: string;
    };

    const colsCls = COLS_CLASS[columns] ?? COLS_CLASS['3'];
    const aspectCls = ASPECT_CLASS[aspect] ?? '';
    const gapCls = GAP_CLASS[gap] ?? GAP_CLASS['md'];
    const radiusCls = RADIUS_CLASS[radius] ?? RADIUS_CLASS['md'];

    if (items.length === 0) {
        return (
            <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
                <ImageIcon className="mb-2 h-8 w-8" />
                Agregá imágenes desde el panel derecho.
            </div>
        );
    }

    return (
        <div className={`grid ${colsCls} ${gapCls}`}>
            {items.map((item, idx) => {
                const { id, url, alt, caption } = resolveItem(item);

                if (!id && !url) {
                    return (
                        <div
                            key={idx}
                            className={`flex aspect-square w-full flex-col items-center justify-center border-2 border-dashed bg-muted/30 text-xs text-muted-foreground ${radiusCls}`}
                        >
                            <ImageIcon className="mb-1 h-5 w-5" />
                            Vacía
                        </div>
                    );
                }

                return (
                    <figure
                        key={idx}
                        className={`overflow-hidden bg-muted ${radiusCls} ${aspectCls}`}
                    >
                        {url ? (
                            <img
                                src={url}
                                alt={alt}
                                className={`h-full w-full object-cover ${radiusCls}`}
                                loading="lazy"
                            />
                        ) : null}
                        {caption && (
                            <figcaption className="bg-background/80 px-2 py-1.5 text-center text-xs text-muted-foreground">
                                {caption}
                            </figcaption>
                        )}
                    </figure>
                );
            })}
        </div>
    );
}