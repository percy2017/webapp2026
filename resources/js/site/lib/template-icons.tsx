import {
    BarChart3,
    Building2,
    Calendar,
    Clock,
    CreditCard,
    Dumbbell,
    Heart,
    Home,
    Hotel,
    Image as ImageIcon,
    LayoutGrid,
    LayoutTemplate,
    ListOrdered,
    MapPin,
    Megaphone,
    Phone,
    Quote,
    Sparkles,
    Star,
    Store,
    Stethoscope,
    Tag,
    type LucideIcon,
    Users,
    UtensilsCrossed,
    Video,
} from 'lucide-react';

export const TEMPLATE_ICONS: Record<string, LucideIcon> = {
    Home,
    Sparkles,
    LayoutGrid,
    BarChart3,
    ListOrdered,
    UtensilsCrossed,
    Clock,
    Quote,
    Dumbbell,
    CreditCard,
    Users,
    Megaphone,
    MapPin,
    Calendar,
    Image: ImageIcon,
    Store,
    Building2,
    Hotel,
    Stethoscope,
    Heart,
    Star,
    Tag,
    Video,
    Phone,
};

export function getTemplateIcon(name: string | null | undefined): LucideIcon {
    if (name && TEMPLATE_ICONS[name]) {
        return TEMPLATE_ICONS[name];
    }
    return LayoutTemplate;
}