import { ArrowLeftRight, ImageIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { BlockProps } from '@site/lib/basic-blocks-registry';

type BeforeAfterItem = {
    before_media_id?: number | { id: number; url?: string | null } | null;
    before_url?: string;
    after_media_id?: number | { id: number; url?: string | null } | null;
    after_url?: string;
    caption?: string;
    before_label?: string;
    after_label?: string;
};

function resolveUrl(
    field: unknown,
    fallback?: string,
): string | null {
    if (field && typeof field === 'object' && 'id' in field) {
        const obj = field as { id?: unknown; url?: unknown };

        if (typeof obj.url === 'string') {
return obj.url;
}
    }

    if (typeof fallback === 'string' && fallback.length > 0) {
return fallback;
}

    return null;
}

const ASPECT_CLASS: Record<string, string> = {
    square: 'aspect-square',
    video: 'aspect-video',
    tall: 'aspect-[3/4]',
    wide: 'aspect-[16/9]',
};

function BeforeAfterSlider({
    item,
    aspectCls,
    onImageMissing,
}: {
    item: BeforeAfterItem;
    aspectCls: string;
    onImageMissing: () => void;
}) {
    const beforeUrl = resolveUrl(item.before_media_id, item.before_url);
    const afterUrl = resolveUrl(item.after_media_id, item.after_url);
    const [position, setPosition] = useState<number>(50);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const draggingRef = useRef<boolean>(false);

    const updatePositionFromClientX = useCallback((clientX: number) => {
        const node = containerRef.current;

        if (!node) {
return;
}

        const rect = node.getBoundingClientRect();

        if (rect.width <= 0) {
return;
}

        const pct = ((clientX - rect.left) / rect.width) * 100;
        setPosition(Math.max(0, Math.min(100, pct)));
    }, []);

    useEffect(() => {
        function handleMove(event: MouseEvent | TouchEvent) {
            if (!draggingRef.current) {
return;
}

            const clientX =
                'touches' in event
                    ? event.touches[0]?.clientX ?? 0
                    : event.clientX;
            updatePositionFromClientX(clientX);
        }

        function handleUp() {
            draggingRef.current = false;
        }

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        window.addEventListener('touchmove', handleMove, { passive: true });
        window.addEventListener('touchend', handleUp);

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleUp);
        };
    }, [updatePositionFromClientX]);

    useEffect(() => {
        const node = containerRef.current;

        if (!node) {
return;
}

        function onKey(event: KeyboardEvent) {
            if (!node) {
return;
}

            if (event.key === 'ArrowLeft') {
                setPosition((p) => Math.max(0, p - 5));
            } else if (event.key === 'ArrowRight') {
                setPosition((p) => Math.min(100, p + 5));
            }
        }
        node.addEventListener('keydown', onKey);

        return () => node.removeEventListener('keydown', onKey);
    }, []);

    if (!beforeUrl || !afterUrl) {
        onImageMissing();

        return null;
    }

    return (
        <figure
            className={`relative w-full overflow-hidden rounded-2xl bg-muted ${aspectCls}`}
        >
            <div
                ref={containerRef}
                role="slider"
                tabIndex={0}
                aria-label="Comparador antes y después"
                aria-valuenow={Math.round(position)}
                aria-valuemin={0}
                aria-valuemax={100}
                onMouseDown={(event) => {
                    draggingRef.current = true;
                    updatePositionFromClientX(event.clientX);
                }}
                onTouchStart={(event) => {
                    draggingRef.current = true;
                    updatePositionFromClientX(
                        event.touches[0]?.clientX ?? 0,
                    );
                }}
                className="relative h-full w-full cursor-ew-resize select-none"
            >
                <img
                    src={afterUrl}
                    alt={item.after_label ?? 'Después'}
                    className="absolute inset-0 h-full w-full object-cover"
                    draggable={false}
                />
                <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${position}%` }}
                >
                    <img
                        src={beforeUrl}
                        alt={item.before_label ?? 'Antes'}
                        className="absolute inset-0 h-full w-full object-cover"
                        style={{ width: `${100 / (position / 100)}%`, maxWidth: 'none' }}
                        draggable={false}
                    />
                </div>

                {(item.before_label || item.after_label) && (
                    <>
                        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground shadow-sm backdrop-blur">
                            {item.before_label ?? 'Antes'}
                        </span>
                        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-foreground/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-background shadow-sm backdrop-blur">
                            {item.after_label ?? 'Después'}
                        </span>
                    </>
                )}

                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-background shadow-[0_0_0_1px_rgba(0,0,0,0.1)]"
                    style={{ left: `${position}%` }}
                />
                <button
                    type="button"
                    aria-label="Mover comparador"
                    onMouseDown={(event) => {
                        event.stopPropagation();
                        draggingRef.current = true;
                        updatePositionFromClientX(event.clientX);
                    }}
                    onTouchStart={(event) => {
                        event.stopPropagation();
                        draggingRef.current = true;
                        updatePositionFromClientX(
                            event.touches[0]?.clientX ?? 0,
                        );
                    }}
                    className="absolute top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-background bg-foreground text-background shadow-lg transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    style={{ left: `${position}%` }}
                >
                    <ArrowLeftRight className="h-4 w-4" />
                </button>
            </div>
        </figure>
    );
}

export function BeforeAfterBlock({ content }: BlockProps) {
    const items = Array.isArray(content.items)
        ? (content.items as BeforeAfterItem[])
        : [];

    const {
        title = '',
        subtitle = '',
        columns = '1',
        aspect = 'video',
        columns_mobile_stack = true,
    } = content as {
        title?: string;
        subtitle?: string;
        columns?: string;
        aspect?: string;
        columns_mobile_stack?: boolean;
    };

    const aspectCls = ASPECT_CLASS[aspect] ?? ASPECT_CLASS['video'];

    const colsCls =
        {
            '1': 'grid-cols-1',
            '2': columns_mobile_stack
                ? 'grid-cols-1 md:grid-cols-2'
                : 'grid-cols-1 sm:grid-cols-2',
        }[columns] ?? 'grid-cols-1';

    if (items.length === 0) {
        return (
            <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
                <ImageIcon className="mb-2 h-8 w-8" />
                Agregá pares de imágenes (antes / después) desde el panel derecho.
            </div>
        );
    }

    return (
        <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
            {(title || subtitle) && (
                <div className="mx-auto mb-6 max-w-2xl text-center">
                    {title && (
                        <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            {title}
                        </h3>
                    )}
                    {subtitle && (
                        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}
            <div className={`grid gap-6 ${colsCls}`}>
                {items.map((item, idx) => {
                    const beforeUrl = resolveUrl(
                        item.before_media_id,
                        item.before_url,
                    );
                    const afterUrl = resolveUrl(
                        item.after_media_id,
                        item.after_url,
                    );

                    if (!beforeUrl || !afterUrl) {
                        return (
                            <div
                                key={`empty-${idx}`}
                                className={`flex ${aspectCls} w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/30 text-xs text-muted-foreground`}
                            >
                                <ImageIcon className="mb-1 h-5 w-5" />
                                Antes y Después #{idx + 1}: faltan imágenes
                            </div>
                        );
                    }

                    return (
                        <div key={`pair-${idx}`} className="flex flex-col">
                            <BeforeAfterSlider
                                item={item}
                                aspectCls={aspectCls}
                                onImageMissing={() => {}}
                            />
                            {item.caption && (
                                <figcaption className="mt-2 text-center text-sm text-muted-foreground">
                                    {item.caption}
                                </figcaption>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}