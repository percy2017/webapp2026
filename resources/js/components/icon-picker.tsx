import {
    BarChart3,
    Calendar,
    CreditCard,
    Globe,
    Heart,
    Home,
    Image as ImageIcon,
    Info,
    Layers,
    Lightbulb,
    LifeBuoy,
    Link2,
    Lock,
    Mail,
    MapPin,
    Megaphone,
    MessageCircle,
    Package,
    Palette,
    Phone,
    Rocket,
    Settings,
    Shield,
    ShoppingBag,
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
import { cn } from '@/lib/utils';

export const MENU_ICONS: Record<string, LucideIcon> = {
    Home,
    Info,
    Layers,
    Zap,
    Shield,
    Rocket,
    Target,
    Heart,
    Star,
    Wand2,
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
    MapPin,
    Mail,
    Phone,
    Link2,
    LifeBuoy,
    ShoppingBag,
    Package,
    Lightbulb,
    Lock,
};

export function getMenuIcon(name: string | null | undefined): LucideIcon {
    if (name && MENU_ICONS[name]) return MENU_ICONS[name];
    return Link2;
}

type Props = {
    value: string | null | undefined;
    onChange: (value: string | null) => void;
};

export function IconPicker({ value, onChange }: Props) {
    const current = value && MENU_ICONS[value] ? value : null;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                    Ícono (opcional)
                </p>
                {current && (
                    <button
                        type="button"
                        onClick={() => onChange(null)}
                        className="text-xs text-muted-foreground underline hover:text-foreground"
                    >
                        Quitar
                    </button>
                )}
            </div>
            <div className="grid grid-cols-9 gap-1 sm:grid-cols-12">
                {Object.entries(MENU_ICONS).map(([name, Icon]) => {
                    const selected = name === current;
                    return (
                        <button
                            key={name}
                            type="button"
                            onClick={() => onChange(selected ? null : name)}
                            title={name}
                            aria-label={name}
                            aria-pressed={selected}
                            className={cn(
                                'inline-flex h-8 w-full items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
                                selected &&
                                    'border-primary bg-primary/10 text-primary',
                            )}
                        >
                            <Icon className="h-3.5 w-3.5" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}