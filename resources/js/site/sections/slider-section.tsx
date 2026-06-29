import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { SectionProps } from '@site/lib/template-registry';

type SlideItem = {
    eyebrow?: string;
    title?: string;
    description?: string;
    source?: 'url' | 'media';
    image_url?: string;
    image_media_id?: number | { id: number; url?: string | null } | null;
    cta_label?: string;
    cta_href?: string;
};

function resolveImage(item: SlideItem): string | null {
    const raw = item.image_media_id;

    if (raw && typeof raw === 'object' && 'url' in raw) {
        const obj = raw as { url?: unknown };

        if (typeof obj.url === 'string') {
            return obj.url;
        }
    }

    if (typeof item.image_url === 'string' && item.image_url) {
        return item.image_url;
    }

    return null;
}

const ASPECT_CLASS: Record<string, string> = {
    wide: 'aspect-[21/9]',
    video: 'aspect-video',
    square: 'aspect-square',
    tall: 'aspect-[3/4]',
};

const OVERLAY_CLASS: Record<string, string> = {
    left: 'justify-start text-left',
    center: 'justify-center text-center',
    right: 'justify-end text-right',
};

export function SliderSection({ content, theme }: SectionProps) {
    const {
        items = [],
        aspect = 'wide',
        overlay_position = 'left',
        autoplay = false,
        interval = 5,
        show_arrows = true,
        show_dots = true,
        radius = 'xl',
    } = content as {
        items?: SlideItem[];
        aspect?: 'wide' | 'video' | 'square' | 'tall';
        overlay_position?: 'left' | 'center' | 'right';
        autoplay?: boolean;
        interval?: number;
        show_arrows?: boolean;
        show_dots?: boolean;
        radius?: 'none' | 'sm' | 'md' | 'xl';
    };

    const primaryColor = theme?.primary_color;
    const slides: SlideItem[] = Array.isArray(items) ? items : [];
    const total = slides.length;

    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);

    const goTo = useCallback(
        (idx: number) => {
            if (total === 0) {
                return;
            }

            const next = ((idx % total) + total) % total;
            setCurrent(next);
        },
        [total],
    );

    const next = useCallback(() => goTo(current + 1), [current, goTo]);
    const prev = useCallback(() => goTo(current - 1), [current, goTo]);

    // Autoplay effect
    useEffect(() => {
        if (!autoplay || paused || total <= 1) {
            return;
        }

        const ms = Math.max(1, interval) * 1000;
        const id = window.setInterval(() => {
            setCurrent((c) => (c + 1) % total);
        }, ms);

        return () => window.clearInterval(id);
    }, [autoplay, paused, interval, total]);

    // Keyboard navigation
    useEffect(() => {
        if (total <= 1) {
            return;
        }

        function onKey(e: KeyboardEvent) {
            const root = document.getElementById('slider-section');

            if (!root) {
                return;
            }

            if (
                !root.matches(':hover') &&
                !root.contains(document.activeElement)
            ) {
                return;
            }

            if (e.key === 'ArrowLeft') {
                prev();
            }

            if (e.key === 'ArrowRight') {
                next();
            }
        }
        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [prev, next, total]);

    if (total === 0) {
        return (
            <section className="mx-auto w-full max-w-6xl px-4 pt-0 pb-12 sm:px-6 sm:pt-0 sm:pb-16 lg:px-8 lg:pt-0 lg:pb-20">
                <div className="flex aspect-[21/9] w-full items-center justify-center rounded-2xl border-2 border-dashed bg-muted/30 text-sm text-muted-foreground">
                    Agregá slides desde el panel derecho.
                </div>
            </section>
        );
    }

    const aspectCls = ASPECT_CLASS[aspect] ?? ASPECT_CLASS.wide;
    const overlayCls = OVERLAY_CLASS[overlay_position] ?? OVERLAY_CLASS.left;
    const radiusCls =
        radius === 'none'
            ? 'rounded-none'
            : radius === 'sm'
              ? 'rounded-lg'
              : radius === 'md'
                ? 'rounded-xl'
                : 'rounded-2xl';

    return (
        <section
            id="slider-section"
            className="w-full pt-0 pb-12 sm:pt-0 sm:pb-16 lg:pt-0 lg:pb-20"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div
                className={`relative w-full overflow-hidden ${radiusCls} bg-muted ${aspectCls}`}
            >
                {/* Slides track */}
                <div
                    className="flex h-full transition-transform duration-700 ease-out"
                    style={{ transform: `translateX(-${current * 100}%)` }}
                >
                    {slides.map((slide, idx) => {
                        const imageUrl = resolveImage(slide);

                        return (
                            <div
                                key={idx}
                                className="relative h-full w-full shrink-0"
                                aria-hidden={idx !== current}
                            >
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={slide.title ?? ''}
                                        className="absolute inset-0 h-full w-full object-cover"
                                        loading={idx === 0 ? 'eager' : 'lazy'}
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-background" />
                                )}

                                {/* Gradient overlay: más fuerte en sm+ donde
                                    hay texto encima que necesita contraste; en
                                    mobile (sin texto) queda solo un sutil
                                    viñeteo para no oscurecer la imagen. */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent sm:bg-gradient-to-t sm:from-black/90 sm:via-black/40 sm:to-black/30" />

                                {/* Contenido del slide — texto SOBRE la imagen,
                                    full-width. En mobile se oculta el bloque
                                    entero de texto (eyebrow/title/desc/CTA)
                                    porque la imagen manda en pantallas chicas;
                                    la card es angosta y el texto se vuelve
                                    ilegible sobre el gradiente. A partir de
                                    sm: se muestra. */}
                                <div
                                    className={`relative z-10 hidden h-full w-full p-6 sm:flex sm:p-12 lg:p-20 ${overlayCls}`}
                                >
                                    <div
                                        className={`flex max-w-2xl flex-col gap-3 text-white sm:gap-4 ${
                                            overlay_position === 'center'
                                                ? 'mx-auto items-center text-center'
                                                : overlay_position === 'right'
                                                  ? 'ml-auto items-end text-right'
                                                  : 'mr-auto items-start text-left'
                                        }`}
                                    >
                                        {slide.eyebrow && (
                                            <span
                                                className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase backdrop-blur-sm"
                                                style={
                                                    primaryColor
                                                        ? {
                                                              backgroundColor: `${primaryColor}55`,
                                                          }
                                                        : undefined
                                                }
                                            >
                                                {slide.eyebrow}
                                            </span>
                                        )}
                                        {slide.title && (
                                            <h3 className="text-3xl leading-[1.1] font-bold drop-shadow-lg sm:text-4xl lg:text-6xl">
                                                {slide.title}
                                            </h3>
                                        )}
                                        {slide.description && (
                                            <p className="max-w-lg text-base leading-relaxed text-white/95 drop-shadow sm:text-lg">
                                                {slide.description}
                                            </p>
                                        )}
                                        {slide.cta_label && (
                                            <Button
                                                asChild
                                                size="lg"
                                                className="mt-3 w-fit shadow-xl sm:mt-4"
                                                style={
                                                    primaryColor
                                                        ? {
                                                              backgroundColor:
                                                                  primaryColor,
                                                              borderColor:
                                                                  primaryColor,
                                                              color: '#fff',
                                                          }
                                                        : undefined
                                                }
                                            >
                                                <a
                                                    href={
                                                        slide.cta_href ||
                                                        '#contact'
                                                    }
                                                >
                                                    {slide.cta_label}
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Arrows */}
                {show_arrows && total > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={prev}
                            aria-label="Slide anterior"
                            className="absolute top-1/2 left-3 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md backdrop-blur transition-all hover:scale-105 hover:bg-white sm:left-4 sm:h-12 sm:w-12"
                        >
                            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>
                        <button
                            type="button"
                            onClick={next}
                            aria-label="Siguiente slide"
                            className="absolute top-1/2 right-3 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md backdrop-blur transition-all hover:scale-105 hover:bg-white sm:right-4 sm:h-12 sm:w-12"
                        >
                            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>
                    </>
                )}

                {/* Dots */}
                {show_dots && total > 1 && (
                    <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-6">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => goTo(idx)}
                                aria-label={`Ir al slide ${idx + 1}`}
                                aria-current={
                                    idx === current ? 'true' : undefined
                                }
                                className={`h-2 rounded-full transition-all ${
                                    idx === current
                                        ? 'w-8 bg-white'
                                        : 'w-2 bg-white/50 hover:bg-white/80'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Counter */}
            {total > 1 && (
                <p className="mt-3 text-center text-xs font-medium text-muted-foreground">
                    Slide{' '}
                    <span className="font-bold text-foreground">
                        {current + 1}
                    </span>{' '}
                    de {total}
                </p>
            )}
        </section>
    );
}
