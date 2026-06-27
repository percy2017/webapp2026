import { Link } from '@inertiajs/react';
import {
    CalendarDays,
    Image as ImageIcon,
    LayoutTemplate,
    Menu as MenuIcon,
    MessageCircle,
    Settings,
    Settings2,
    Shield,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { index as agendaIndex } from '@/routes/agenda';
import { index as chatsIndex } from '@/routes/chat-live/chats';
import { edit as configEdit } from '@/routes/chat-live/config';
import { index as mediaIndex } from '@/routes/media';
import { index as rolesIndex } from '@/routes/roles';
import { edit as siteSettingsEdit } from '@/routes/site-settings';
import { index as siteMenuIndex } from '@/routes/site-menu';
import { index as siteTemplatesIndex } from '@/routes/site-templates';
import { index as usersIndex } from '@/routes/users';
import { admin } from '@/routes';
import type { NavItem } from '@/types';

const chatLiveNavItems: NavItem[] = [
    {
        title: 'Chats',
        href: chatsIndex(),
        icon: MessageCircle,
    },
    {
        title: 'Configuración',
        href: configEdit(),
        icon: Settings,
    },
];

const siteNavItems: NavItem[] = [
    {
        title: 'Ajuste',
        href: siteSettingsEdit(),
        icon: Settings2,
    },
    {
        title: 'Páginas',
        href: siteTemplatesIndex(),
        icon: LayoutTemplate,
    },
    {
        title: 'Menú',
        href: siteMenuIndex(),
        icon: MenuIcon,
    },
];

const generalNavItems: NavItem[] = [
    {
        title: 'Agenda',
        href: agendaIndex(),
        icon: CalendarDays,
    },
    {
        title: 'Medios',
        href: mediaIndex(),
        icon: ImageIcon,
    },
];

const usersNavItems: NavItem[] = [
    {
        title: 'Todos',
        href: usersIndex(),
        icon: Users,
    },
    {
        title: 'Roles',
        href: rolesIndex(),
        icon: Shield,
    },
];

export function AppSidebar() {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={admin()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Sitio público</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {siteNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentOrParentUrl(item.href)}
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>General</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {generalNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentOrParentUrl(item.href)}
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Usuarios</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {usersNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentOrParentUrl(item.href)}
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Chat-live</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {chatLiveNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentOrParentUrl(item.href)}
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}