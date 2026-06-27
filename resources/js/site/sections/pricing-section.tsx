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

export function PricingSection({ content, theme }: SectionProps) {
    const { title, subtitle, items } = content as {
        title?: string;
        subtitle?: string;
        items?: PricingItem[];
    };

    const list: PricingItem[] = Array.isArray(items) ? items : [];
    const primaryColor = theme?.primary_color;

    if (list.length === 0) return null;

    if (!title && list.length === 0) return null;

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

                {list.length > 0 && (
                    <div className="mt-8 grid gap-6 sm:mt-10 md:grid-cols-2 lg:grid-cols-3">
                        {list.map((plan, idx) => {
                            const features = Array.isArray(plan.features)
                                ? plan.features
                                : [];
                            const visibleFeatures = features.filter((f) =>
                                String(f?.feature ?? '').trim(),
                            );
                            const isFeatured = plan.highlighted === true;

                            return (
                                <div
                                    key={`${plan.name}-${idx}`}
                                    className={
                                        isFeatured
                                            ? 'relative flex flex-col rounded-2xl border-2 bg-card p-6 shadow-lg sm:p-8'
                                            : 'relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8'
                                    }
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
                                                    ? {
                                                          backgroundColor:
                                                              primaryColor,
                                                      }
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
                                                        ? {
                                                              color: primaryColor,
                                                          }
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
                                                variant={
                                                    isFeatured
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                style={
                                                    isFeatured && primaryColor
                                                        ? {
                                                              backgroundColor:
                                                                  primaryColor,
                                                              borderColor:
                                                                  primaryColor,
                                                          }
                                                        : undefined
                                                }
                                            >
                                                <a
                                                    href={
                                                        plan.cta_href ||
                                                        '#contact'
                                                    }
                                                >
                                                    {plan.cta_label}
                                                </a>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}