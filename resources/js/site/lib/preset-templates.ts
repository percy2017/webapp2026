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
            eyebrow: '🔴 En vivo · Lun a Vie 20:00 hs',
            headline: 'Stream, comunidad y buena energía',
            subheadline:
                'Gaming competitivo, IRL y charas con la comunidad. Sumate a Twitch o YouTube para no perderte nada.',
            cta_label: 'Ver en Twitch',
            cta_href: 'https://twitch.tv/',
            secondary_label: 'Apoyar el canal',
            secondary_href: '#pricing',
            image_media_id: '__MEDIA:hero-streaming__',
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
            title: 'Highlights recientes',
            subtitle: 'Los mejores momentos del último mes.',
            items: [
                {
                    image_media_id: '__MEDIA:gallery-streaming-setup__',
                    alt: 'Setup del stream',
                    caption: 'Mi setup',
                },
                {
                    image_media_id: '__MEDIA:gallery-streaming-win-epico__',
                    alt: 'Clip destacado · Win épico',
                    caption: 'Win épico',
                },
                {
                    image_media_id: '__MEDIA:gallery-streaming-irl-calle__',
                    alt: 'IRL en la calle',
                    caption: 'IRL stream',
                },
                {
                    image_media_id: '__MEDIA:gallery-streaming-torneo__',
                    alt: 'Torneo con la comunidad',
                    caption: 'Torneo',
                },
                {
                    image_media_id: '__MEDIA:gallery-streaming-charla__',
                    alt: 'Charla con viewer',
                    caption: 'Charla',
                },
                {
                    image_media_id: '__MEDIA:gallery-streaming-highlights__',
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
                    author_image_media_id: '__MEDIA:avatar-streaming-carlos__',
                    rating: 5,
                },
                {
                    quote:
                        'La calidad del stream y el carisma del streamer son únicos. Vale cada peso.',
                    author_name: 'Lucía R.',
                    author_role: 'Patreon VIP',
                    author_image_media_id: '__MEDIA:avatar-streaming-lucia__',
                    rating: 5,
                },
                {
                    quote:
                        'Encontré una comunidad increíble. El Discord es lo mejor que me pasó este año.',
                    author_name: 'Diego S.',
                    author_role: 'Viewer hace 1 año',
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
        type: 'stats',
        visible: true,
        content: {
            eyebrow: 'En números',
            title: 'Lo que conseguimos juntos',
            subtitle:
                'Gracias a la comunidad por hacer posible cada stream.',
            accent: 'violet',
            items: [
                { icon: 'Users', value: 12500, suffix: '+', label: 'Suscriptores' },
                { icon: 'Eye', value: 850000, suffix: '', label: 'Vistas totales' },
                { icon: 'Clock', value: 2400, suffix: ' h', label: 'Horas en vivo' },
                { icon: 'Heart', value: 4800, suffix: '+', label: 'Miembros' },
            ],
        },
    },
    {
        type: 'schedule',
        visible: true,
        content: {
            eyebrow: 'Agenda semanal',
            title: 'Cuándo estoy en vivo',
            subtitle: 'Mismos horarios cada semana.',
            timezone: 'BO (UTC-4)',
            accent: 'violet',
            show_today: true,
            slots: [
                { day: 'Lunes', time: '20:00', title: 'Gaming · Ranked', active: true },
                { day: 'Martes', time: '20:00', title: 'IRL · Paseo', active: true },
                { day: 'Miércoles', time: '21:00', title: 'Just Chatting', active: true },
                { day: 'Jueves', time: '20:00', title: 'Gaming · Coop', active: true },
                { day: 'Viernes', time: '22:00', title: 'Torneo comunidad', active: true },
                { day: 'Sábado', time: '18:00', title: 'Maratón', active: false },
                { day: 'Domingo', time: '—', title: 'Descanso', active: false },
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
            url: '',
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