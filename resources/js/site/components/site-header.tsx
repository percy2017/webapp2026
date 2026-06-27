import { Link, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    Menu,
    Monitor,
    Moon,
    Sun,
    type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { getMenuIcon } from '@/components/icon-picker';

type Appearance = 'light' | 'dark' | 'system';

type ChildItem = { label: string; href: string; icon?: string | null };
type NavItem = {
    label: string;
    href: string;
    icon?: string | null;
    children?: ChildItem[];
};

const themeOptions: {
    value: Appearance;
    icon: LucideIcon;
    label: string;
}[] = [
    { value: 'light', icon: Sun, label: 'Claro' },
    { value: 'dark', icon: Moon, label: 'Oscuro' },
    { value: 'system', icon: Monitor, label: 'Sistema' },
];

export function SiteHeader() {
    const { props } = usePage<{
        siteSettings?: { site_name: string; logo_url: string | null };
        siteMenu?: NavItem[];
    }>();
    const siteName = props.siteSettings?.site_name ?? 'Sitio';
    const logoUrl = props.siteSettings?.logo_url ?? null;
    const nav = (props.siteMenu ?? []).filter(
        (item): item is NavItem =>
            Boolean(item.label) && Boolean(item.href),
    );
    const [open, setOpen] = useState(false);
    const { appearance, updateAppearance } = useAppearance();

    const initial = siteName.charAt(0).toUpperCase() || 'S';

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link
                    href="#hero"
                    className="flex items-center gap-2 text-lg font-semibold tracking-tight"
                >
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt={siteName}
                            className="h-8 w-8 rounded-md object-cover"
                        />
                    ) : (
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            {initial}
                        </span>
                    )}
                    <span>{siteName}</span>
                </Link>

                <nav className="hidden items-center gap-1 md:flex">
                    {nav.map((item) => {
                        const Icon = getMenuIcon(item.icon ?? null);
                        const hasChildren =
                            Array.isArray(item.children) &&
                            item.children.length > 0;

                        if (!hasChildren) {
                            return (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {item.label}
                                </a>
                            );
                        }

                        return (
                            <div
                                key={item.href}
                                className="group relative"
                            >
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {item.label}
                                    <ChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180" />
                                </button>
                                <div className="invisible absolute right-0 top-full z-50 min-w-48 rounded-md border bg-popover p-1 text-popover-foreground opacity-0 shadow-md transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                                    {item.children!.map((child) => {
                                        const ChildIcon = getMenuIcon(
                                            child.icon ?? null,
                                        );
                                        return (
                                            <a
                                                key={child.href}
                                                href={child.href}
                                                className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                                            >
                                                <ChildIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                                {child.label}
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </nav>

                <div className="hidden items-center gap-1 rounded-lg border bg-background/60 p-0.5 md:flex">
                    {themeOptions.map(({ value, icon: Icon, label }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => updateAppearance(value)}
                            aria-label={`Tema ${label}`}
                            title={`Tema ${label}`}
                            className={cn(
                                'inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
                                appearance === value &&
                                    'bg-accent text-foreground',
                            )}
                        >
                            <Icon className="h-4 w-4" />
                        </button>
                    ))}
                </div>

                <Sheet open={open} onOpenChange={setOpen}>
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
                        aria-label="Abrir menú"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <SheetContent
                        side="right"
                        className="flex w-full flex-col gap-6 sm:max-w-xs"
                    >
                        <SheetHeader>
                            <SheetTitle>Menú</SheetTitle>
                        </SheetHeader>

                        <nav className="flex flex-col gap-1 text-right">
                            {nav.map((item) => {
                                const Icon = getMenuIcon(item.icon ?? null);
                                const hasChildren =
                                    Array.isArray(item.children) &&
                                    item.children.length > 0;

                                if (!hasChildren) {
                                    return (
                                        <SheetClose asChild key={item.href}>
                                            <a
                                                href={item.href}
                                                className="inline-flex items-center justify-end gap-2 rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent"
                                            >
                                                {item.label}
                                                <Icon className="h-4 w-4 text-muted-foreground" />
                                            </a>
                                        </SheetClose>
                                    );
                                }

                                return (
                                    <div
                                        key={item.href}
                                        className="space-y-1"
                                    >
                                        <div className="inline-flex w-full items-center justify-end gap-2 px-3 py-2 text-base font-semibold text-foreground">
                                            {item.label}
                                            <Icon className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex flex-col gap-0.5 pe-3">
                                            {item.children!.map((child) => {
                                                const ChildIcon =
                                                    getMenuIcon(
                                                        child.icon ?? null,
                                                    );
                                                return (
                                                    <SheetClose
                                                        asChild
                                                        key={child.href}
                                                    >
                                                        <a
                                                            href={child.href}
                                                            className="inline-flex items-center justify-end gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                                                        >
                                                            {child.label}
                                                            <ChildIcon className="h-3.5 w-3.5" />
                                                        </a>
                                                    </SheetClose>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </nav>

                        <div className="flex items-center justify-center gap-1 rounded-lg border bg-muted/40 p-1">
                            {themeOptions.map(
                                ({ value, icon: Icon, label }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() =>
                                            updateAppearance(value)
                                        }
                                        aria-label={`Tema ${label}`}
                                        className={cn(
                                            'inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground',
                                            appearance === value &&
                                                'bg-background text-foreground shadow-sm',
                                        )}
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                        <span>{label}</span>
                                    </button>
                                ),
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}