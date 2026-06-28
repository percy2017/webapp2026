import type { ComponentType } from 'react';
import { CtaSection } from '@site/sections/cta-section';
import { FaqSection } from '@site/sections/faq-section';
import { FeaturesSection } from '@site/sections/features-section';
import { HeroSection } from '@site/sections/hero-section';
import { LocationSection } from '@site/sections/location-section';
import { PricingSection } from '@site/sections/pricing-section';
import { ServicesGridSection } from '@site/sections/services-grid-section';
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
    | 'radio';

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
            image_media_id: '__MEDIA:sample-image__',
        },
        schema: [
            { key: 'eyebrow', label: 'Etiqueta superior', type: 'text' },
            { key: 'headline', label: 'Titular', type: 'text' },
            { key: 'subheadline', label: 'Subtítulo', type: 'textarea' },
            { key: 'cta_label', label: 'Texto del botón principal', type: 'text' },
            { key: 'cta_href', label: 'URL del botón principal', type: 'text' },
            { key: 'secondary_label', label: 'Texto del botón secundario', type: 'text' },
            { key: 'secondary_href', label: 'URL del botón secundario', type: 'text' },
            { key: 'image_media_id', label: 'Imagen de fondo', type: 'image' },
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
            columns: '3',
            variant: 'card',
            show_rating: false,
            items: [
                {
                    quote:
                        'Cambió completamente cómo trabajamos. En una semana ya éramos 3x más rápidos.',
                    author_name: 'María Pérez',
                    author_role: 'CTO, Acme Inc.',
                    author_image_media_id: '__MEDIA:avatar-streaming-carlos__',
                    rating: 5,
                },
                {
                    quote:
                        'La mejor inversión que hicimos este año. El soporte responde en minutos.',
                    author_name: 'Juan López',
                    author_role: 'CEO, Studio Norte',
                    author_image_media_id: '__MEDIA:avatar-streaming-lucia__',
                    rating: 5,
                },
                {
                    quote:
                        'Simple, rápido y funciona. Sin sorpresas ni curvas de aprendizaje.',
                    author_name: 'Lucía Méndez',
                    author_role: 'Head of Growth, Beta Co.',
                    author_image_media_id: '__MEDIA:avatar-streaming-diego__',
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
            subtitle: 'Respuestas a las dudas más comunes de nuestros clientes.',
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
                    name: 'Enterprise',
                    description: 'Para equipos y empresas.',
                    price: 'A medida',
                    features: [
                        { feature: 'Todo lo de Pro' },
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
                    photo_media_id: '__MEDIA:avatar-streaming-carlos__',
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
                    photo_media_id: '__MEDIA:avatar-streaming-lucia__',
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
                    photo_media_id: '__MEDIA:avatar-streaming-diego__',
                    schedule: 'Lun a Sáb',
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
                        key: 'photo_media_id',
                        label: 'Foto',
                        type: 'image',
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
            columns: '3',
            default_currency: 'Bs.',
            items: [
                {
                    title: 'Corte de cabello',
                    description:
                        'Lavado, corte y peinado según tu tipo de rostro.',
                    image_media_id: '__MEDIA:gallery-streaming-setup__',
                    duration_minutes: 45,
                    price_from: '80',
                    category: 'Cabello',
                    cta_label: 'Reservar',
                    cta_href: '#contact',
                    highlighted: false,
                },
                {
                    title: 'Coloración',
                    description:
                        'Color completo, mechas, balayage o californianas.',
                    image_media_id: '__MEDIA:gallery-streaming-highlights__',
                    duration_minutes: 120,
                    price_from: '350',
                    category: 'Color',
                    cta_label: 'Reservar',
                    cta_href: '#contact',
                    highlighted: true,
                },
                {
                    title: 'Barba & Perfilado',
                    description:
                        'Diseño de barba con navaja, perfilado y cuidado de la piel.',
                    image_media_id: '__MEDIA:gallery-streaming-charla__',
                    duration_minutes: 30,
                    price_from: '60',
                    category: 'Barba',
                    cta_label: 'Reservar',
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
                        key: 'image_media_id',
                        label: 'Imagen',
                        type: 'image',
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
};

export function getSectionDefinition(id: string): SectionDefinition | null {
    return SECTION_REGISTRY[id] ?? null;
}

export function listSectionDefinitions(): SectionDefinition[] {
    return Object.values(SECTION_REGISTRY);
}