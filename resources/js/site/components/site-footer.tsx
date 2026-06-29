import { usePage } from '@inertiajs/react';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

export function SiteFooter() {
    const { props } = usePage<{
        siteSettings?: {
            site_name: string;
            site_tagline: string | null;
            logo_url: string | null;
            contact_info: {
                social?: {
                    twitter?: string;
                    facebook?: string;
                    instagram?: string;
                    linkedin?: string;
                };
            };
        };
    }>();

    const settings = props.siteSettings;
    const siteName = settings?.site_name ?? 'Sitio';
    const tagline = settings?.site_tagline ?? '';
    const social = settings?.contact_info?.social ?? {};
    const year = new Date().getFullYear();

    const socialLinks = [
        { Icon: Twitter, label: 'Twitter', href: social.twitter },
        { Icon: Facebook, label: 'Facebook', href: social.facebook },
        { Icon: Instagram, label: 'Instagram', href: social.instagram },
        { Icon: Linkedin, label: 'LinkedIn', href: social.linkedin },
    ].filter((link) => Boolean(link.href));

    const showTagline = tagline && tagline !== siteName;

    return (
        <footer className="border-t bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 w-full max-w-7xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
                {showTagline && (
                    <p className="order-2 min-w-0 truncate text-center text-[11px] text-muted-foreground sm:order-1 sm:basis-auto sm:text-left sm:text-xs">
                        {tagline}
                    </p>
                )}

                <div className="order-1 flex shrink-0 items-center gap-1.5 sm:order-2 sm:gap-2">
                    {socialLinks.length > 0 ? (
                        socialLinks.map(({ Icon, label, href }) => (
                            <a
                                key={label}
                                href={href}
                                aria-label={label}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            >
                                <Icon className="h-4 w-4" />
                            </a>
                        ))
                    ) : (
                        <p className="text-[11px] text-muted-foreground sm:text-xs">
                            © {year} {siteName}
                        </p>
                    )}
                </div>
            </div>
        </footer>
    );
}
