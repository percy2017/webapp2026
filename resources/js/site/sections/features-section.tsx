import {
    BarChart3,
    Calendar,
    CreditCard,
    Globe,
    Heart,
    Image as ImageIcon,
    Layers,
    Lightbulb,
    Lock,
    Megaphone,
    MessageCircle,
    Palette,
    Rocket,
    Settings,
    Shield,
    Smartphone,
    Sparkles,
    Star,
    Target,
    TrendingUp,
    Users,
    Wand2,
    Wrench,
    Zap,
    type LucideIcon,
} from 'lucide-react';
import type { SectionProps } from '@site/lib/template-registry';

type FeatureItem = {
    icon?: string;
    title?: string;
    description?: string;
};

const ICON_MAP: Record<string, LucideIcon> = {
    Sparkles,
    Layers,
    Zap,
    Shield,
    Rocket,
    Target,
    Heart,
    Star,
    Wand2,
    Lightbulb,
    Users,
    MessageCircle,
    Globe,
    Smartphone,
    CreditCard,
    TrendingUp,
    Megaphone,
    Palette,
    Settings,
    Wrench,
    Calendar,
    BarChart3,
    Image: ImageIcon,
};

function getIcon(name?: string): LucideIcon {
    if (name && ICON_MAP[name]) return ICON_MAP[name];
    return Sparkles;
}

export function FeaturesSection({ content, theme }: SectionProps) {
    const { title, subtitle, items } = content as {
        title?: string;
        subtitle?: string;
        items?: FeatureItem[];
    };

    const list: FeatureItem[] = Array.isArray(items) ? items : [];
    const primaryColor = theme?.primary_color;

    if (!title && list.length === 0) return null;

    return (
        <section
            id="features"
            className="border-b bg-background py-12 sm:py-16 lg:py-20"
        >
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                {(title || subtitle) && (
                    <div className="mx-auto max-w-2xl text-center">
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
                            Características
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
                    <div className="mt-8 grid gap-6 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
                        {list.map((item, idx) => {
                            const Icon = getIcon(item.icon);
                            return (
                                <div
                                    key={`${item.title}-${idx}`}
                                    className="group relative rounded-xl border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                                >
                                    <div
                                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                                        style={
                                            primaryColor
                                                ? {
                                                      backgroundColor: `${primaryColor}1a`,
                                                      color: primaryColor,
                                                  }
                                                : undefined
                                        }
                                    >
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    {item.title && (
                                        <h3 className="mt-4 text-lg font-semibold text-foreground">
                                            {item.title}
                                        </h3>
                                    )}
                                    {item.description && (
                                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                            {item.description}
                                        </p>
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