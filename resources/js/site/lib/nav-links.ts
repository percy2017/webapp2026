export type NavLink = {
    label: string;
    href: string;
};

export const DEFAULT_PRIMARY_NAV: NavLink[] = [
    { label: 'Inicio', href: '#hero' },
    { label: 'Características', href: '#features' },
    { label: 'Contacto', href: '#contact' },
];

export const DEFAULT_FOOTER_PRODUCT: NavLink[] = [
    { label: 'Características', href: '#features' },
];

export const DEFAULT_FOOTER_COMPANY: NavLink[] = [
    { label: 'Contacto', href: '#contact' },
];

export const DEFAULT_FOOTER_LEGAL: NavLink[] = [];