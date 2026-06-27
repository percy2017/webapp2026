import {
    BarChart3,
    Bell,
    Calendar,
    Camera,
    CreditCard,
    Globe,
    Heart,
    Image as ImageIcon,
    Instagram,
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
    Twitch,
    Twitter,
    Users,
    Wand2,
    Wrench,
    Youtube,
    Zap,
    type LucideIcon,
} from 'lucide-react';
import type { CustomField } from '@puckeditor/core';
import { cn } from '@/lib/utils';

const ICONS: { name: string; Icon: LucideIcon }[] = [
    { name: 'Twitch', Icon: Twitch },
    { name: 'Youtube', Icon: Youtube },
    { name: 'Instagram', Icon: Instagram },
    { name: 'Twitter', Icon: Twitter },
    { name: 'Camera', Icon: Camera },
    { name: 'Bell', Icon: Bell },
    { name: 'Zap', Icon: Zap },
    { name: 'Sparkles', Icon: Sparkles },
    { name: 'Rocket', Icon: Rocket },
    { name: 'Shield', Icon: Shield },
    { name: 'Palette', Icon: Palette },
    { name: 'Smartphone', Icon: Smartphone },
    { name: 'BarChart3', Icon: BarChart3 },
    { name: 'Users', Icon: Users },
    { name: 'MessageCircle', Icon: MessageCircle },
    { name: 'Globe', Icon: Globe },
    { name: 'Heart', Icon: Heart },
    { name: 'Star', Icon: Star },
    { name: 'Wand2', Icon: Wand2 },
    { name: 'Lightbulb', Icon: Lightbulb },
    { name: 'CreditCard', Icon: CreditCard },
    { name: 'TrendingUp', Icon: TrendingUp },
    { name: 'Megaphone', Icon: Megaphone },
    { name: 'Settings', Icon: Settings },
    { name: 'Wrench', Icon: Wrench },
    { name: 'Calendar', Icon: Calendar },
    { name: 'Layers', Icon: Layers },
    { name: 'Target', Icon: Target },
    { name: 'Lock', Icon: Lock },
    { name: 'Image', Icon: ImageIcon },
];

type Props = {
    value: unknown;
    onChange: (value: string) => void;
};

function IconField({ value, onChange }: Props) {
    const current =
        typeof value === 'string' && ICONS.some((i) => i.name === value)
            ? value
            : null;

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-6 gap-1.5">
                {ICONS.map(({ name, Icon }) => {
                    const selected = name === current;
                    return (
                        <button
                            key={name}
                            type="button"
                            onClick={() => onChange(name)}
                            title={name}
                            aria-label={name}
                            aria-pressed={selected}
                            className={cn(
                                'inline-flex h-9 w-full items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
                                selected &&
                                    'border-primary bg-primary/10 text-primary',
                            )}
                        >
                            <Icon className="h-4 w-4" />
                        </button>
                    );
                })}
            </div>
            {current && (
                <p className="text-[11px] text-muted-foreground">
                    Ícono seleccionado: <span className="font-medium">{current}</span>
                </p>
            )}
        </div>
    );
}

export const iconField: CustomField<string> = {
    type: 'custom',
    render: (props) => <IconField {...props} />,
};