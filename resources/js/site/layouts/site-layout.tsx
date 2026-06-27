import { usePage } from '@inertiajs/react';
import { SiteHeader } from '@site/components/site-header';
import { SiteFooter } from '@site/components/site-footer';
import { ChatWidget } from '@site/components/chat/chat-widget';
import type { ChatWidgetSetting } from '@site/lib/types';
import type { ReactNode } from 'react';

type Props = {
    children: ReactNode;
};

export function SiteLayout({ children }: Props) {
    const { props } = usePage<{
        chatWidgetSettings?: ChatWidgetSetting;
        siteSettings?: {
            site_name: string;
            site_tagline: string | null;
            logo_url: string | null;
            contact_info: { email?: string; phone?: string; address?: string };
        };
    }>();

    const settings: ChatWidgetSetting = props.chatWidgetSettings ?? {
        enabled: true,
        position: 'bottom-right',
    };

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <ChatWidget settings={settings} />
        </div>
    );
}