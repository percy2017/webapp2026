import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { props } = usePage<{
        name?: string;
        siteSettings?: { logo_url?: string | null } | null;
    }>();

    // SiteSetting::logo_url is updated whenever the operator activates
    // a template (SiteTemplate::activate() copies the template's media
    // id into SiteSetting). Fall back to the bundled PNG when no
    // template has uploaded a logo yet.
    const logoUrl = props.siteSettings?.logo_url ?? '/img/logo.png';

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-md">
                <img
                    src={logoUrl}
                    alt={props.name ?? 'WebApp'}
                    className="size-8 object-contain"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {props.name}
                </span>
            </div>
        </>
    );
}
