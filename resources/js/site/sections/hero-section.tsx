import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SectionProps } from '@site/lib/template-registry';

export function HeroSection({ content, theme }: SectionProps) {
    const {
        eyebrow,
        headline,
        subheadline,
        cta_label,
        cta_href,
        secondary_label,
        secondary_href,
        image_url,
        image_url_thumb,
    } = content as Record<string, string>;

    const primaryColor = theme?.primary_color;
    const heroImage = image_url || image_url_thumb;

    return (
        <section
            id="hero"
            className="relative overflow-hidden border-b bg-gradient-to-b from-background via-background to-muted/30"
        >
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(60%_60%_at_50%_30%,black,transparent)]"
            >
                <div
                    className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl sm:h-96 sm:w-96"
                    style={
                        primaryColor
                            ? { backgroundColor: `${primaryColor}1a` }
                            : undefined
                    }
                />
                <div className="absolute right-1/4 top-1/2 hidden h-72 w-72 rounded-full bg-blue-500/10 blur-3xl sm:block" />
            </div>

            <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-12 sm:px-6 sm:py-16 md:gap-8 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-8 lg:py-20">
                <div className="flex flex-col justify-center text-center sm:text-left">
                    {eyebrow && (
                        <span className="mx-auto inline-flex w-fit items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground sm:mx-0">
                            <Sparkles
                                className="h-3 w-3 text-primary"
                                style={
                                    primaryColor
                                        ? { color: primaryColor }
                                        : undefined
                                }
                            />
                            {eyebrow}
                        </span>
                    )}

                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:mt-4 sm:text-4xl md:text-5xl lg:text-6xl">
                        {headline || (
                            <span className="text-muted-foreground">
                                Configurá el titular desde el panel derecho →
                            </span>
                        )}
                    </h1>

                    {subheadline && (
                        <p className="mt-3 max-w-xl text-base text-muted-foreground sm:mt-4 sm:text-lg md:max-w-2xl">
                            {subheadline}
                        </p>
                    )}

                    {(cta_label || secondary_label) && (
                        <div className="mt-4 flex w-full flex-col items-stretch justify-center gap-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-start">
                            {cta_label && (
                                <Button asChild size="lg" className="w-full sm:w-auto">
                                    <a href={cta_href || '#contact'}>
                                        {cta_label}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </a>
                                </Button>
                            )}
                            {secondary_label && (
                                <Button
                                    asChild
                                    variant="outline"
                                    size="lg"
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

                <div className="relative flex items-center justify-center lg:justify-end">
                    {heroImage ? (
                        <img
                            src={heroImage}
                            alt=""
                            className="aspect-video w-full max-w-md rounded-2xl border bg-card object-cover shadow-xl sm:max-w-lg lg:max-w-none"
                        />
                    ) : (
                        <div className="flex aspect-video w-full max-w-md flex-col items-center justify-center rounded-2xl border bg-card p-8 text-center shadow-xl sm:max-w-lg lg:max-w-none">
                            <Sparkles
                                className="h-10 w-10 text-primary sm:h-12 sm:w-12"
                                style={
                                    primaryColor
                                        ? { color: primaryColor }
                                        : undefined
                                }
                            />
                            <p className="mt-4 text-sm text-muted-foreground">
                                Elegí una imagen desde Medios para mostrarla acá.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}