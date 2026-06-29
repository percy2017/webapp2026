import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SectionProps } from '@site/lib/template-registry';

type PricingItem = {
    name?: string;
    price?: string;
    description?: string;
    features?: Array<{ feature?: string }>;
    highlighted?: boolean;
    cta_label?: string;
    cta_href?: string;
};

/**
 * Una card individual de plan. Recibe `className` adicional para que el
 * wrapper móvil (scroll horizontal) pueda fijar el ancho mientras el
 * wrapper desktop (grid) omite la clase extra y deja que el grid la
 * estire.
 */
function PricingCard({
    plan,
    primaryColor,
    className = '',
}: {
    plan: PricingItem;
    primaryColor: string | undefined;
    className?: string;
}) {
    const features = Array.isArray(plan.features) ? plan.features : [];
    const visibleFeatures = features.filter((f) =>
        String(f?.feature ?? '').trim(),
    );
    const isFeatured = plan.highlighted === true;

    return (
        <div
            key={`${plan.name}-${className}`}
            className={`relative flex h-full flex-col rounded-2xl p-6 shadow-sm sm:p-8 ${
                isFeatured ? 'border-2 bg-card shadow-lg' : 'border bg-card'
            } ${className}`}
            style={
                isFeatured && primaryColor
                    ? { borderColor: primaryColor }
                    : undefined
            }
        >
            {isFeatured && (
                <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold text-primary-foreground shadow"
                    style={
                        primaryColor
                            ? { backgroundColor: primaryColor }
                            : undefined
                    }
                >
                    Más popular
                </span>
            )}

            <div>
                {plan.name && (
                    <h3
                        className={
                            isFeatured
                                ? 'text-lg font-semibold text-primary'
                                : 'text-lg font-semibold text-foreground'
                        }
                        style={
                            isFeatured && primaryColor
                                ? { color: primaryColor }
                                : undefined
                        }
                    >
                        {plan.name}
                    </h3>
                )}
                {plan.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                        {plan.description}
                    </p>
                )}
                {plan.price && (
                    <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                            {plan.price}
                        </span>
                    </div>
                )}
            </div>

            {visibleFeatures.length > 0 && (
                <ul className="mt-6 space-y-3 text-sm">
                    {visibleFeatures.map((item, fIdx) => (
                        <li
                            key={fIdx}
                            className="flex items-start gap-2.5"
                        >
                            <span
                                className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                                style={
                                    primaryColor
                                        ? {
                                              backgroundColor: `${primaryColor}1a`,
                                              color: primaryColor,
                                          }
                                        : undefined
                                }
                            >
                                <Check className="h-2.5 w-2.5" />
                            </span>
                            <span className="text-muted-foreground">
                                {item.feature}
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            {plan.cta_label && (
                <div className="mt-8 pt-2">
                    <Button
                        asChild
                        size="lg"
                        className="w-full"
                        variant={isFeatured ? 'default' : 'outline'}
                        style={
                            isFeatured && primaryColor
                                ? {
                                      backgroundColor: primaryColor,
                                      borderColor: primaryColor,
                                  }
                                : undefined
                        }
                    >
                        <a href={plan.cta_href || '#contact'}>
                            {plan.cta_label}
                        </a>
                    </Button>
                </div>
            )}
        </div>
    );
}

export function PricingSection({ content, theme }: SectionProps) {
    const { title, subtitle, items } = content as {
        title?: string;
        subtitle?: string;
        items?: PricingItem[];
    };

    const list: PricingItem[] = Array.isArray(items) ? items : [];
    const primaryColor = theme?.primary_color;

    if (list.length === 0) {
        return null;
    }

    if (!title && list.length === 0) {
        return null;
    }

    return (
        <section
            id="pricing"
            className="border-b bg-background py-12 sm:py-16 lg:py-20"
        >
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                {(title || subtitle) && (
                    <div className="text-center">
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
                            Planes
                        </span>
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

                {/* Mobile: carrusel horizontal con scroll-snap. Una card
                    visible a la vez (w-[85vw]) para que el plan
                    destacado no se aplaste y el botón CTA quede a
                    tamaño cómodo. snap-start ancla la siguiente card
                    al borde izquierdo; la barra nativa se oculta. */}
                {list.length > 0 && (
                    <div className="mt-8 sm:mt-10 lg:hidden">
                        <div
                            className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                            role="region"
                            aria-label="Planes"
                            aria-roledescription="carrusel"
                        >
                            {list.map((plan, idx) => (
                                <PricingCard
                                    key={`m-${plan.name}-${idx}`}
                                    plan={plan}
                                    primaryColor={primaryColor}
                                    className="w-[85vw] shrink-0 snap-start"
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Desktop: grid de columnas. Render separado del mobile
                    por la misma razón que en testimonios: Tailwind no
                    resuelve breakpoints distintos en el mismo wrapper. */}
                {list.length > 0 && (
                    <div className="mt-8 hidden gap-6 sm:mt-10 md:grid md:grid-cols-2 lg:grid lg:grid-cols-4">
                        {list.map((plan, idx) => (
                            <PricingCard
                                key={`d-${plan.name}-${idx}`}
                                plan={plan}
                                primaryColor={primaryColor}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
