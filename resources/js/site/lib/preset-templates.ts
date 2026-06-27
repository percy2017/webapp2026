import { Scissors } from 'lucide-react';

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
            secondary_label: 'Ver servicios',
            secondary_href: '#servicios',
            image_media_id: null,
        },
    },
    {
        id: 'features',
        visible: true,
        content: {
            title: 'Nuestros servicios',
            subtitle:
                'Todo lo que necesitás para verte y sentirte bien, en un solo lugar.',
            items: [
                {
                    icon: 'Scissors',
                    title: 'Corte de cabello',
                    description:
                        'Cortes clásicos, modernos, desfilados. Asesoramiento personalizado según tu tipo de rostro.',
                },
                {
                    icon: 'Palette',
                    title: 'Coloración',
                    description:
                        'Tinte, mechas, balayage, californianas. Trabajamos con las mejores marcas del mercado.',
                },
                {
                    icon: 'Sparkles',
                    title: 'Peinado',
                    description:
                        'Peinados para eventos, novias, quinceañeras. Recogidos, ondas, semisueltos.',
                },
                {
                    icon: 'User',
                    title: 'Barbería',
                    description:
                        'Cortes masculinos, perfilado de barba, diseño de cejas. Servicio completo.',
                },
                {
                    icon: 'Wand2',
                    title: 'Tratamientos',
                    description:
                        'Keratina, alisado brasileño, nutrición profunda, Botox capilar.',
                },
                {
                    icon: 'Heart',
                    title: 'Novias',
                    description:
                        'Paquetes completos para tu día especial. Prueba, día de boda y retoque incluido.',
                },
            ],
        },
    },
    {
        id: 'gallery',
        visible: true,
        content: {
            items: [
                {
                    image_media_id: null,
                    alt: 'Corte bob moderno',
                    caption: 'Corte bob',
                },
                {
                    image_media_id: null,
                    alt: 'Balayage caramel',
                    caption: 'Balayage',
                },
                {
                    image_media_id: null,
                    alt: 'Peinado de novia',
                    caption: 'Novia',
                },
                {
                    image_media_id: null,
                    alt: 'Corte masculino fade',
                    caption: 'Fade',
                },
                {
                    image_media_id: null,
                    alt: 'Color fantasía',
                    caption: 'Color',
                },
                {
                    image_media_id: null,
                    alt: 'Tratamiento keratina',
                    caption: 'Keratina',
                },
            ],
            columns: '3',
            aspect: 'square',
            gap: 'md',
            radius: 'md',
        },
    },
    {
        id: 'pricing',
        visible: true,
        content: {
            title: 'Nuestros precios',
            subtitle:
                'Transparentes. Sin sorpresas. Pagá en efectivo, transferencia o QR.',
            items: [
                {
                    name: 'Básico',
                    description: 'Corte + Lavado + Secado. Para el día a día.',
                    price: 'Bs. 80',
                    features: [{ feature: 'Lavado incluido' }],
                    highlighted: false,
                    cta_label: 'Reservar',
                    cta_href: 'https://wa.me/59170000000',
                },
                {
                    name: 'Color',
                    description:
                        'Coloración completa + Secado profesional. Para renovarte.',
                    price: 'Bs. 350',
                    features: [
                        { feature: 'Marcas premium' },
                        { feature: 'Asesoramiento de tono' },
                    ],
                    highlighted: true,
                    cta_label: 'Reservar',
                    cta_href: 'https://wa.me/59170000000',
                },
                {
                    name: 'Novia',
                    description:
                        'Paquete completo: prueba + día de boda + retoque.',
                    price: 'Bs. 1500',
                    features: [
                        { feature: 'Prueba previa' },
                        { feature: 'Día de la boda' },
                        { feature: 'Retoque a los 15 días' },
                    ],
                    highlighted: false,
                    cta_label: 'Reservar',
                    cta_href: 'https://wa.me/59170000000',
                },
            ],
        },
    },
    {
        id: 'testimonials',
        visible: true,
        content: {
            eyebrow: 'Testimonios',
            title: 'Lo que dicen nuestras clientas',
            description: 'Confianza real de personas reales.',
            columns: '3',
            variant: 'card',
            show_rating: true,
            items: [
                {
                    quote:
                        'El mejor corte que me han hecho. Camila es una genia, escucha lo que querés y te asesora.',
                    author_name: 'Lucía M.',
                    author_role: 'Clienta hace 2 años',
                    author_image_media_id: null,
                    rating: 5,
                },
                {
                    quote:
                        'Mi color quedó increíble. El balayage quedó super natural. Ya soy clienta fija.',
                    author_name: 'Andrea P.',
                    author_role: 'Clienta hace 1 año',
                    author_image_media_id: null,
                    rating: 5,
                },
                {
                    quote:
                        'La atención es buenísima y el lugar es precioso. Me sentí como en casa.',
                    author_name: 'Valeria C.',
                    author_role: 'Clienta hace 6 meses',
                    author_image_media_id: null,
                    rating: 5,
                },
            ],
        },
    },
    {
        id: 'location',
        visible: true,
        content: {
            eyebrow: 'Ubicación',
            title: '¿Dónde encontrarnos?',
            description:
                'Pasá por nuestro estudio, escribinos o agendá tu turno por WhatsApp.',
            show_contact_info: true,
            address: 'Av. Ballivián, La Paz',
            lat: -16.5228,
            lng: -68.0843,
            zoom: 15,
            marker: true,
            scroll_wheel_zoom: false,
            map_height: 'lg',
            map_radius: 'xl',
            contact_info: [
                {
                    icon: 'MapPin',
                    label: 'Dirección',
                    value: 'Av. Ballivián, La Paz',
                    href: '',
                },
                {
                    icon: 'Phone',
                    label: 'Teléfono',
                    value: '+591 70000000',
                    href: 'tel:+59170000000',
                },
                {
                    icon: 'Mail',
                    label: 'Email',
                    value: 'hola@estudiocamila.bo',
                    href: 'mailto:hola@estudiocamila.bo',
                },
                {
                    icon: 'Clock',
                    label: 'Horarios',
                    value: 'Lun a Sáb · 9 a 20 hs',
                    href: '',
                },
            ],
        },
    },
    {
        id: 'cta',
        visible: true,
        content: {
            title: '¿Lista para tu nuevo look?',
            subtitle:
                'Reservá tu turno ahora y dejate cuidar por nuestras especialistas.',
            button_label: 'Reservar por WhatsApp',
            button_href: 'https://wa.me/59170000000?text=Hola%2C%20quiero%20reservar%20un%20turno',
            secondary_label: 'Llamar ahora',
            secondary_href: 'tel:+59170000000',
        },
    },
];

const peluqueriaBlocks: PresetBlock[] = [
    {
        type: 'spacer',
        visible: true,
        content: { height: 'h-8' },
    },
    {
        type: 'heading',
        visible: true,
        content: {
            text: 'Sobre el estudio',
            level: 'h2',
            align: 'center',
        },
    },
    {
        type: 'paragraph',
        visible: true,
        content: {
            content: {
                type: 'doc',
                content: [
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: 'Somos un equipo de ',
                            },
                            {
                                type: 'text',
                                marks: [{ type: 'bold' }],
                                text: 'especialistas en belleza',
                            },
                            {
                                type: 'text',
                                text: ' con más de 10 años de experiencia en La Paz. Trabajamos con productos de primera línea y nos capacitamos constantemente para traerte las últimas tendencias.',
                            },
                        ],
                    },
                ],
            },
            align: 'center',
        },
    },
    {
        type: 'divider',
        visible: true,
        content: { style: 'solid' },
    },
    {
        type: 'spacer',
        visible: true,
        content: { height: 'h-4' },
    },
    {
        type: 'heading',
        visible: true,
        content: {
            text: 'Mirá nuestro trabajo',
            level: 'h2',
            align: 'center',
        },
    },
    {
        type: 'video',
        visible: true,
        content: {
            source: 'url',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            media_id: null,
            title: 'Transformación completa · Balayage + Corte',
            autoplay: false,
            controls: true,
            loop: false,
            muted: false,
            aspect: 'video',
            radius: 'xl',
        },
    },
    {
        type: 'divider',
        visible: true,
        content: { style: 'solid' },
    },
    {
        type: 'spacer',
        visible: true,
        content: { height: 'h-8' },
    },
];

const streamingSections: PresetSection[] = [
    {
        id: 'hero',
        visible: true,
        content: {
            eyebrow: 'En vivo · Todos los días 20:00 hs',
            headline: 'Tu próximo stream empieza en',
            subheadline:
                'Gaming competitivo, IRL y charas con la comunidad. Sumate a Twitch o YouTube para no perderte nada.',
            cta_label: 'Ver en Twitch',
            cta_href: 'https://twitch.tv/',
            secondary_label: 'Suscribirme',
            secondary_href: '#pricing',
            image_media_id: null,
        },
    },
    {
        id: 'features',
        visible: true,
        content: {
            title: '¿Dónde encontrarme?',
            subtitle:
                'Mismo stream, todas las plataformas. Sumate donde te quede más cómodo.',
            items: [
                {
                    icon: 'Twitch',
                    title: 'Twitch',
                    description:
                        'Stream principal con chat en vivo, emotes y clips.',
                },
                {
                    icon: 'Youtube',
                    title: 'YouTube',
                    description:
                        'VODs subidos automáticamente y shorts destacados.',
                },
                {
                    icon: 'MessageCircle',
                    title: 'Discord',
                    description:
                        'Comunidad activa 24/7 con canales temáticos y eventos.',
                },
                {
                    icon: 'Bell',
                    title: 'Patreon',
                    description:
                        'Contenido exclusivo y beneficios para suscriptores.',
                },
                {
                    icon: 'Instagram',
                    title: 'Instagram',
                    description:
                        'Stories diarias, behind the scenes y sorteos.',
                },
                {
                    icon: 'Twitter',
                    title: 'X (Twitter)',
                    description:
                        'Updates, clips cortos y memes de la comunidad.',
                },
            ],
        },
    },
    {
        id: 'gallery',
        visible: true,
        content: {
            items: [
                {
                    image_media_id: null,
                    alt: 'Setup del stream',
                    caption: 'Mi setup',
                },
                {
                    image_media_id: null,
                    alt: 'Clip destacado · Win épico',
                    caption: 'Win épico',
                },
                {
                    image_media_id: null,
                    alt: 'IRL en la calle',
                    caption: 'IRL stream',
                },
                {
                    image_media_id: null,
                    alt: 'Torneo con la comunidad',
                    caption: 'Torneo',
                },
                {
                    image_media_id: null,
                    alt: 'Charla con viewer',
                    caption: 'Charla',
                },
                {
                    image_media_id: null,
                    alt: 'Highlights del mes',
                    caption: 'Highlights',
                },
            ],
            columns: '3',
            aspect: 'video',
            gap: 'md',
            radius: 'md',
        },
    },
    {
        id: 'pricing',
        visible: true,
        content: {
            title: 'Apoyá el canal',
            subtitle:
                'Con tu ayuda puedo seguir creando contenido. Elegí cómo querés apoyar.',
            items: [
                {
                    name: 'Viewer',
                    description: 'Gratis, pero no menos importante.',
                    price: '$0',
                    features: [
                        { feature: 'Chat en vivo' },
                        { feature: 'Alertas de stream' },
                    ],
                    highlighted: false,
                    cta_label: 'Ver stream',
                    cta_href: 'https://twitch.tv/',
                },
                {
                    name: 'Sub Twitch',
                    description:
                        'Emotes exclusivos, badge en chat y sin publicidad.',
                    price: '$5/mes',
                    features: [
                        { feature: 'Emotes del canal' },
                        { feature: 'Sin anuncios' },
                        { feature: 'Badge en chat' },
                    ],
                    highlighted: true,
                    cta_label: 'Suscribirme',
                    cta_href: 'https://twitch.tv/',
                },
                {
                    name: 'Patreon VIP',
                    description:
                        'Todo lo de Sub + contenido exclusivo y acceso al Discord VIP.',
                    price: '$10/mes',
                    features: [
                        { feature: 'Todo lo de Sub' },
                        { feature: 'Videos exclusivos' },
                        { feature: 'Discord VIP' },
                        { feature: 'Nombre en créditos' },
                    ],
                    highlighted: false,
                    cta_label: 'Apoyar en Patreon',
                    cta_href: 'https://patreon.com/',
                },
            ],
        },
    },
    {
        id: 'testimonials',
        visible: true,
        content: {
            eyebrow: 'Comunidad',
            title: 'Lo que dice la comunidad',
            description: 'Mensajes reales de viewers que ya están suscriptos.',
            columns: '3',
            variant: 'card',
            show_rating: true,
            items: [
                {
                    quote:
                        'El stream de todos los días se volvió mi rutina favorita. La comunidad es lo mejor.',
                    author_name: 'Carlos M.',
                    author_role: 'Sub hace 8 meses',
                    author_image_media_id: null,
                    rating: 5,
                },
                {
                    quote:
                        'La calidad del stream y el carisma del streamer son únicos. Vale cada peso.',
                    author_name: 'Lucía R.',
                    author_role: 'Patreon VIP',
                    author_image_media_id: null,
                    rating: 5,
                },
                {
                    quote:
                        'Encontré una comunidad increíble. El Discord es lo mejor que me pasó este año.',
                    author_name: 'Diego S.',
                    author_role: 'Viewer hace 1 año',
                    author_image_media_id: null,
                    rating: 5,
                },
            ],
        },
    },
    {
        id: 'cta',
        visible: true,
        content: {
            title: '¿Te sumás al stream?',
            subtitle:
                'Sumate a la comunidad. Twitch, YouTube o Discord, vos elegís dónde.',
            button_label: 'Ver en Twitch',
            button_href: 'https://twitch.tv/',
            secondary_label: 'Unirme al Discord',
            secondary_href: 'https://discord.com/',
        },
    },
];

const streamingBlocks: PresetBlock[] = [
    {
        type: 'spacer',
        visible: true,
        content: { height: 'h-8' },
    },
    {
        type: 'heading',
        visible: true,
        content: {
            text: 'Próximo stream',
            level: 'h2',
            align: 'center',
        },
    },
    {
        type: 'countdown',
        visible: true,
        content: () => {
            const inTwoDays = new Date(
                Date.now() + 2 * 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000,
            );
            const pad = (n: number) => n.toString().padStart(2, '0');
            const target = `${inTwoDays.getFullYear()}-${pad(
                inTwoDays.getMonth() + 1,
            )}-${pad(inTwoDays.getDate())}T${pad(inTwoDays.getHours())}:${pad(
                inTwoDays.getMinutes(),
            )}`;
            return {
                target_date: target,
                title: 'El show arranca en',
                expired_text: '¡Estamos en vivo! Entrá ahora',
                variant: 'boxes',
                size: 'lg',
                accent: 'primary',
            };
        },
    },
    {
        type: 'divider',
        visible: true,
        content: { style: 'solid' },
    },
    {
        type: 'spacer',
        visible: true,
        content: { height: 'h-4' },
    },
    {
        type: 'heading',
        visible: true,
        content: {
            text: 'Trailer del canal',
            level: 'h2',
            align: 'center',
        },
    },
    {
        type: 'video',
        visible: true,
        content: {
            source: 'url',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            media_id: null,
            title: 'Trailer oficial',
            autoplay: false,
            controls: true,
            loop: false,
            muted: false,
            aspect: 'video',
            radius: 'xl',
        },
    },
    {
        type: 'divider',
        visible: true,
        content: { style: 'solid' },
    },
    {
        type: 'spacer',
        visible: true,
        content: { height: 'h-8' },
    },
];

export const PRESET_TEMPLATES: PresetTemplate[] = [
    {
        id: 'peluqueria',
        name: 'Peluquería',
        description:
            'Para peluquerías, barberías y salones de belleza. Con servicios, galería, precios, testimonios y ubicación.',
        icon: 'Scissors',
        accent: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
        defaultName: 'Estudio Camila',
        defaultSlug: 'estudio-camila',
        defaultDescription: 'Peluquería & Estética en La Paz, Bolivia.',
        sections: peluqueriaSections,
        blocks: peluqueriaBlocks,
        menu_items: [
            { label: 'Inicio', href: '#hero', icon: 'Home' },
            { label: 'Servicios', href: '#features', icon: 'Sparkles' },
            { label: 'Galería', href: '#gallery', icon: 'Image' },
            { label: 'Precios', href: '#pricing', icon: 'Tag' },
            { label: 'Testimonios', href: '#testimonials', icon: 'Star' },
            { label: 'Ubicación', href: '#location', icon: 'MapPin' },
            { label: 'Reservar', href: 'https://wa.me/59170000000?text=Hola%20Camila%2C%20quiero%20reservar%20un%20turno', icon: 'Phone' },
        ],
    },
    {
        id: 'streaming',
        name: 'Streaming',
        description:
            'Para streamers, gamers y creadores de contenido. Con countdown, plataformas, VODs, suscripciones y comunidad.',
        icon: 'Video',
        accent:
            'bg-violet-500/15 text-violet-700 dark:text-violet-300',
        defaultName: 'StreamerHub',
        defaultSlug: 'streamerhub',
        defaultDescription:
            'Gaming, IRL y charas en vivo. Todos los días a las 20:00 hs (BO).',
        sections: streamingSections,
        blocks: streamingBlocks,
        menu_items: [
            { label: 'Inicio', href: '#hero', icon: 'Home' },
            { label: 'Plataformas', href: '#features', icon: 'Twitch' },
            { label: 'VODs', href: '#gallery', icon: 'Video' },
            { label: 'Apoyar', href: '#pricing', icon: 'Heart' },
            { label: 'Comunidad', href: '#testimonials', icon: 'Users' },
            { label: 'Twitch', href: 'https://twitch.tv/', icon: 'Twitch' },
        ],
    },
];

export function getPresetTemplate(id: string): PresetTemplate | null {
    return PRESET_TEMPLATES.find((p) => p.id === id) ?? null;
}

export function listPresetTemplates(): PresetTemplate[] {
    return PRESET_TEMPLATES;
}