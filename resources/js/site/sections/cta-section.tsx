import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SectionProps } from '@site/lib/template-registry';

export function CtaSection({ content, theme }: SectionProps) {
    const {
        title = '',
        subtitle = '',
        button_label = '',
        button_href = '',
        secondary_label = '',
        secondary_href = '',
    } = content as Record<string, string>;

    const primaryColor = theme?.primary_color;

    if (!title && !button_label) return null;

    return (
        <section
            id="cta"
            className="relative overflow-hidden border-y bg-muted py-12 sm:py-16 lg:py-20"
        >
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage: primaryColor
                        ? `radial-gradient(circle at 30% 50%, ${primaryColor}26, transparent 55%), radial-gradient(circle at 70% 50%, ${primaryColor}1a, transparent 55%)`
                        : undefined,
                }}
            />

            <div className="relative mx-auto w-full max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                {title && (
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                        {title}
                    </h2>
                )}
                {subtitle && (
                    <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground sm:mt-4 sm:text-lg">
                        {subtitle}
                    </p>
                )}

                {(button_label || secondary_label) && (
                    <div className="mt-6 flex w-full flex-col items-stretch justify-center gap-3 sm:mt-8 sm:flex-row sm:items-center">
                        {button_label && (
                            <Button
                                asChild
                                size="lg"
                                className="w-full sm:w-auto"
                                style={
                                    primaryColor
                                        ? {
                                              backgroundColor: primaryColor,
                                              borderColor: primaryColor,
                                              color: '#fff',
                                          }
                                        : undefined
                                }
                            >
                                <a href={button_href || '#contact'}>
                                    {button_label}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </a>
                            </Button>
                        )}
                        {secondary_label && (
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="w-full sm:w-auto"
                            >
                                <a href={secondary_href || '#features'}>
                                    {secondary_label}
                                </a>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}