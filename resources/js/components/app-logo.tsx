import AppLogoIcon from '@/components/app-logo-icon';
import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { props } = usePage<{ name?: string }>();

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-md">
                <AppLogoIcon className="size-8 object-contain" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {props.name}
                </span>
            </div>
        </>
    );
}