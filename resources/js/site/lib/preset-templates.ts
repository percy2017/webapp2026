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
            image_media_id: 30,
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
                    photo_media_id: 27,
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
                    photo_media_id: 29,
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
                    photo_media_id: 28,
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
            items: [
                {
                    image_media_id: 33,
                    alt: 'Corte bob moderno',
                    caption: 'Corte bob',
                },
                {
                    image_media_id: 31,
                    alt: 'Balayage caramel',
                    caption: 'Balayage',
                },
                {
                    image_media_id: 36,
                    alt: 'Peinado de novia',
                    caption: 'Novia',
                },
                {
                    image_media_id: 34,
                    alt: 'Corte masculino fade',
                    caption: 'Fade',
                },
                {
                    image_media_id: 32,
                    alt: 'Color fantasía',
                    caption: 'Color',
                },
                {
                    image_media_id: 35,
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
        id: 'services-grid',
        visible: true,
        content: {
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
                    image_media_id: 23,
                    duration_minutes: 45,
                    price_from: '80',
                    category: 'Cabello',
                    cta_label: 'Reservar',
                    cta_href: 'https://wa.me/59170000000?text=Hola%2C%20quiero%20reservar%20Corte',
                    highlighted: false,
                },
                {
                    title: 'Coloración',
                    description:
                        'Color completo, mechas, balayage o californianas con marcas premium.',
                    image_media_id: 22,
                    duration_minutes: 120,
                    price_from: '350',
                    category: 'Color',
                    cta_label: 'Reservar',
                    cta_href: 'https://wa.me/59170000000?text=Hola%2C%20quiero%20reservar%20Color',
                    highlighted: true,
                },
                {
                    title: 'Barba & Perfilado',
                    description:
                        'Diseño de barba con navaja, perfilado y cuidado de la piel.',
                    image_media_id: 21,
                    duration_minutes: 30,
                    price_from: '60',
                    category: 'Barba',
                    cta_label: 'Reservar',
                    cta_href: 'https://wa.me/59170000000?text=Hola%2C%20quiero%20reservar%20Barba',
                    highlighted: false,
                },
                {
                    title: 'Peinado & Eventos',
                    description:
                        'Recogidos, ondas y semisueltos para novias, quinceañeras y eventos.',
                    image_media_id: 25,
                    duration_minutes: 90,
                    price_from: '200',
                    category: 'Eventos',
                    cta_label: 'Reservar',
                    cta_href: 'https://wa.me/59170000000?text=Hola%2C%20quiero%20reservar%20Peinado',
                    highlighted: false,
                },
                {
                    title: 'Tratamientos',
                    description:
                        'Keratina, alisado brasileño, nutrición profunda y Botox capilar.',
                    image_media_id: 26,
                    duration_minutes: 150,
                    price_from: '450',
                    category: 'Tratamiento',
                    cta_label: 'Reservar',
                    cta_href: 'https://wa.me/59170000000?text=Hola%2C%20quiero%20reservar%20Tratamiento',
                    highlighted: false,
                },
                {
                    title: 'Novias',
                    description:
                        'Paquete completo: prueba, día de boda y retoque incluido.',
                    image_media_id: 24,
                    duration_minutes: 240,
                    price_from: '1500',
                    category: 'Novias',
                    cta_label: 'Reservar',
                    cta_href: 'https://wa.me/59170000000?text=Hola%2C%20quiero%20reservar%20Novia',
                    highlighted: false,
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
        id: 'faq',
        visible: true,
        content: {
            title: 'Preguntas frecuentes',
            subtitle:
                'Respuestas a las dudas más comunes antes de tu primera visita.',
            items: [
                {
                    question: '¿Necesito turno o puedo llegar sin reservar?',
                    answer: '<p>Recomendamos reservar para garantizar tu lugar, especialmente fines de semana. Si venís sin turno, te atendemos según disponibilidad.</p>',
                },
                {
                    question: '¿Aceptan tarjeta o transferencia?',
                    answer: '<p>Sí. Aceptamos efectivo, transferencia bancaria, QR y todas las tarjetas de débito y crédito.</p>',
                },
                {
                    question: '¿Cuánto dura un corte típico?',
                    answer: '<p>Un corte de cabello toma entre 30 y 45 minutos. Si sumás lavado y peinado, unos 60 minutos. Coloración: 2 horas. Te avisamos al reservar.</p>',
                },
                {
                    question: '¿Tienen servicio a domicilio para novias?',
                    answer: '<p>Sí, dentro de La Paz y El Alto. El servicio a domicilio para novias incluye prueba previa y día del evento. Consultá presupuesto.</p>',
                },
                {
                    question: '¿Puedo traer mi propio producto?',
                    answer: '<p>Para tu seguridad usamos productos profesionales hipoalergénicos. Si tenés alguna alergia específica, avisanos antes de la cita.</p>',
                },
            ],
        },
    },
    {
        id: 'pricing',
        visible: true,
        content: {
            title: 'Planes y paquetes',
            subtitle: 'Ahorrá con nuestros paquetes de servicios combinados.',
            items: [
                {
                    name: 'Visita express',
                    description: 'Para el día a día. Corte + lavado rápido.',
                    price: 'Bs. 80',
                    features: [
                        { feature: 'Corte + lavado' },
                        { feature: 'Sin turno previo' },
                    ],
                    highlighted: false,
                    cta_label: 'Reservar',
                    cta_href: 'https://wa.me/59170000000?text=Hola%2C%20quiero%20reservar%20Express',
                },
                {
                    name: 'Combo completo',
                    description: 'Corte + color + tratamiento en una sola visita.',
                    price: 'Bs. 500',
                    features: [
                        { feature: 'Corte personalizado' },
                        { feature: 'Coloración premium' },
                        { feature: 'Tratamiento hidratante' },
                        { feature: 'Peinado final' },
                    ],
                    highlighted: true,
                    cta_label: 'Reservar combo',
                    cta_href: 'https://wa.me/59170000000?text=Hola%2C%20quiero%20reservar%20Combo',
                },
                {
                    name: 'Membresía mensual',
                    description: '2 visitas al mes con beneficios exclusivos.',
                    price: 'Bs. 350/mes',
                    features: [
                        { feature: '2 cortes al mes' },
                        { feature: '15% off en color' },
                        { feature: 'Prioridad en agenda' },
                        { feature: 'Bebida de cortesía' },
                    ],
                    highlighted: false,
                    cta_label: 'Inscribirme',
                    cta_href: 'https://wa.me/59170000000?text=Hola%2C%20quiero%20la%20Membres%C3%ADa',
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
        type: 'image',
        visible: true,
        content: {
            image_media_id: 27,
            alt: 'Camila trabajando en el estudio',
            aspect: 'wide',
            rounded: true,
        },
    },
    {
        type: 'button',
        visible: true,
        content: {
            label: 'Conocé a nuestro equipo',
            href: '#team',
            variant: 'outline',
            size: 'md',
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
        type: 'gallery',
        visible: true,
        content: {
            items: [
                {
                    image_media_id: 33,
                    alt: 'Corte bob moderno',
                    caption: 'Corte bob',
                },
                {
                    image_media_id: 31,
                    alt: 'Balayage caramel',
                    caption: 'Balayage',
                },
                {
                    image_media_id: 34,
                    alt: 'Corte masculino fade',
                    caption: 'Fade',
                },
                {
                    image_media_id: 35,
                    alt: 'Tratamiento keratina',
                    caption: 'Keratina',
                },
            ],
            columns: '4',
            aspect: 'square',
            gap: 'md',
            radius: 'md',
        },
    },
    {
        type: 'countdown',
        visible: true,
        content: {
            target_date: '2026-06-30T23:59:59',
            title: '20% OFF nuevos clientes',
            expired_text: 'Promo terminada. ¡Seguinos en redes para la próxima!',
            variant: 'boxes',
            size: 'md',
            accent: 'destructive',
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
    {
        type: 'heading',
        visible: true,
        content: {
            text: 'Antes y después',
            level: 'h2',
            align: 'center',
        },
    },
    {
        type: 'before-after',
        visible: true,
        content: {
            title: 'Transformaciones reales',
            subtitle:
                'Deslizá para ver el antes y el después de cada clienta.',
            columns: '1',
            aspect: 'video',
            columns_mobile_stack: true,
            items: [
                {
                    before_media_id: 18,
                    after_media_id: 17,
                    caption: 'Balayage + Corte',
                    before_label: 'Antes',
                    after_label: 'Después',
                },
                {
                    before_media_id: 20,
                    after_media_id: 19,
                    caption: 'Color fantasía',
                    before_label: 'Antes',
                    after_label: 'Después',
                },
            ],
        },
    },
    {
        type: 'map',
        visible: true,
        content: {
            address: 'Av. Ballivián, La Paz',
            lat: -16.5228,
            lng: -68.0843,
            zoom: 15,
            marker: true,
            scroll_wheel_zoom: false,
            height: 'md',
            radius: 'xl',
            caption: 'Estudio Camila · Av. Ballivián, La Paz',
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
            eyebrow: 'Catálogo · Cuentas digitales',
            headline: 'Todas tus plataformas en un solo lugar',
            subheadline:
                'Netflix, HBO Max, Disney+, Spotify, Prime Video y más. Acceso inmediato, soporte 24/7 y métodos de pago locales.',
            cta_label: 'Ver planes',
            cta_href: '#services',
            secondary_label: 'Cómo funciona',
            secondary_href: '#features',
            image_media_id: '__MEDIA:hero-streaming__',
        },
    },
    {
        id: 'features',
        visible: true,
        content: {
            title: 'Cómo funciona',
            subtitle:
                'En menos de cinco minutos tenés el acceso en tu correo. Sin enredos.',
            items: [
                {
                    icon: 'MousePointerClick',
                    title: '1. Elegí plataforma',
                    description:
                        'Mirá el catálogo y elegí la plataforma y el plan que querés.',
                },
                {
                    icon: 'Wallet',
                    title: '2. Pagás',
                    description:
                        'Transferencia, Yape, Plin, Nequi, USDT o tarjeta. Confirmamos al instante.',
                },
                {
                    icon: 'Mail',
                    title: '3. Recibís el acceso',
                    description:
                        'Te llega usuario, contraseña y pasos de configuración por WhatsApp o correo.',
                },
                {
                    icon: 'MessageCircle',
                    title: '4. Soporte 24/7',
                    description:
                        'Cualquier duda te la resolvemos por WhatsApp en minutos. Sin contestar con bots.',
                },
            ],
        },
    },
    {
        id: 'services-grid',
        visible: true,
        content: {
            eyebrow: 'Plataformas',
            title: 'Catálogo de planes',
            subtitle:
                'Cuentas individuales o combos. Calidad 4K, HDR y perfiles simultáneos según plataforma.',
            columns: '3',
            default_currency: '$',
            items: [
                {
                    title: 'Netflix Estándar',
                    description: '1 pantalla en HD. Catálogo completo de series y películas.',
                    image_media_id: '__MEDIA:platform-netflix__',
                    duration_minutes: 30,
                    price_from: '45',
                    category: 'Video',
                    cta_label: 'Pedir por WhatsApp',
                    cta_href: 'https://wa.me/59170000000?text=Hola%2C%20quiero%20Netflix%20Est%C3%A1ndar',
                    highlighted: false,
                },
                {
                    title: 'Netflix Premium',
                    description: '4 pantallas en 4K + HDR. Ideal para compartir en familia.',
                    image_media_id: '__MEDIA:platform-netflix__',
                    duration_minutes: 30,
                    price_from: '75',
                    category: 'Video',
                    cta_label: 'Pedir por WhatsApp',
                    cta_href: 'https://wa.me/59170000000?text=Hola%2C%20quiero%20Netflix%20Premium',
                    highlighted: true,
                },
                {
                    title: 'HBO Max Estándar',
                    description: 'Series originales, Warner, DC y películas de catálogo HBO.',
                    image_media_id: '__MEDIA:platform-hbo__',
                    duration_minutes: 30,
                    price_from: '50',
                    category: 'Video',
                    cta_label: 'Pedir por WhatsApp',
                    cta_href: 'https://wa.me/59170000000?text=Hola%2C%20quiero%20HBO%20Max',
                    highlighted: false,
                },
                {
                    title: 'Disney+ Premium',
                    description: 'Disney, Marvel, Star Wars, National Geographic. 4K y 4 perfiles.',
                    image_media_id: '__MEDIA:platform-disney__',
                    duration_minutes: 30,
                    price_from: '55',
                    category: 'Video',
                    cta_label: 'Pedir por WhatsApp',
                    cta_href: 'https://wa.me/59170000000?text=Hola%2C%20quiero%20Disney%2B',
                    highlighted: false,
                },
                {
                    title: 'Spotify Duo',
                    description: 'Dos cuentas Premium en una dirección. Música sin anuncios y descargas.',
                    image_media_id: '__MEDIA:platform-spotify__',
                    duration_minutes: 30,
                    price_from: '40',
                    category: 'Música',
                    cta_label: 'Pedir por WhatsApp',
                    cta_href: 'https://wa.me/59170000000?text=Hola%2C%20quiero%20Spotify%20Duo',
                    highlighted: false,
                },
                {
                    title: 'Prime Video',
                    description: 'Películas y series Amazon Originals. 3 perfiles simultáneos.',
                    image_media_id: '__MEDIA:platform-prime__',
                    duration_minutes: 30,
                    price_from: '38',
                    category: 'Video',
                    cta_label: 'Pedir por WhatsApp',
                    cta_href: 'https://wa.me/59170000000?text=Hola%2C%20quiero%20Prime%20Video',
                    highlighted: false,
                },
                {
                    title: 'YouTube Premium',
                    description: 'Sin anuncios, descargas y YouTube Music incluido.',
                    image_media_id: '__MEDIA:platform-youtube__',
                    duration_minutes: 30,
                    price_from: '42',
                    category: 'Video',
                    cta_label: 'Pedir por WhatsApp',
                    cta_href: 'https://wa.me/59170000000?text=Hola%2C%20quiero%20YouTube%20Premium',
                    highlighted: false,
                },
                {
                    title: 'Apple TV+',
                    description: 'Series y películas Apple Originals. Calidad 4K HDR y Dolby Atmos.',
                    image_media_id: '__MEDIA:platform-appletv__',
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
                    image_media_id: '__MEDIA:platform-paramount__',
                    duration_minutes: 30,
                    price_from: '40',
                    category: 'Video',
                    cta_label: 'Pedir por WhatsApp',
                    cta_href: 'https://wa.me/59170000000?text=Hola%2C%20quiero%20Paramount%2B',
                    highlighted: false,
                },
            ],
        },
    },
    {
        id: 'pricing',
        visible: true,
        content: {
            title: 'Combos con descuento',
            subtitle:
                'Si querés más de una plataforma, los combos te ahorran hasta un 30%.',
            items: [
                {
                    name: 'Combo Básico',
                    description: 'Una plataforma a elección. Ideal si querés probar.',
                    price: 'desde $38',
                    features: [
                        { feature: 'Una plataforma a elección' },
                        { feature: 'Acceso inmediato' },
                        { feature: 'Soporte por WhatsApp' },
                    ],
                    highlighted: false,
                    cta_label: 'Elegir plataforma',
                    cta_href: '#services',
                },
                {
                    name: 'Combo Duo',
                    description:
                        'Dos plataformas con 15% de descuento. Lo más pedido.',
                    price: 'desde $70',
                    features: [
                        { feature: 'Dos plataformas a elección' },
                        { feature: '15% off sobre la lista' },
                        { feature: 'Acceso inmediato' },
                        { feature: 'Soporte prioritario' },
                    ],
                    highlighted: true,
                    cta_label: 'Pedir Duo',
                    cta_href: 'https://wa.me/59170000000?text=Hola%2C%20quiero%20Combo%20Duo',
                },
                {
                    name: 'Combo Total',
                    description:
                        'Tres o más plataformas. El combo familiar con 30% off.',
                    price: 'desde $120',
                    features: [
                        { feature: '3+ plataformas a elección' },
                        { feature: '30% off sobre la lista' },
                        { feature: 'Renovación automática' },
                        { feature: 'Soporte VIP 24/7' },
                        { feature: 'Reemplazo gratuito ante baja' },
                    ],
                    highlighted: false,
                    cta_label: 'Pedir Total',
                    cta_href: 'https://wa.me/59170000000?text=Hola%2C%20quiero%20Combo%20Total',
                },
            ],
        },
    },
    {
        id: 'faq',
        visible: true,
        content: {
            title: 'Preguntas frecuentes',
            subtitle:
                'Si te queda alguna duda, escribinos por WhatsApp y te respondemos al toque.',
            items: [
                {
                    question: '¿Cómo recibo el acceso después de pagar?',
                    answer:
                        'Te llega por WhatsApp en menos de 5 minutos. Si pagaste por transferencia, apenas confirmamos el pago.',
                },
                {
                    question: '¿Qué métodos de pago aceptan?',
                    answer:
                        'Transferencia bancaria, Yape, Plin, Nequi, Binance Pay (USDT), PayPal y tarjeta de crédito.',
                },
                {
                    question: '¿Cuántos perfiles puedo usar al mismo tiempo?',
                    answer:
                        'Depende del plan. Netflix Premium son 4 perfiles en 4K, Disney+ Premium son 4 perfiles, HBO Max son 3 perfiles en HD.',
                },
                {
                    question: '¿Y si una cuenta deja de funcionar?',
                    answer:
                        'Te la reemplazamos sin costo dentro de las 24 horas. La garantía está incluida en todos los planes.',
                },
                {
                    question: '¿Puedo renovar antes de que venza?',
                    answer:
                        'Sí. Te avisamos 3 días antes del vencimiento y renovás al mismo precio que pagaste originalmente.',
                },
                {
                    question: '¿Hacen factura?',
                    answer:
                        'Emitimos nota de venta o factura digital si la necesitás para tu empresa.',
                },
            ],
        },
    },
    {
        id: 'testimonials',
        visible: true,
        content: {
            eyebrow: 'Clientes',
            title: 'Lo que dicen nuestros clientes',
            description: 'Comentarios reales de gente que ya está usando el servicio.',
            columns: '3',
            variant: 'card',
            show_rating: true,
            items: [
                {
                    quote:
                        'Llevo 8 meses con el Combo Duo y nunca tuve problemas. Cuando una cuenta cayó, me la cambiaron en el día.',
                    author_name: 'Carlos M.',
                    author_role: 'Cliente hace 8 meses',
                    author_image_media_id: '__MEDIA:avatar-streaming-carlos__',
                    rating: 5,
                },
                {
                    quote:
                        'Atención rapidísima por WhatsApp. Pago por Yape y en 3 minutos ya estaba viendo Netflix Premium en 4K.',
                    author_name: 'Lucía R.',
                    author_role: 'Cliente VIP',
                    author_image_media_id: '__MEDIA:avatar-streaming-lucia__',
                    rating: 5,
                },
                {
                    quote:
                        'Probé con varios y este es el más serio. Llevo un año sin caídas y siempre cumplen con la garantía.',
                    author_name: 'Diego S.',
                    author_role: 'Cliente hace 1 año',
                    author_image_media_id: '__MEDIA:avatar-streaming-diego__',
                    rating: 5,
                },
            ],
        },
    },
    {
        id: 'cta',
        visible: true,
        content: {
            title: '¿Listo para empezar?',
            subtitle:
                'Escribinos por WhatsApp con la plataforma que querés y te pasamos el precio al instante.',
            button_label: 'Pedir por WhatsApp',
            button_href: 'https://wa.me/59170000000?text=Hola%2C%20quiero%20un%20plan',
            secondary_label: 'Ver planes',
            secondary_href: '#services',
        },
    },
];

const streamingBlocks: PresetBlock[] = [
    {
        type: 'stats',
        visible: true,
        content: {
            eyebrow: 'En números',
            title: 'Lo que conseguimos juntos',
            subtitle:
                'Clientes que confían, plataformas que entregamos y tiempo en el rubro.',
            accent: 'violet',
            items: [
                { icon: 'Users', value: 320, suffix: '+', label: 'Clientes activos' },
                { icon: 'Tv', value: 9, suffix: '', label: 'Plataformas' },
                { icon: 'Clock', value: 4, suffix: ' años', label: 'En el rubro' },
                { icon: 'Heart', value: 1200, suffix: '+', label: 'Suscripciones vendidas' },
            ],
        },
    },
    {
        type: 'spacer',
        visible: true,
        content: { height: 'h-8' },
    },
    {
        type: 'heading',
        visible: true,
        content: {
            text: 'Garantía total',
            level: 'h2',
            align: 'center',
        },
    },
    {
        type: 'image',
        visible: true,
        content: {
            image_media_id: '__MEDIA:gallery-streaming-highlights__',
            alt: 'Garantía total · reemplazo sin costo',
            aspect: 'video',
            rounded: true,
        },
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
            text: 'Acceso inmediato HD/4K',
            level: 'h2',
            align: 'center',
        },
    },
    {
        type: 'image',
        visible: true,
        content: {
            image_media_id: '__MEDIA:gallery-streaming-setup__',
            alt: 'Calidad HD/4K · perfiles simultáneos',
            aspect: 'video',
            rounded: true,
        },
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
            text: 'Soporte 24/7 por WhatsApp',
            level: 'h2',
            align: 'center',
        },
    },
    {
        type: 'image',
        visible: true,
        content: {
            image_media_id: '__MEDIA:gallery-streaming-charla__',
            alt: 'Soporte por WhatsApp las 24 horas',
            aspect: 'video',
            rounded: true,
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
        name: 'Peluquería & Barbería',
        description:
            'Para peluquerías, barberías y salones de belleza. Con equipo, catálogo de servicios con precios y duraciones, galería, antes/después, testimonios y ubicación.',
        icon: 'Scissors',
        accent: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
        defaultName: 'Estudio Camila',
        defaultSlug: 'estudio-camila',
        defaultDescription: 'Peluquería & Estética en La Paz, Bolivia.',
        sections: peluqueriaSections,
        blocks: peluqueriaBlocks,
        menu_items: [
            { label: 'Inicio', href: '#hero', icon: 'Home' },
            { label: 'Servicios', href: '#services-grid', icon: 'Sparkles' },
            { label: 'Equipo', href: '#team', icon: 'Users' },
            { label: 'Galería', href: '#gallery', icon: 'Image' },
            { label: 'Testimonios', href: '#testimonials', icon: 'Star' },
            { label: 'Ubicación', href: '#location', icon: 'MapPin' },
            { label: 'Reservar', href: 'https://wa.me/59170000000?text=Hola%20Camila%2C%20quiero%20reservar%20un%20turno', icon: 'Phone' },
        ],
    },
    {
        id: 'streaming',
        name: 'Tienda de Streaming',
        description:
            'Para venta de cuentas de Netflix, HBO Max, Disney+, Spotify y más. Con catálogo, combos con descuento, FAQ y pedidos por WhatsApp.',
        icon: 'Tv',
        accent:
            'bg-violet-500/15 text-violet-700 dark:text-violet-300',
        defaultName: 'Streaming Store',
        defaultSlug: 'streaming-store',
        defaultDescription:
            'Todas tus plataformas en un solo lugar. Acceso inmediato y soporte 24/7.',
        sections: streamingSections,
        blocks: streamingBlocks,
        menu_items: [
            { label: 'Inicio', href: '#hero', icon: 'Home' },
            { label: 'Cómo funciona', href: '#features', icon: 'Sparkles' },
            { label: 'Catálogo', href: '#services', icon: 'Tv' },
            { label: 'Combos', href: '#pricing', icon: 'Tag' },
            { label: 'FAQ', href: '#faq', icon: 'HelpCircle' },
            { label: 'Contacto', href: 'https://wa.me/59170000000', icon: 'MessageCircle' },
        ],
    },
];

export function getPresetTemplate(id: string): PresetTemplate | null {
    return PRESET_TEMPLATES.find((p) => p.id === id) ?? null;
}

export function listPresetTemplates(): PresetTemplate[] {
    return PRESET_TEMPLATES;
}