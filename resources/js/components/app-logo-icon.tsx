import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(
    props: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'>,
) {
    return (
        <img
            {...props}
            src="/img/logo.png"
            alt="WebApp"
        />
    );
}