import type { ComponentType } from 'react';
import { BeforeAfterBlock } from '@site/blocks/before-after-block';
import { CountdownBlock } from '@site/blocks/countdown-block';
import { GalleryBlock } from '@site/blocks/gallery-block';
import { ScheduleBlock } from '@site/blocks/schedule-block';
import { StatsBlock } from '@site/blocks/stats-block';
import { CtaSection } from '@site/sections/cta-section';
import { FaqSection } from '@site/sections/faq-section';
import { FeaturesSection } from '@site/sections/features-section';
import { HeroSection } from '@site/sections/hero-section';
import { LocationSection } from '@site/sections/location-section';
import { PricingSection } from '@site/sections/pricing-section';
import { ServicesGridSection } from '@site/sections/services-grid-section';
import { SliderSection } from '@site/sections/slider-section';
import { TeamSection } from '@site/sections/team-section';
import { TestimonialsSection } from '@site/sections/testimonials-section';

export type SectionTheme = {
    primary_color?: string;
    accent_color?: string;
    radius?: string;
};

export type SectionContent = Record<string, unknown>;

export type SectionProps = {
    content: SectionContent;
    theme?: SectionTheme;
};

export type ContentFieldType =
    | 'text'
    | 'textarea'
    | 'richtext'
    | 'color'
    | 'image'
    | 'boolean'
    | 'list'
    | 'icon'
    | 'radio'
    | 'slot';

export type FieldOption = {
    label: string;
    value: string | number | boolean;
};

export type ContentField = {
    key: string;
    label: string;
    type: ContentFieldType;
    itemLabel?: string;
    itemSchema?: ContentField[];
    helper?: string;
    options?: FieldOption[];
    /**
     * When `type === 'image'`, hints whether the underlying media library
     * picker should filter for images or videos. Defaults to 'image'.
     */
    mediaKind?: 'image' | 'video';
    /**
     * Optional callback used by array/list fields to render a summary
     * of each row in the Puck sidebar. The function receives the item
     * and should return a short human-readable label.
     */
    getItemSummary?: (item: Record<string, unknown>) => string;
};

export type SectionDefinition = {
    id: string;
    label: string;
    description: string;
    icon: string;
    component: ComponentType<SectionProps>;
    defaultContent: SectionContent;
    schema: ContentField[];
    isEmpty?: (content: SectionContent) => boolean;
};

export const SECTION_REGISTRY: Record<string, SectionDefinition> = {
    hero: {
        id: 'hero',
        label: 'Hero',
        description: 'Cabecera principal con titular y llamado a la acción.',
        icon: 'Sparkles',
        component: HeroSection,
        defaultContent: {
            eyebrow: 'Nuevo',
            headline: 'Lanzá tu sitio en minutos',
            subheadline:
                'Construí, editá y publicá tu landing con bloques drag-and-drop. Sin código, sin complicaciones.',
            cta_label: 'Empezar gratis',
            cta_href: '#contact',
            secondary_label: 'Ver demo',
            secondary_href: '#features',
            source: 'url',
            image_media_id: null,
            image_url: '/blocks/sample-image.svg',
            image_url_thumb: '/blocks/sample-image.svg',
        },
        schema: [
            { key: 'eyebrow', label: 'Etiqueta superior', type: 'text' },
            { key: 'headline', label: 'Titular', type: 'text' },
            { key: 'subheadline', label: 'Subtítulo', type: 'textarea' },
            {
                key: 'cta_label',
                label: 'Texto del botón principal',
                type: 'text',
            },
            { key: 'cta_href', label: 'URL del botón principal', type: 'text' },
            {
                key: 'secondary_label',
                label: 'Texto del botón secundario',
                type: 'text',
            },
            {
                key: 'secondary_href',
                label: 'URL del botón secundario',
                type: 'text',
            },
            {
                key: 'source',
                label: 'Fuente de la imagen',
                type: 'radio',
                options: [
                    { label: 'URL externa', value: 'url' },
                    { label: 'Archivo de Medios', value: 'media' },
                ],
            },
            { key: 'image_url', label: 'URL de la imagen', type: 'text' },
            {
                key: 'image_media_id',
                label: 'Imagen de la biblioteca',
                type: 'image',
                mediaKind: 'image',
            },
        ],
        isEmpty: (content) =>
            !content.headline &&
            !content.eyebrow &&
            !content.subheadline &&
            !content.cta_label &&
            !content.secondary_label,
    },
    testimonials: {
        id: 'testimonials',
        label: 'Testimonios',
        description: 'Quotes de clientes con foto, nombre y empresa.',
        icon: 'Quote',
        component: TestimonialsSection,
        defaultContent: {
            eyebrow: 'Testimonios',
            title: 'Lo que dicen nuestros clientes',
            description: 'Confianza real de personas reales.',
            columns: '4',
            variant: 'card',
            show_rating: true,
            items: [
                {
                    quote: 'Cambió completamente cómo trabajamos. En una semana ya éramos 3x más rápidos.',
                    author_name: 'María Pérez',
                    author_role: 'CTO, Acme Inc.',
                    author_image_media_id: null,
                    author_image_url: '/blocks/avatar-streaming-carlos.svg',
                    rating: 5,
                },
                {
                    quote: 'La mejor inversión que hicimos este año. El soporte responde en minutos.',
                    author_name: 'Juan López',
                    author_role: 'CEO, Studio Norte',
                    author_image_media_id: null,
                    author_image_url: '/blocks/avatar-streaming-lucia.svg',
                    rating: 5,
                },
                {
                    quote: 'Simple, rápido y funciona. Sin sorpresas ni curvas de aprendizaje.',
                    author_name: 'Lucía Méndez',
                    author_role: 'Head of Growth, Beta Co.',
                    author_image_media_id: null,
                    author_image_url: '/blocks/avatar-streaming-diego.svg',
                    rating: 5,
                },
                {
                    quote: 'Lo recomiendo a todo el equipo. La curva de adopción fue mínima.',
                    author_name: 'Diego Salas',
                    author_role: 'Founder, Delta Studio',
                    author_image_media_id: null,
                    author_image_url: '/blocks/avatar-admin.svg',
                    rating: 5,
                },
            ],
        },
        schema: [
            { key: 'eyebrow', label: 'Etiqueta superior', type: 'text' },
            { key: 'title', label: 'Título', type: 'text' },
            { key: 'description', label: 'Descripción', type: 'textarea' },
            {
                key: 'columns',
                label: 'Columnas',
                type: 'radio',
                options: [
                    { label: '2', value: '2' },
                    { label: '3', value: '3' },
                    { label: '4', value: '4' },
                ],
            },
            {
                key: 'variant',
                label: 'Estilo',
                type: 'radio',
                options: [
                    { label: 'Con tarjeta', value: 'card' },
                    { label: 'Minimal', value: 'minimal' },
                ],
            },
            {
                key: 'show_rating',
                label: 'Mostrar estrellas',
                type: 'boolean',
            },
            {
                key: 'items',
                label: 'Testimonios',
                type: 'list',
                itemLabel: 'Testimonio',
                itemSchema: [
                    {
                        key: 'quote',
                        label: 'Quote',
                        type: 'richtext',
                    },
                    {
                        key: 'author_name',
                        label: 'Nombre',
                        type: 'text',
                    },
                    {
                        key: 'author_role',
                        label: 'Cargo / empresa',
                        type: 'text',
                    },
                    {
                        key: 'author_image_media_id',
                        label: 'Foto',
                        type: 'image',
                    },
                    {
                        key: 'rating',
                        label: 'Rating (1-5)',
                        type: 'text',
                    },
                ],
            },
        ],
        isEmpty: (content) => {
            const items = Array.isArray(content.items) ? content.items : [];

            return items.length === 0;
        },
    },
    faq: {
        id: 'faq',
        label: 'Preguntas frecuentes',
        description: 'Acordeón con preguntas y respuestas.',
        icon: 'HelpCircle',
        component: FaqSection,
        defaultContent: {
            title: 'Preguntas frecuentes',
            subtitle:
                'Respuestas a las dudas más comunes de nuestros clientes.',
            items: [
                {
                    question: '¿Cuánto tarda en estar listo mi sitio?',
                    answer: '<p>Tu sitio queda publicado en cuestión de minutos. Solo tenés que elegir una plantilla, editar los bloques y publicar.</p>',
                },
                {
                    question: '¿Puedo cambiar el diseño después?',
                    answer: '<p>Sí. Todos los bloques se editan en vivo desde el panel. Cambiá textos, imágenes y colores sin tocar código.</p>',
                },
                {
                    question: '¿Necesito conocimientos técnicos?',
                    answer: '<p>No. La plataforma está pensada para que cualquier persona pueda crear su sitio sin saber programar.</p>',
                },
            ],
        },
        schema: [
            { key: 'title', label: 'Título', type: 'text' },
            { key: 'subtitle', label: 'Subtítulo', type: 'textarea' },
            {
                key: 'items',
                label: 'Preguntas',
                type: 'list',
                itemLabel: 'Pregunta',
                itemSchema: [
                    { key: 'question', label: 'Pregunta', type: 'text' },
                    { key: 'answer', label: 'Respuesta', type: 'richtext' },
                ],
            },
        ],
        isEmpty: (content) =>
            !content.title &&
            (!Array.isArray(content.items) || content.items.length === 0),
    },
    pricing: {
        id: 'pricing',
        label: 'Planes / Precios',
        description: 'Cards de planes con precio, features y CTA.',
        icon: 'CreditCard',
        component: PricingSection,
        defaultContent: {
            title: 'Planes simples y transparentes',
            subtitle:
                'Elegí el plan que mejor se adapte a tu negocio. Sin sorpresas.',
            items: [
                {
                    name: 'Starter',
                    description: 'Para empezar y validar tu idea.',
                    price: '$0',
                    features: [
                        { feature: '1 sitio publicado' },
                        { feature: 'Plantillas básicas' },
                        { feature: 'Soporte por email' },
                    ],
                    highlighted: false,
                    cta_label: 'Comenzar gratis',
                    cta_href: '#contact',
                },
                {
                    name: 'Pro',
                    description: 'Para crecer con tu audiencia.',
                    price: '$29',
                    features: [
                        { feature: 'Sitios ilimitados' },
                        { feature: 'Todas las plantillas' },
                        { feature: 'Dominio personalizado' },
                        { feature: 'Soporte prioritario' },
                        { feature: 'Analíticas avanzadas' },
                    ],
                    highlighted: true,
                    cta_label: 'Probar Pro',
                    cta_href: '#contact',
                },
                {
                    name: 'Business',
                    description: 'Para equipos que necesitan colaboración.',
                    price: '$79',
                    features: [
                        { feature: 'Todo lo de Pro' },
                        { feature: 'Multi-usuario (5 seats)' },
                        { feature: 'Workflows de aprobación' },
                        { feature: 'API & webhooks' },
                    ],
                    highlighted: false,
                    cta_label: 'Probar Business',
                    cta_href: '#contact',
                },
                {
                    name: 'Enterprise',
                    description: 'Para equipos y empresas.',
                    price: 'A medida',
                    features: [
                        { feature: 'Todo lo de Business' },
                        { feature: 'SSO y roles avanzados' },
                        { feature: 'SLA dedicado' },
                        { feature: 'Onboarding personalizado' },
                    ],
                    highlighted: false,
                    cta_label: 'Contactar ventas',
                    cta_href: '#contact',
                },
            ],
        },
        schema: [
            { key: 'title', label: 'Título', type: 'text' },
            { key: 'subtitle', label: 'Subtítulo', type: 'textarea' },
            {
                key: 'items',
                label: 'Planes',
                type: 'list',
                itemLabel: 'Plan',
                itemSchema: [
                    { key: 'name', label: 'Nombre', type: 'text' },
                    {
                        key: 'description',
                        label: 'Descripción',
                        type: 'textarea',
                    },
                    { key: 'price', label: 'Precio', type: 'text' },
                    {
                        key: 'features',
                        label: 'Características',
                        type: 'list',
                        itemLabel: 'Característica',
                        itemSchema: [
                            {
                                key: 'feature',
                                label: 'Característica',
                                type: 'text',
                            },
                        ],
                    },
                    {
                        key: 'highlighted',
                        label: 'Destacado',
                        type: 'boolean',
                    },
                    {
                        key: 'cta_label',
                        label: 'Texto del botón',
                        type: 'text',
                    },
                    { key: 'cta_href', label: 'URL del botón', type: 'text' },
                ],
            },
        ],
        isEmpty: (content) =>
            !content.title &&
            (!Array.isArray(content.items) || content.items.length === 0),
    },
    features: {
        id: 'features',
        label: 'Características',
        description: 'Grid de características o beneficios.',
        icon: 'LayoutGrid',
        component: FeaturesSection,
        defaultContent: {
            title: 'Todo lo que necesitás para lanzar',
            subtitle:
                'Construí, editá y publicá tu sitio sin tocar código. Enfocate en el contenido, no en la tecnología.',
            items: [
                {
                    icon: 'Zap',
                    title: 'Editor drag-and-drop',
                    description:
                        'Sumá, movés y editás bloques directamente en el lienzo. Sin código, sin curva de aprendizaje.',
                },
                {
                    icon: 'Palette',
                    title: 'Personalización total',
                    description:
                        'Cambiá colores, textos e imágenes para que el sitio refleje tu marca.',
                },
                {
                    icon: 'Rocket',
                    title: 'Publicación instantánea',
                    description:
                        'Tus cambios se ven en producción al instante. Sin deploys, sin esperas.',
                },
                {
                    icon: 'Shield',
                    title: 'Seguro y confiable',
                    description:
                        'Hosting administrado, SSL automático y backups diarios incluidos.',
                },
                {
                    icon: 'Smartphone',
                    title: '100% responsive',
                    description:
                        'Todos los bloques se adaptan a mobile, tablet y desktop automáticamente.',
                },
                {
                    icon: 'BarChart3',
                    title: 'Analíticas integradas',
                    description:
                        'Mirá cuántas personas visitan tu sitio y desde dónde, sin código extra.',
                },
            ],
        },
        schema: [
            { key: 'title', label: 'Título', type: 'text' },
            { key: 'subtitle', label: 'Subtítulo', type: 'textarea' },
            {
                key: 'items',
                label: 'Características',
                type: 'list',
                itemLabel: 'Característica',
                itemSchema: [
                    {
                        key: 'icon',
                        label: 'Ícono',
                        type: 'icon',
                    },
                    { key: 'title', label: 'Título', type: 'text' },
                    {
                        key: 'description',
                        label: 'Descripción',
                        type: 'textarea',
                    },
                ],
            },
        ],
        isEmpty: (content) =>
            !content.title &&
            (!Array.isArray(content.items) || content.items.length === 0),
    },
    cta: {
        id: 'cta',
        label: 'Llamado a la acción',
        description: 'Bloque final con CTA destacado.',
        icon: 'Megaphone',
        component: CtaSection,
        defaultContent: {
            title: '¿Listo para empezar?',
            subtitle:
                'Sumate a los miles de equipos que ya lanzaron su sitio con nosotros. Sin tarjeta de crédito.',
            button_label: 'Empezar gratis',
            button_href: '#contact',
            secondary_label: 'Ver demo',
            secondary_href: '#features',
        },
        schema: [
            { key: 'title', label: 'Título', type: 'text' },
            { key: 'subtitle', label: 'Subtítulo', type: 'textarea' },
            {
                key: 'button_label',
                label: 'Texto del botón principal',
                type: 'text',
            },
            {
                key: 'button_href',
                label: 'URL del botón principal',
                type: 'text',
            },
            {
                key: 'secondary_label',
                label: 'Texto del botón secundario',
                type: 'text',
            },
            {
                key: 'secondary_href',
                label: 'URL del botón secundario',
                type: 'text',
            },
        ],
        isEmpty: (content) => !content.title && !content.button_label,
    },
    team: {
        id: 'team',
        label: 'Equipo',
        description: 'Cards de staff con foto, especialidad y horario.',
        icon: 'Users',
        component: TeamSection,
        defaultContent: {
            eyebrow: 'Equipo',
            title: 'Las manos detrás de cada look',
            subtitle:
                'Especialistas con años de experiencia, capacitadas en las últimas tendencias.',
            columns: '4',
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
                    source: 'url',
                    photo_media_id: null,
                    photo_url: '/blocks/avatar-streaming-carlos.svg',
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
                    source: 'url',
                    photo_media_id: null,
                    photo_url: '/blocks/avatar-streaming-lucia.svg',
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
                    source: 'url',
                    photo_media_id: null,
                    photo_url: '/blocks/avatar-streaming-diego.svg',
                    schedule: 'Lun a Sáb',
                    instagram_handle: '',
                },
                {
                    name: 'Sofía P.',
                    role: 'Tratamientos & Keratina',
                    specialties: [
                        { specialty: 'Keratina' },
                        { specialty: 'Alisado' },
                        { specialty: 'Nutrición' },
                    ],
                    source: 'url',
                    photo_media_id: null,
                    photo_url: '/blocks/avatar-admin.svg',
                    schedule: 'Mié a Sáb',
                    instagram_handle: '',
                },
            ],
        },
        schema: [
            { key: 'eyebrow', label: 'Etiqueta superior', type: 'text' },
            { key: 'title', label: 'Título', type: 'text' },
            { key: 'subtitle', label: 'Subtítulo', type: 'textarea' },
            {
                key: 'columns',
                label: 'Columnas',
                type: 'radio',
                options: [
                    { label: '2', value: '2' },
                    { label: '3', value: '3' },
                    { label: '4', value: '4' },
                ],
            },
            {
                key: 'variant',
                label: 'Estilo',
                type: 'radio',
                options: [
                    { label: 'Con tarjeta', value: 'card' },
                    { label: 'Minimal', value: 'minimal' },
                ],
            },
            {
                key: 'items',
                label: 'Miembros',
                type: 'list',
                itemLabel: 'Miembro',
                itemSchema: [
                    { key: 'name', label: 'Nombre', type: 'text' },
                    { key: 'role', label: 'Rol', type: 'text' },
                    {
                        key: 'specialties',
                        label: 'Especialidades',
                        type: 'list',
                        itemLabel: 'Especialidad',
                        itemSchema: [
                            {
                                key: 'specialty',
                                label: 'Especialidad',
                                type: 'text',
                            },
                        ],
                    },
                    {
                        key: 'source',
                        label: 'Fuente de la foto',
                        type: 'radio',
                        options: [
                            { label: 'URL externa', value: 'url' },
                            { label: 'Archivo de Medios', value: 'media' },
                        ],
                    },
                    { key: 'photo_url', label: 'URL de la foto', type: 'text' },
                    {
                        key: 'photo_media_id',
                        label: 'Foto de la biblioteca',
                        type: 'image',
                        mediaKind: 'image',
                    },
                    {
                        key: 'schedule',
                        label: 'Horario (texto libre)',
                        type: 'text',
                    },
                    {
                        key: 'instagram_handle',
                        label: 'Instagram (sin @)',
                        type: 'text',
                    },
                ],
            },
        ],
        isEmpty: (content) => {
            const items = Array.isArray(content.items) ? content.items : [];

            return items.length === 0 && !content.title;
        },
    },
    'services-grid': {
        id: 'services-grid',
        label: 'Servicios (grid)',
        description:
            'Catálogo de servicios con imagen, duración, precio desde y CTA.',
        icon: 'Sparkles',
        component: ServicesGridSection,
        defaultContent: {
            eyebrow: 'Servicios',
            title: 'Nuestros servicios',
            subtitle:
                'Conocé qué incluye cada uno, cuánto tarda y desde cuánto sale.',
            columns: '4',
            default_currency: 'Bs.',
            items: [
                {
                    title: 'Plan Netflix Premium',
                    description:
                        '4 pantallas en 4K + HDR. Catálogo completo de series y películas.',
                    source: 'url',
                    image_media_id: null,
                    image_url: '/blocks/platform-netflix.svg',
                    duration_minutes: 30,
                    price_from: '75',
                    category: 'Video',
                    cta_label: 'Pedir por WhatsApp',
                    cta_href: '#contact',
                    highlighted: false,
                },
                {
                    title: 'Combo Duo',
                    description:
                        'Dos plataformas a elección con 15% de descuento. Lo más pedido.',
                    source: 'url',
                    image_media_id: null,
                    image_url: '/blocks/platform-disney.svg',
                    duration_minutes: 30,
                    price_from: '70',
                    category: 'Combo',
                    cta_label: 'Pedir por WhatsApp',
                    cta_href: '#contact',
                    highlighted: true,
                },
                {
                    title: 'Spotify Duo',
                    description:
                        'Dos cuentas Premium en una dirección. Música sin anuncios y descargas.',
                    source: 'url',
                    image_media_id: null,
                    image_url: '/blocks/platform-spotify.svg',
                    duration_minutes: 30,
                    price_from: '40',
                    category: 'Música',
                    cta_label: 'Pedir por WhatsApp',
                    cta_href: '#contact',
                    highlighted: false,
                },
                {
                    title: 'HBO Max + Paramount',
                    description:
                        'Series originales, películas estreno y deportes en vivo.',
                    source: 'url',
                    image_media_id: null,
                    image_url: '/blocks/platform-hbo.svg',
                    duration_minutes: 30,
                    price_from: '60',
                    category: 'Video',
                    cta_label: 'Pedir por WhatsApp',
                    cta_href: '#contact',
                    highlighted: false,
                },
            ],
        },
        schema: [
            { key: 'eyebrow', label: 'Etiqueta superior', type: 'text' },
            { key: 'title', label: 'Título', type: 'text' },
            { key: 'subtitle', label: 'Subtítulo', type: 'textarea' },
            {
                key: 'columns',
                label: 'Columnas',
                type: 'radio',
                options: [
                    { label: '2', value: '2' },
                    { label: '3', value: '3' },
                    { label: '4', value: '4' },
                ],
            },
            {
                key: 'default_currency',
                label: 'Moneda',
                type: 'text',
                helper: 'Sufijo que se muestra junto al precio (ej: Bs., $, ARS).',
            },
            {
                key: 'items',
                label: 'Servicios',
                type: 'list',
                itemLabel: 'Servicio',
                itemSchema: [
                    { key: 'title', label: 'Título', type: 'text' },
                    {
                        key: 'description',
                        label: 'Descripción',
                        type: 'textarea',
                    },
                    {
                        key: 'source',
                        label: 'Fuente de la imagen',
                        type: 'radio',
                        options: [
                            { label: 'URL externa', value: 'url' },
                            { label: 'Archivo de Medios', value: 'media' },
                        ],
                    },
                    {
                        key: 'image_url',
                        label: 'URL de la imagen',
                        type: 'text',
                    },
                    {
                        key: 'image_media_id',
                        label: 'Imagen de la biblioteca',
                        type: 'image',
                        mediaKind: 'image',
                    },
                    {
                        key: 'duration_minutes',
                        label: 'Duración (minutos)',
                        type: 'text',
                        helper: 'Entero en minutos. Ej: 45, 90, 120.',
                    },
                    {
                        key: 'price_from',
                        label: 'Precio desde',
                        type: 'text',
                        helper: 'Solo el número (sin moneda).',
                    },
                    { key: 'category', label: 'Categoría', type: 'text' },
                    {
                        key: 'highlighted',
                        label: 'Destacado',
                        type: 'boolean',
                    },
                    {
                        key: 'cta_label',
                        label: 'Texto del botón',
                        type: 'text',
                    },
                    {
                        key: 'cta_href',
                        label: 'URL del botón',
                        type: 'text',
                    },
                ],
            },
        ],
        isEmpty: (content) => {
            const items = Array.isArray(content.items) ? content.items : [];

            return items.length === 0 && !content.title;
        },
    },
    location: {
        id: 'location',
        label: 'Ubicación',
        description: 'Sección con datos de contacto y mapa de OpenStreetMap.',
        icon: 'MapPin',
        component: LocationSection,
        defaultContent: {
            eyebrow: 'Ubicación',
            title: '¿Dónde encontrarnos?',
            description:
                'Pasá por nuestra oficina, escribinos o agendá una reunión.',
            show_contact_info: true,
            address: 'Obelisco, Buenos Aires',
            lat: -34.6037,
            lng: -58.3816,
            zoom: 15,
            marker: true,
            scroll_wheel_zoom: false,
            map_height: 'lg',
            map_radius: 'xl',
            contact_info: [
                {
                    icon: 'MapPin',
                    label: 'Dirección',
                    value: 'Av. Corrientes 1234, CABA',
                    href: '',
                },
                {
                    icon: 'Phone',
                    label: 'Teléfono',
                    value: '+54 9 11 5555-4444',
                    href: 'tel:+5491155554444',
                },
                {
                    icon: 'Mail',
                    label: 'Email',
                    value: 'hola@ejemplo.com',
                    href: 'mailto:hola@ejemplo.com',
                },
                {
                    icon: 'Clock',
                    label: 'Horarios',
                    value: 'Lun a Vie · 9 a 18 hs',
                    href: '',
                },
            ],
        },
        schema: [
            { key: 'eyebrow', label: 'Etiqueta superior', type: 'text' },
            { key: 'title', label: 'Título', type: 'text' },
            { key: 'description', label: 'Descripción', type: 'textarea' },
            {
                key: 'show_contact_info',
                label: 'Mostrar info de contacto',
                type: 'boolean',
            },
            {
                key: 'contact_info',
                label: 'Datos de contacto',
                type: 'list',
                itemLabel: 'Item',
                itemSchema: [
                    {
                        key: 'icon',
                        label: 'Ícono',
                        type: 'radio',
                        options: [
                            { label: 'Ubicación', value: 'MapPin' },
                            { label: 'Teléfono', value: 'Phone' },
                            { label: 'Email', value: 'Mail' },
                            { label: 'Horarios', value: 'Clock' },
                        ],
                    },
                    { key: 'label', label: 'Etiqueta', type: 'text' },
                    { key: 'value', label: 'Valor', type: 'text' },
                    { key: 'href', label: 'Link (opcional)', type: 'text' },
                ],
            },
            { key: 'address', label: 'Dirección', type: 'text' },
            {
                key: 'lat',
                label: 'Latitud',
                type: 'text',
                helper: 'Opcional. Si lo completás, ignora la dirección.',
            },
            {
                key: 'lng',
                label: 'Longitud',
                type: 'text',
                helper: 'Opcional. Si lo completás, ignora la dirección.',
            },
            { key: 'zoom', label: 'Zoom', type: 'text' },
            {
                key: 'marker',
                label: 'Mostrar pin',
                type: 'boolean',
            },
            {
                key: 'scroll_wheel_zoom',
                label: 'Zoom con scroll',
                type: 'boolean',
            },
            {
                key: 'map_height',
                label: 'Altura del mapa',
                type: 'radio',
                options: [
                    { label: 'Chico', value: 'sm' },
                    { label: 'Mediano', value: 'md' },
                    { label: 'Grande', value: 'lg' },
                    { label: 'Extra', value: 'xl' },
                ],
            },
            {
                key: 'map_radius',
                label: 'Bordes del mapa',
                type: 'radio',
                options: [
                    { label: 'Sin bordes', value: 'none' },
                    { label: 'Suaves', value: 'sm' },
                    { label: 'Medios', value: 'md' },
                    { label: 'Redondeados', value: 'xl' },
                ],
            },
        ],
        isEmpty: (content) => {
            const items = Array.isArray(content.contact_info)
                ? content.contact_info
                : [];

            return !content.title && items.length === 0;
        },
    },
    // ----- composed widgets promoted from BASIC_BLOCKS_REGISTRY -----------
    // These four were atomic blocks historically but each one renders as a
    // full-width composed widget. They belong with the pre-designed sections
    // so they show up under "Bloques prediseñados" in the Puck sidebar.
    'before-after': {
        id: 'before-after',
        label: 'Antes / Después',
        description:
            'Slider interactivo para comparar dos imágenes (transformaciones).',
        icon: 'ArrowLeftRight',
        component: BeforeAfterBlock,
        defaultContent: {
            title: 'Transformaciones reales',
            subtitle: 'Deslizá para ver el antes y el después de cada trabajo.',
            columns: '1',
            aspect: 'video',
            columns_mobile_stack: true,
            items: [
                {
                    before_source: 'url',
                    before_media_id: null,
                    before_url: '/blocks/sample-ba-before.svg',
                    after_source: 'url',
                    after_media_id: null,
                    after_url: '/blocks/sample-ba-after.svg',
                    caption: 'Antes y después de muestra',
                    before_label: 'Antes',
                    after_label: 'Después',
                },
            ],
        },
        schema: [
            { key: 'title', label: 'Título', type: 'text' },
            { key: 'subtitle', label: 'Subtítulo', type: 'textarea' },
            {
                key: 'columns',
                label: 'Columnas',
                type: 'radio',
                options: [
                    { label: '1', value: '1' },
                    { label: '2', value: '2' },
                ],
            },
            {
                key: 'aspect',
                label: 'Proporción',
                type: 'radio',
                options: [
                    { label: 'Cuadrado', value: 'square' },
                    { label: 'Video (16:9)', value: 'video' },
                    { label: 'Vertical (3:4)', value: 'tall' },
                    { label: 'Ancho (16:9 wide)', value: 'wide' },
                ],
            },
            {
                key: 'columns_mobile_stack',
                label: 'Stack en mobile',
                type: 'boolean',
            },
            {
                key: 'items',
                label: 'Pares de imágenes',
                type: 'list',
                itemLabel: 'Antes / Después',
                itemSchema: [
                    {
                        key: 'before_source',
                        label: 'Fuente "antes"',
                        type: 'radio',
                        options: [
                            { label: 'URL externa', value: 'url' },
                            { label: 'Archivo de Medios', value: 'media' },
                        ],
                    },
                    {
                        key: 'before_url',
                        label: 'URL imagen "antes"',
                        type: 'text',
                    },
                    {
                        key: 'before_media_id',
                        label: 'Imagen "antes" de la biblioteca',
                        type: 'image',
                        mediaKind: 'image',
                    },
                    {
                        key: 'after_source',
                        label: 'Fuente "después"',
                        type: 'radio',
                        options: [
                            { label: 'URL externa', value: 'url' },
                            { label: 'Archivo de Medios', value: 'media' },
                        ],
                    },
                    {
                        key: 'after_url',
                        label: 'URL imagen "después"',
                        type: 'text',
                    },
                    {
                        key: 'after_media_id',
                        label: 'Imagen "después" de la biblioteca',
                        type: 'image',
                        mediaKind: 'image',
                    },
                    {
                        key: 'before_label',
                        label: 'Etiqueta "antes"',
                        type: 'text',
                    },
                    {
                        key: 'after_label',
                        label: 'Etiqueta "después"',
                        type: 'text',
                    },
                    { key: 'caption', label: 'Caption', type: 'text' },
                ],
            },
        ],
        isEmpty: (content) => {
            const items = Array.isArray(content.items) ? content.items : [];

            return items.length === 0;
        },
    },
    countdown: {
        id: 'countdown',
        label: 'Cronómetro',
        description: 'Cuenta regresiva para promos, lanzamientos o eventos.',
        icon: 'Timer',
        component: CountdownBlock,
        defaultContent: {
            target_date: '2026-12-31T23:59:59',
            title: 'Oferta termina en',
            expired_text: '¡Oferta terminada!',
            variant: 'boxes',
            size: 'md',
            accent: 'primary',
        },
        schema: [
            {
                key: 'target_date',
                label: 'Fecha objetivo',
                type: 'text',
                helper: 'ISO datetime: 2026-12-31T23:59:59 o fecha simple: 2026-12-31',
            },
            { key: 'title', label: 'Título', type: 'text' },
            { key: 'expired_text', label: 'Texto al expirar', type: 'text' },
            {
                key: 'variant',
                label: 'Variante',
                type: 'radio',
                options: [
                    { label: 'Cajas (DD:HH:MM:SS)', value: 'boxes' },
                    { label: 'Compacto (texto)', value: 'inline' },
                ],
            },
            {
                key: 'size',
                label: 'Tamaño',
                type: 'radio',
                options: [
                    { label: 'Chico', value: 'sm' },
                    { label: 'Mediano', value: 'md' },
                    { label: 'Grande', value: 'lg' },
                ],
            },
            {
                key: 'accent',
                label: 'Color',
                type: 'radio',
                options: [
                    { label: 'Primario', value: 'primary' },
                    { label: 'Rojo', value: 'destructive' },
                    { label: 'Sutil', value: 'muted' },
                ],
            },
        ],
        isEmpty: (content) => {
            const target =
                typeof content.target_date === 'string'
                    ? content.target_date.trim()
                    : '';

            return !target;
        },
    },
    stats: {
        id: 'stats',
        label: 'Estadísticas',
        description: 'Contadores animados de métricas clave del negocio.',
        icon: 'BarChart3',
        component: StatsBlock,
        defaultContent: {
            eyebrow: 'En números',
            title: 'Lo que conseguimos juntos',
            subtitle:
                'Cifras que resumen el trabajo de todo el equipo y la confianza de nuestros clientes.',
            accent: 'primary',
            items: [
                {
                    icon: 'Users',
                    value: 320,
                    suffix: '+',
                    label: 'Clientes activos',
                },
                {
                    icon: 'Star',
                    value: 4.9,
                    suffix: '/5',
                    label: 'Calificación promedio',
                },
                {
                    icon: 'Clock',
                    value: 4,
                    suffix: ' años',
                    label: 'En el rubro',
                },
                {
                    icon: 'Heart',
                    value: 1200,
                    suffix: '+',
                    label: 'Pedidos completados',
                },
            ],
        },
        schema: [
            { key: 'eyebrow', label: 'Etiqueta superior', type: 'text' },
            { key: 'title', label: 'Título', type: 'text' },
            { key: 'subtitle', label: 'Subtítulo', type: 'textarea' },
            {
                key: 'accent',
                label: 'Color de acento',
                type: 'radio',
                options: [
                    { label: 'Primario', value: 'primary' },
                    { label: 'Violeta', value: 'violet' },
                    { label: 'Cian', value: 'cyan' },
                ],
            },
            {
                key: 'items',
                label: 'Estadísticas',
                type: 'list',
                itemLabel: 'Stat',
                itemSchema: [
                    {
                        key: 'icon',
                        label: 'Icono',
                        type: 'radio',
                        options: [
                            { label: 'Usuarios', value: 'Users' },
                            { label: 'Ojo', value: 'Eye' },
                            { label: 'Reloj', value: 'Clock' },
                            { label: 'Corazón', value: 'Heart' },
                            { label: 'Video', value: 'Video' },
                            { label: 'Estrella', value: 'Star' },
                            { label: 'Trofeo', value: 'Trophy' },
                            { label: 'Rayo', value: 'Zap' },
                        ],
                    },
                    { key: 'value', label: 'Valor', type: 'text' },
                    { key: 'suffix', label: 'Sufijo', type: 'text' },
                    { key: 'label', label: 'Etiqueta', type: 'text' },
                ],
            },
        ],
        isEmpty: (content) => {
            const items = Array.isArray(content.items) ? content.items : [];

            return items.length === 0;
        },
    },
    schedule: {
        id: 'schedule',
        label: 'Agenda semanal',
        description:
            'Grid semanal con días, horarios y estado (abierto/cerrado).',
        icon: 'CalendarDays',
        component: ScheduleBlock,
        defaultContent: {
            eyebrow: 'Agenda semanal',
            title: 'Nuestros horarios',
            subtitle:
                'Reservá tu turno en el día y horario que más te convenga.',
            timezone: 'America/La_Paz',
            accent: 'primary',
            show_today: true,
            slots: [
                {
                    day: 'Lunes',
                    time: '09–18',
                    title: 'Atención al cliente',
                    active: true,
                },
                {
                    day: 'Martes',
                    time: '09–18',
                    title: 'Atención al cliente',
                    active: true,
                },
                {
                    day: 'Miércoles',
                    time: '09–18',
                    title: 'Atención al cliente',
                    active: true,
                },
                {
                    day: 'Jueves',
                    time: '09–18',
                    title: 'Atención al cliente',
                    active: true,
                },
                {
                    day: 'Viernes',
                    time: '09–18',
                    title: 'Atención al cliente',
                    active: true,
                },
                { day: 'Sábado', time: '09–13', title: 'Mañana', active: true },
                { day: 'Domingo', time: '—', title: 'Cerrado', active: false },
            ],
        },
        schema: [
            { key: 'eyebrow', label: 'Etiqueta superior', type: 'text' },
            { key: 'title', label: 'Título', type: 'text' },
            { key: 'subtitle', label: 'Subtítulo', type: 'textarea' },
            { key: 'timezone', label: 'Zona horaria', type: 'text' },
            {
                key: 'accent',
                label: 'Color de acento',
                type: 'radio',
                options: [
                    { label: 'Primario', value: 'primary' },
                    { label: 'Violeta', value: 'violet' },
                    { label: 'Cian', value: 'cyan' },
                    { label: 'Verde', value: 'emerald' },
                    { label: 'Ámbar', value: 'amber' },
                    { label: 'Rosa', value: 'rose' },
                ],
            },
            { key: 'show_today', label: 'Marcar día actual', type: 'boolean' },
            {
                key: 'slots',
                label: 'Días',
                type: 'list',
                itemLabel: 'Día',
                itemSchema: [
                    {
                        key: 'day',
                        label: 'Día',
                        type: 'radio',
                        options: [
                            { label: 'Lunes', value: 'Lunes' },
                            { label: 'Martes', value: 'Martes' },
                            { label: 'Miércoles', value: 'Miércoles' },
                            { label: 'Jueves', value: 'Jueves' },
                            { label: 'Viernes', value: 'Viernes' },
                            { label: 'Sábado', value: 'Sábado' },
                            { label: 'Domingo', value: 'Domingo' },
                        ],
                    },
                    { key: 'time', label: 'Hora (HH:MM)', type: 'text' },
                    { key: 'title', label: 'Título del stream', type: 'text' },
                    { key: 'active', label: 'En vivo', type: 'boolean' },
                ],
            },
        ],
        isEmpty: (content) => {
            const slots = Array.isArray(content.slots) ? content.slots : [];

            return slots.length === 0;
        },
    },
    gallery: {
        id: 'gallery',
        label: 'Galería',
        description: 'Grid de imágenes con caption opcional.',
        icon: 'Images',
        component: GalleryBlock,
        defaultContent: {
            eyebrow: 'Galería',
            title: 'Algunos de nuestros trabajos',
            subtitle: 'Tocá o pasá el cursor para ver los detalles.',
            items: [
                {
                    source: 'url',
                    image_media_id: null,
                    image_url: '/blocks/gallery-balayage.svg',
                    alt: 'Balayage',
                    caption: 'Balayage en tonos cálidos',
                },
                {
                    source: 'url',
                    image_media_id: null,
                    image_url: '/blocks/gallery-corte-bob.svg',
                    alt: 'Corte bob',
                    caption: 'Corte bob con movimiento',
                },
                {
                    source: 'url',
                    image_media_id: null,
                    image_url: '/blocks/gallery-color-fantasia.svg',
                    alt: 'Color fantasia',
                    caption: 'Color fantasía con mechas',
                },
                {
                    source: 'url',
                    image_media_id: null,
                    image_url: '/blocks/gallery-fade.svg',
                    alt: 'Fade',
                    caption: 'Fade bajo con diseño de cejas',
                },
            ],
            columns: '3',
            aspect: 'square',
            gap: 'md',
            radius: 'xl',
            show_captions: true,
        },
        schema: [
            { key: 'eyebrow', label: 'Etiqueta superior', type: 'text' },
            { key: 'title', label: 'Título', type: 'text' },
            { key: 'subtitle', label: 'Subtítulo', type: 'textarea' },
            {
                key: 'items',
                label: 'Imágenes',
                type: 'list',
                itemLabel: 'Imagen',
                itemSchema: [
                    {
                        key: 'source',
                        label: 'Fuente de la imagen',
                        type: 'radio',
                        options: [
                            { label: 'URL externa', value: 'url' },
                            { label: 'Archivo de Medios', value: 'media' },
                        ],
                    },
                    {
                        key: 'image_url',
                        label: 'URL de la imagen',
                        type: 'text',
                    },
                    {
                        key: 'image_media_id',
                        label: 'Imagen de la biblioteca',
                        type: 'image',
                        mediaKind: 'image',
                    },
                    {
                        key: 'alt',
                        label: 'Texto alternativo',
                        type: 'text',
                    },
                    {
                        key: 'caption',
                        label: 'Caption',
                        type: 'text',
                    },
                ],
            },
            {
                key: 'columns',
                label: 'Columnas',
                type: 'radio',
                options: [
                    { label: '2', value: '2' },
                    { label: '3', value: '3' },
                    { label: '4', value: '4' },
                    { label: '5', value: '5' },
                    { label: '6', value: '6' },
                ],
            },
            {
                key: 'aspect',
                label: 'Proporción',
                type: 'radio',
                options: [
                    { label: 'Auto', value: 'auto' },
                    { label: 'Cuadrado', value: 'square' },
                    { label: 'Video', value: 'video' },
                    { label: 'Ancho', value: 'wide' },
                ],
            },
            {
                key: 'gap',
                label: 'Espacio',
                type: 'radio',
                options: [
                    { label: 'Ninguno', value: 'none' },
                    { label: 'Chico', value: 'sm' },
                    { label: 'Mediano', value: 'md' },
                    { label: 'Grande', value: 'lg' },
                ],
            },
            {
                key: 'radius',
                label: 'Bordes',
                type: 'radio',
                options: [
                    { label: 'Sin bordes', value: 'none' },
                    { label: 'Suaves', value: 'sm' },
                    { label: 'Medios', value: 'md' },
                    { label: 'Redondeados', value: 'xl' },
                ],
            },
            {
                key: 'show_captions',
                label: 'Mostrar captions al hacer hover',
                type: 'boolean',
            },
        ],
        isEmpty: (content) => {
            const items = Array.isArray(content.items) ? content.items : [];

            return items.length === 0;
        },
    },
    slider: {
        id: 'slider',
        label: 'Slider / Carrusel',
        description:
            'Slider full-width con imagen + texto + CTA por slide, flechas y dots.',
        icon: 'GalleryHorizontal',
        component: SliderSection,
        defaultContent: {
            aspect: 'wide',
            overlay_position: 'left',
            autoplay: false,
            interval: 5,
            show_arrows: true,
            show_dots: true,
            radius: 'xl',
            items: [
                {
                    eyebrow: 'Nuevo',
                    title: 'Lanzamiento de temporada',
                    description:
                        'Mirá todo lo que se viene este mes. Novedades, descuentos y sorpresas.',
                    source: 'url',
                    image_media_id: null,
                    image_url: '/blocks/sample-image.svg',
                    cta_label: 'Ver más',
                    cta_href: '#contact',
                },
                {
                    eyebrow: 'Promo',
                    title: '2x1 en combos seleccionados',
                    description:
                        'Aprovechá esta promo por tiempo limitado en todos nuestros combos.',
                    source: 'url',
                    image_media_id: null,
                    image_url: '/blocks/sample-gallery-1.svg',
                    cta_label: 'Pedir ahora',
                    cta_href: '#contact',
                },
                {
                    eyebrow: 'Featured',
                    title: 'Lo más pedido',
                    description:
                        'Estos son los servicios que más nos piden. Reservá el tuyo hoy.',
                    source: 'url',
                    image_media_id: null,
                    image_url: '/blocks/sample-gallery-2.svg',
                    cta_label: 'Reservar',
                    cta_href: '#contact',
                },
                {
                    eyebrow: 'Bookings',
                    title: 'Reservá tu turno online',
                    description:
                        'Elegí día, hora y servicio desde la web. Confirmación al instante.',
                    source: 'url',
                    image_media_id: null,
                    image_url: '/blocks/hero-peluqueria.svg',
                    cta_label: 'Reservar ahora',
                    cta_href: '#contact',
                },
            ],
        },
        schema: [
            {
                key: 'aspect',
                label: 'Proporción',
                type: 'radio',
                options: [
                    { label: 'Ancho (21:9)', value: 'wide' },
                    { label: 'Video (16:9)', value: 'video' },
                    { label: 'Cuadrado', value: 'square' },
                    { label: 'Vertical (3:4)', value: 'tall' },
                ],
            },
            {
                key: 'overlay_position',
                label: 'Posición del texto',
                type: 'radio',
                options: [
                    { label: 'Izquierda', value: 'left' },
                    { label: 'Centro', value: 'center' },
                    { label: 'Derecha', value: 'right' },
                ],
            },
            {
                key: 'radius',
                label: 'Bordes',
                type: 'radio',
                options: [
                    { label: 'Sin bordes', value: 'none' },
                    { label: 'Suaves', value: 'sm' },
                    { label: 'Medios', value: 'md' },
                    { label: 'Redondeados', value: 'xl' },
                ],
            },
            {
                key: 'autoplay',
                label: 'Avanzar automáticamente',
                type: 'boolean',
            },
            {
                key: 'interval',
                label: 'Intervalo de autoplay (segundos)',
                type: 'text',
                helper: 'Entre 1 y 30. Default: 5.',
            },
            { key: 'show_arrows', label: 'Mostrar flechas', type: 'boolean' },
            { key: 'show_dots', label: 'Mostrar dots', type: 'boolean' },
            {
                key: 'items',
                label: 'Slides',
                type: 'list',
                itemLabel: 'Slide',
                itemSchema: [
                    { key: 'eyebrow', label: 'Etiqueta', type: 'text' },
                    { key: 'title', label: 'Título', type: 'text' },
                    {
                        key: 'description',
                        label: 'Descripción',
                        type: 'textarea',
                    },
                    {
                        key: 'source',
                        label: 'Fuente de la imagen',
                        type: 'radio',
                        options: [
                            { label: 'URL externa', value: 'url' },
                            { label: 'Archivo de Medios', value: 'media' },
                        ],
                    },
                    {
                        key: 'image_url',
                        label: 'URL de la imagen',
                        type: 'text',
                    },
                    {
                        key: 'image_media_id',
                        label: 'Imagen de la biblioteca',
                        type: 'image',
                        mediaKind: 'image',
                    },
                    {
                        key: 'cta_label',
                        label: 'Texto del botón',
                        type: 'text',
                    },
                    { key: 'cta_href', label: 'URL del botón', type: 'text' },
                ],
            },
        ],
        isEmpty: (content) => {
            const items = Array.isArray(content.items) ? content.items : [];

            return items.length === 0;
        },
    },
};

export function getSectionDefinition(id: string): SectionDefinition | null {
    return SECTION_REGISTRY[id] ?? null;
}

export function listSectionDefinitions(): SectionDefinition[] {
    return Object.values(SECTION_REGISTRY);
}
