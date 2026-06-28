export type PresetSection = {
    id: string;
    visible: boolean;
    content: Record<string, unknown>;
};

export type PresetBlock = {
    type: string;
    visible: boolean;
    content: Record<string, unknown>;
};

export type PresetMenuItem = {
    label: string;
    href: string;
    icon?: string;
    children?: PresetMenuItem[];
};

export type PresetTemplate = {
    id: string;
    name: string;
    description: string;
    icon: string;
    accent: string;
    defaultName: string;
    defaultSlug: string;
    defaultDescription: string;
    sections: PresetSection[];
    blocks: PresetBlock[];
    menu_items: PresetMenuItem[];
};

import { PIZZERIA_PRESET } from './preset-pizzeria';

// Image source pattern used by all sections that show a picture:
//   source: 'url'    →  use image_url directly (a /blocks/*.svg default)
//   source: 'media'  →  use image_media_id (set later by the user from Media library)
// `source: 'url'` is the safe default at template-creation time so the page
// already renders the picture even when the Media library is still empty.

const url = (path: string) => ({ source: 'url' as const, image_url: path, image_url_thumb: path, image_media_id: null });
const photoUrl = (path: string) => ({ source: 'url' as const, photo_url: path, photo_media_id: null });

const peluqueriaSections: PresetSection[] = [
    {
        id: 'hero',
        visible: true,
        content: {
            eyebrow: 'Estudio Camila',
            headline: 'Tu estilo, nuestra pasión',
            subheadline:
                'Peluquería y estética en La Paz. Cortes modernos, coloración, peinados y tratamientos para que te veas y sientas increíble.',
            cta_label: 'Reservá tu turno',
            cta_href: 'https://wa.me/59170000000?text=Hola%20Camila%2C%20quiero%20reservar%20un%20turno',
            secondary_label: 'Ver equipo',
            secondary_href: '#team',
            ...url('/blocks/hero-peluqueria.svg'),
        },
    },
    {
        id: 'team',
        visible: true,
        content: {
            eyebrow: 'Equipo',
            title: 'Las manos detrás de cada look',
            subtitle:
                'Especialistas con años de experiencia, capacitadas en las últimas tendencias.',
            columns: '3',
            variant: 'card',
            items: [
                {
                    name: 'Camila M.',
                    role: 'Directora & Colorista',
                    specialties: [
                        { specialty: 'Balayage' },
                        { specialty: 'Color' },
                        { specialty: 'Novias' },
                    ],
                    ...photoUrl('/blocks/team-camila.svg'),
                    schedule: 'Lun a Vie',
                    instagram_handle: 'estudio.camila',
                },
                {
                    name: 'Lucía R.',
                    role: 'Estilista',
                    specialties: [
                        { specialty: 'Corte' },
                        { specialty: 'Peinado' },
                    ],
                    ...photoUrl('/blocks/team-lucia.svg'),
                    schedule: 'Mar a Sáb',
                    instagram_handle: '',
                },
                {
                    name: 'Diego S.',
                    role: 'Barber',
                    specialties: [
                        { specialty: 'Fade' },
                        { specialty: 'Barba' },
                        { specialty: 'Diseño de cejas' },
                    ],
                    ...photoUrl('/blocks/team-diego.svg'),
                    schedule: 'Lun a Sáb',
                    instagram_handle: '',
                },
            ],
        },
    },
    {
        id: 'gallery',
        visible: true,
        content: {
            eyebrow: 'Trabajos',
            title: 'Algunos de nuestros looks',
            subtitle: 'Tocá o pasá el cursor para ver los detalles.',
            items: [
                {
                    ...url('/blocks/gallery-corte-bob.svg'),
                    alt: 'Corte bob moderno',
                    caption: 'Corte bob',
                },
                {
                    ...url('/blocks/gallery-balayage.svg'),
                    alt: 'Balayage caramel',
                    caption: 'Balayage',
                },
                {
                    ...url('/blocks/gallery-novia.svg'),
                    alt: 'Peinado de novia',
                    caption: 'Novia',
                },
                {
                    ...url('/blocks/gallery-fade.svg'),
                    alt: 'Corte masculino fade',
                    caption: 'Fade',
                },
                {
                    ...url('/blocks/gallery-color-fantasia.svg'),
                    alt: 'Color fantasía',
                    caption: 'Color',
                },
                {
                    ...url('/blocks/gallery-keratina.svg'),
                    alt: 'Tratamiento keratina',
                    caption: 'Keratina',
                },
            ],
            columns: '3',
            aspect: 'square',
            gap: 'md',
            radius: 'xl',
            show_captions: true,
        },
    },
    {
        id: 'cta',
        visible: true,
        content: {
            title: '¿Lista para tu próximo look?',
            subtitle: 'Reservá tu turno en menos de 1 minuto. Te confirmamos por WhatsApp.',
            button_label: 'Reservar por WhatsApp',
            button_href: 'https://wa.me/59170000000?text=Hola%20Camila%2C%20quiero%20reservar%20un%20turno',
            secondary_label: 'Ver equipo',
            secondary_href: '#team',
        },
    },
];

const peluqueriaBlocks: PresetBlock[] = [];

const streamingSections: PresetSection[] = [
    {
        id: 'hero',
        visible: true,
        content: {
            eyebrow: 'Catálogo · Cuentas digitales',
            headline: 'Todas tus plataformas en un solo lugar',
            subheadline:
                'Netflix, HBO Max, Disney+, Spotify, Prime Video y más. Acceso inmediato, soporte 24/7 y métodos de pago locales.',
            cta_label: 'Ver planes',
            cta_href: '#services-grid',
            secondary_label: 'Ver equipo',
            secondary_href: '#team',
            ...url('/blocks/hero-streaming.svg'),
        },
    },
    {
        id: 'services-grid',
        visible: true,
        content: {
            eyebrow: 'Plataformas',
            title: 'Nuestros planes',
            subtitle: 'Suscripciones individuales y combos. Activación inmediata tras el pago.',
            columns: '3',
            default_currency: 'Bs.',
            items: [
                {
                    title: 'Netflix Premium',
                    description: '4 pantallas en 4K + HDR. Catálogo completo de series y películas.',
                    ...url('/blocks/platform-netflix.svg'),
                    duration_minutes: 30,
                    price_from: '75',
                    category: 'Video',
                    cta_label: 'Pedir por WhatsApp',
                    cta_href: 'https://wa.me/59170000000?text=Hola%2C%20quiero%20Netflix%20Premium',
                    highlighted: false,
                },
                {
                    title: 'HBO Max',
                    description: 'Series originales Warner, DC y películas del catálogo HBO.',
                    ...url('/blocks/platform-hbo.svg'),
                    duration_minutes: 30,
                    price_from: '50',
                    category: 'Video',
                    cta_label: 'Pedir por WhatsApp',
                    cta_href: 'https://wa.me/59170000000?text=Hola%2C%20quiero%20HBO%20Max',
                    highlighted: false,
                },
                {
                    title: 'Disney+ Premium',
                    description: 'Marvel, Star Wars, Pixar y National Geographic. 4K en hasta 4 pantallas.',
                    ...url('/blocks/platform-disney.svg'),
                    duration_minutes: 30,
                    price_from: '65',
                    category: 'Video',
                    cta_label: 'Pedir por WhatsApp',
                    cta_href: 'https://wa.me/59170000000?text=Hola%2C%20quiero%20Disney%2B%20Premium',
                    highlighted: false,
                },
                {
                    title: 'Spotify Duo',
                    description: 'Dos cuentas Premium en una dirección. Música sin anuncios y descargas.',
                    ...url('/blocks/platform-spotify.svg'),
                    duration_minutes: 30,
                    price_from: '40',
                    category: 'Música',
                    cta_label: 'Pedir por WhatsApp',
                    cta_href: 'https://wa.me/59170000000?text=Hola%2C%20quiero%20Spotify%20Duo',
                    highlighted: false,
                },
                {
                    title: 'YouTube Premium',
                    description: 'Sin anuncios, descargas y reproducción en segundo plano. Música incluida.',
                    ...url('/blocks/platform-youtube.svg'),
                    duration_minutes: 30,
                    price_from: '55',
                    category: 'Video',
                    cta_label: 'Pedir por WhatsApp',
                    cta_href: 'https://wa.me/59170000000?text=Hola%2C%20quiero%20YouTube%20Premium',
                    highlighted: false,
                },
                {
                    title: 'Prime Video',
                    description: 'Series y películas originales Amazon. 4K HDR y audio Dolby Atmos.',
                    ...url('/blocks/platform-prime.svg'),
                    duration_minutes: 30,
                    price_from: '50',
                    category: 'Video',
                    cta_label: 'Pedir por WhatsApp',
                    cta_href: 'https://wa.me/59170000000?text=Hola%2C%20quiero%20Prime%20Video',
                    highlighted: false,
                },
                {
                    title: 'Apple TV+',
                    description: 'Series y películas Apple Originals. Calidad 4K HDR y Dolby Atmos.',
                    ...url('/blocks/platform-appletv.svg'),
                    duration_minutes: 30,
                    price_from: '45',
                    category: 'Video',
                    cta_label: 'Pedir por WhatsApp',
                    cta_href: 'https://wa.me/59170000000?text=Hola%2C%20quiero%20Apple%20TV%2B',
                    highlighted: false,
                },
                {
                    title: 'Paramount+',
                    description: 'Star Trek, Yellowstone, MTV y catálogo Nickelodeon para toda la familia.',
                    ...url('/blocks/platform-paramount.svg'),
                    duration_minutes: 30,
                    price_from: '40',
                    category: 'Video',
                    cta_label: 'Pedir por WhatsApp',
                    cta_href: 'https://wa.me/59170000000?text=Hola%2C%20quiero%20Paramount%2B',
                    highlighted: false,
                },
                {
                    title: 'Combo Duo',
                    description: 'Dos plataformas a elección con 15% de descuento. Lo más pedido.',
                    ...url('/blocks/platform-appletv.svg'),
                    duration_minutes: 30,
                    price_from: '70',
                    category: 'Combo',
                    cta_label: 'Pedir por WhatsApp',
                    cta_href: 'https://wa.me/59170000000?text=Hola%2C%20quiero%20un%20Combo%20Duo',
                    highlighted: true,
                },
            ],
        },
    },
    {
        id: 'team',
        visible: true,
        content: {
            eyebrow: 'Equipo',
            title: 'Atención personalizada',
            subtitle: 'Las personas detrás de cada activación y soporte.',
            columns: '3',
            variant: 'card',
            items: [
                {
                    name: 'Carlos M.',
                    role: 'Soporte & Activaciones',
                    specialties: [
                        { specialty: 'Activación' },
                        { specialty: 'Pagos' },
                        { specialty: 'Cambios de plan' },
                    ],
                    ...photoUrl('/blocks/avatar-streaming-carlos.svg'),
                    schedule: 'Lun a Sáb',
                    instagram_handle: '',
                },
                {
                    name: 'Lucía R.',
                    role: 'Atención al cliente',
                    specialties: [
                        { specialty: 'WhatsApp' },
                        { specialty: 'Resolución' },
                    ],
                    ...photoUrl('/blocks/avatar-streaming-lucia.svg'),
                    schedule: 'Mar a Dom',
                    instagram_handle: '',
                },
                {
                    name: 'Diego S.',
                    role: 'Catálogo & Stock',
                    specialties: [
                        { specialty: 'Plataformas' },
                        { specialty: 'Combos' },
                        { specialty: 'Promos' },
                    ],
                    ...photoUrl('/blocks/avatar-streaming-diego.svg'),
                    schedule: 'Lun a Vie',
                    instagram_handle: '',
                },
            ],
        },
    },
    {
        id: 'schedule',
        visible: true,
        content: {
            eyebrow: 'Disponibilidad',
            title: 'Cuándo respondemos',
            subtitle: 'Atención humana por WhatsApp. Soporte 24/7 para clientes activos.',
            timezone: 'America/La_Paz',
            accent: 'primary',
            show_today: true,
            slots: [
                { day: 'Lunes', time: '09–22', title: 'Atención WhatsApp', active: true },
                { day: 'Martes', time: '09–22', title: 'Atención WhatsApp', active: true },
                { day: 'Miércoles', time: '09–22', title: 'Atención WhatsApp', active: true },
                { day: 'Jueves', time: '09–22', title: 'Atención WhatsApp', active: true },
                { day: 'Viernes', time: '09–22', title: 'Atención WhatsApp', active: true },
                { day: 'Sábado', time: '10–18', title: 'Mañana y tarde', active: true },
                { day: 'Domingo', time: '—', title: 'Solo clientes activos', active: false },
            ],
        },
    },
];

const streamingBlocks: PresetBlock[] = [];

export const PRESET_TEMPLATES: PresetTemplate[] = [
    {
        id: 'peluqueria',
        name: 'Peluquería & Barbería',
        description:
            'Para peluquerías, barberías y salones de belleza. Con hero, equipo, galería de trabajos y CTA de reserva.',
        icon: 'Scissors',
        accent: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
        defaultName: 'Estudio Camila',
        defaultSlug: 'estudio-camila',
        defaultDescription: 'Peluquería & Estética en La Paz, Bolivia.',
        sections: peluqueriaSections,
        blocks: peluqueriaBlocks,
        menu_items: [
            { label: 'Inicio', href: '#hero', icon: 'Home' },
            { label: 'Equipo', href: '#team', icon: 'Users' },
            { label: 'Trabajos', href: '#gallery', icon: 'Image' },
            { label: 'Reservar', href: 'https://wa.me/59170000000?text=Hola%20Camila%2C%20quiero%20reservar%20un%20turno', icon: 'Phone' },
        ],
    },
    {
        id: 'streaming',
        name: 'Tienda de Streaming',
        description:
            'Para venta de cuentas de Netflix, HBO Max, Disney+, Spotify y más. Con catálogo de plataformas, equipo y agenda.',
        icon: 'Tv',
        accent: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
        defaultName: 'Streaming Store',
        defaultSlug: 'streaming-store',
        defaultDescription: 'Todas tus plataformas en un solo lugar. Acceso inmediato y soporte 24/7.',
        sections: streamingSections,
        blocks: streamingBlocks,
        menu_items: [
            { label: 'Inicio', href: '#hero', icon: 'Home' },
            { label: 'Plataformas', href: '#services-grid', icon: 'Sparkles' },
            { label: 'Equipo', href: '#team', icon: 'Users' },
            { label: 'Disponibilidad', href: '#schedule', icon: 'Calendar' },
        ],
    },
    // Pizzería preset lives in its own module to keep preset-templates.ts small.
    // The data URLs for hero / slider items / avatars are embedded inline so
    // the preset renders without any /blocks/*.svg files.
    PIZZERIA_PRESET,
];

export function getPresetTemplate(id: string): PresetTemplate | null {
    return PRESET_TEMPLATES.find((p) => p.id === id) ?? null;
}

export function listPresetTemplates(): PresetTemplate[] {
    return PRESET_TEMPLATES;
}