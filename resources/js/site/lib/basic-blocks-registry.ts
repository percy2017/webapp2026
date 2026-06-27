import type { ComponentType } from 'react';
import type { ContentField } from '@site/lib/template-registry';
import { HeadingBlock } from '@site/blocks/heading-block';
import { ParagraphBlock } from '@site/blocks/paragraph-block';
import { ImageBlock } from '@site/blocks/image-block';
import { ButtonBlock } from '@site/blocks/button-block';
import { SpacerBlock } from '@site/blocks/spacer-block';
import { DividerBlock } from '@site/blocks/divider-block';
import { GalleryBlock } from '@site/blocks/gallery-block';
import { VideoBlock } from '@site/blocks/video-block';
import { MapBlock } from '@site/blocks/map-block';
import { CountdownBlock } from '@site/blocks/countdown-block';

export type BlockContent = Record<string, unknown>;

export type BlockProps = {
    id?: string;
    content: BlockContent;
    theme?: {
        primary_color?: string;
        accent_color?: string;
        radius?: string;
    };
};

export type BasicBlockDefinition = {
    id: string;
    label: string;
    description: string;
    icon: string;
    component: ComponentType<BlockProps>;
    defaultContent: BlockContent;
    schema: ContentField[];
    isEmpty?: (content: BlockContent) => boolean;
};

export const BASIC_BLOCKS_REGISTRY: Record<string, BasicBlockDefinition> = {
    heading: {
        id: 'heading',
        label: 'Título',
        description: 'Encabezado con nivel y alineación.',
        icon: 'Heading',
        component: HeadingBlock,
        defaultContent: {
            text: 'Tu título acá',
            level: 'h2',
            align: 'left',
        },
        schema: [
            { key: 'text', label: 'Texto', type: 'text' },
            {
                key: 'level',
                label: 'Nivel',
                type: 'radio',
                options: [
                    { label: 'H1', value: 'h1' },
                    { label: 'H2', value: 'h2' },
                    { label: 'H3', value: 'h3' },
                    { label: 'H4', value: 'h4' },
                ],
            },
            {
                key: 'align',
                label: 'Alineación',
                type: 'radio',
                options: [
                    { label: 'Izquierda', value: 'left' },
                    { label: 'Centro', value: 'center' },
                    { label: 'Derecha', value: 'right' },
                ],
            },
        ],
        isEmpty: (content) => !content.text,
    },
    paragraph: {
        id: 'paragraph',
        label: 'Párrafo',
        description: 'Texto enriquecido con formato.',
        icon: 'Pilcrow',
        component: ParagraphBlock,
        defaultContent: {
            content: {
                type: 'doc',
                content: [
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: 'Acá va tu párrafo. Podés usar ',
                            },
                            { type: 'text', marks: [{ type: 'bold' }], text: 'negrita' },
                            { type: 'text', text: ', ' },
                            { type: 'text', marks: [{ type: 'italic' }], text: 'cursiva' },
                            { type: 'text', text: ' y ' },
                            {
                                type: 'text',
                                marks: [
                                    {
                                        type: 'link',
                                        attrs: { href: '#' },
                                    },
                                ],
                                text: 'links',
                            },
                            { type: 'text', text: '.' },
                        ],
                    },
                ],
            },
            align: 'left',
        },
        schema: [
            { key: 'content', label: 'Contenido', type: 'richtext' },
            {
                key: 'align',
                label: 'Alineación',
                type: 'radio',
                options: [
                    { label: 'Izquierda', value: 'left' },
                    { label: 'Centro', value: 'center' },
                    { label: 'Derecha', value: 'right' },
                ],
            },
        ],
        isEmpty: (content) =>
            !content.content ||
            String(content.content).replace(/<[^>]*>/g, '').trim() === '',
    },
    image: {
        id: 'image',
        label: 'Imagen',
        description: 'Imagen con control de tamaño y bordes.',
        icon: 'Image',
        component: ImageBlock,
        defaultContent: {
            image_media_id: null,
            alt: '',
            aspect: 'auto',
            rounded: false,
        },
        schema: [
            { key: 'image_media_id', label: 'Imagen', type: 'image' },
            { key: 'alt', label: 'Texto alternativo', type: 'text' },
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
            { key: 'rounded', label: 'Bordes redondeados', type: 'boolean' },
        ],
        isEmpty: (content) => !content.image_media_id,
    },
    button: {
        id: 'button',
        label: 'Botón',
        description: 'Llamado a la acción.',
        icon: 'MousePointerClick',
        component: ButtonBlock,
        defaultContent: {
            label: 'Empezar gratis',
            href: '#contact',
            variant: 'solid',
            size: 'md',
            align: 'left',
        },
        schema: [
            { key: 'label', label: 'Texto', type: 'text' },
            { key: 'href', label: 'URL', type: 'text' },
            {
                key: 'variant',
                label: 'Estilo',
                type: 'radio',
                options: [
                    { label: 'Sólido', value: 'solid' },
                    { label: 'Contorno', value: 'outline' },
                    { label: 'Fantasma', value: 'ghost' },
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
                key: 'align',
                label: 'Alineación',
                type: 'radio',
                options: [
                    { label: 'Izquierda', value: 'left' },
                    { label: 'Centro', value: 'center' },
                    { label: 'Derecha', value: 'right' },
                ],
            },
        ],
        isEmpty: (content) => !content.label,
    },
    spacer: {
        id: 'spacer',
        label: 'Espaciador',
        description: 'Espacio vertical entre bloques.',
        icon: 'Space',
        component: SpacerBlock,
        defaultContent: {
            height: 'h-16',
        },
        schema: [
            {
                key: 'height',
                label: 'Altura',
                type: 'text',
                helper: 'h-8, h-12, h-16, h-20, h-24, h-32',
            },
        ],
        isEmpty: () => false,
    },
    divider: {
        id: 'divider',
        label: 'Divisor',
        description: 'Línea horizontal.',
        icon: 'Minus',
        component: DividerBlock,
        defaultContent: {
            style: 'solid',
        },
        schema: [
            {
                key: 'style',
                label: 'Estilo',
                type: 'radio',
                options: [
                    { label: 'Sólido', value: 'solid' },
                    { label: 'Guiones', value: 'dashed' },
                    { label: 'Puntos', value: 'dotted' },
                ],
            },
        ],
        isEmpty: () => false,
    },
    gallery: {
        id: 'gallery',
        label: 'Galería',
        description: 'Grid de imágenes con caption opcional.',
        icon: 'Images',
        component: GalleryBlock,
        defaultContent: {
            items: [],
            columns: '3',
            aspect: 'square',
            gap: 'md',
            radius: 'md',
        },
        schema: [
            {
                key: 'items',
                label: 'Imágenes',
                type: 'list',
                itemLabel: 'Imagen',
                itemSchema: [
                    {
                        key: 'image_media_id',
                        label: 'Imagen',
                        type: 'image',
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
        ],
        isEmpty: (content) => {
            const items = Array.isArray(content.items) ? content.items : [];
            return items.length === 0;
        },
    },
    video: {
        id: 'video',
        label: 'Video',
        description: 'Video de YouTube, Vimeo o archivo propio.',
        icon: 'Video',
        component: VideoBlock,
        defaultContent: {
            source: 'url',
            url: '',
            media_id: null,
            title: '',
            autoplay: false,
            controls: true,
            loop: false,
            muted: false,
            aspect: 'video',
            radius: 'xl',
        },
        schema: [
            {
                key: 'source',
                label: 'Fuente',
                type: 'radio',
                options: [
                    { label: 'URL externa', value: 'url' },
                    { label: 'Archivo de Medios', value: 'media' },
                ],
            },
            {
                key: 'url',
                label: 'URL del video',
                type: 'text',
                helper: 'YouTube, Vimeo o .mp4 / .webm directo.',
            },
            {
                key: 'media_id',
                label: 'Video de la biblioteca',
                type: 'image',
            },
            {
                key: 'title',
                label: 'Título',
                type: 'text',
            },
            {
                key: 'autoplay',
                label: 'Autoplay',
                type: 'boolean',
            },
            {
                key: 'controls',
                label: 'Mostrar controles',
                type: 'boolean',
            },
            {
                key: 'loop',
                label: 'Loop',
                type: 'boolean',
            },
            {
                key: 'muted',
                label: 'Silenciado',
                type: 'boolean',
            },
            {
                key: 'aspect',
                label: 'Proporción',
                type: 'radio',
                options: [
                    { label: 'Video (16:9)', value: 'video' },
                    { label: 'Cuadrado', value: 'square' },
                    { label: 'Ancho (21:9)', value: 'wide' },
                    { label: 'Vertical (9:16)', value: 'tall' },
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
        ],
        isEmpty: (content) => {
            const url =
                typeof content.url === 'string' ? content.url.trim() : '';
            const media = content.media_id;
            const hasMedia =
                media !== null &&
                media !== undefined &&
                media !== '' &&
                (!(
                    typeof media === 'object' &&
                    (!media ||
                        (media.id == null && !media.url))
                ));
            return !url && !hasMedia;
        },
    },
    map: {
        id: 'map',
        label: 'Mapa',
        description: 'Mapa de OpenStreetMap con dirección o coordenadas.',
        icon: 'MapPin',
        component: MapBlock,
        defaultContent: {
            address: 'Obelisco, Buenos Aires',
            lat: -34.6037,
            lng: -58.3816,
            zoom: 15,
            marker: true,
            scroll_wheel_zoom: false,
            height: 'md',
            radius: 'xl',
            caption: 'Nuestra ubicación',
        },
        schema: [
            {
                key: 'address',
                label: 'Dirección',
                type: 'text',
                helper:
                    'Calle y ciudad, o "lat, lng" (ej: -34.6037, -58.3816).',
            },
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
            {
                key: 'zoom',
                label: 'Zoom',
                type: 'text',
                helper: '1 (mundo) a 19 (calle). Default: 14.',
            },
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
                key: 'height',
                label: 'Altura',
                type: 'radio',
                options: [
                    { label: 'Chico', value: 'sm' },
                    { label: 'Mediano', value: 'md' },
                    { label: 'Grande', value: 'lg' },
                    { label: 'Extra', value: 'xl' },
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
                key: 'caption',
                label: 'Caption',
                type: 'text',
            },
        ],
        isEmpty: (content) => {
            const address =
                typeof content.address === 'string'
                    ? content.address.trim()
                    : '';
            const lat =
                typeof content.lat === 'number'
                    ? content.lat
                    : Number.NaN;
            const lng =
                typeof content.lng === 'number'
                    ? content.lng
                    : Number.NaN;
            return !address && (Number.isNaN(lat) || Number.isNaN(lng));
        },
    },
    countdown: {
        id: 'countdown',
        label: 'Cronómetro',
        description: 'Cuenta regresiva para promos, lanzamientos o eventos.',
        icon: 'Timer',
        component: CountdownBlock,
        defaultContent: () => {
            const inSevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            const pad = (n: number) => n.toString().padStart(2, '0');
            const target = `${inSevenDays.getFullYear()}-${pad(
                inSevenDays.getMonth() + 1,
            )}-${pad(inSevenDays.getDate())}T${pad(inSevenDays.getHours())}:${pad(
                inSevenDays.getMinutes(),
            )}`;
            return {
                target_date: target,
                title: 'Oferta termina en',
                expired_text: '¡Oferta terminada!',
                variant: 'boxes',
                size: 'md',
                accent: 'primary',
            };
        },
        schema: [
            {
                key: 'target_date',
                label: 'Fecha objetivo',
                type: 'text',
                helper:
                    'ISO datetime: 2026-12-31T23:59:59 o fecha simple: 2026-12-31',
            },
            { key: 'title', label: 'Título', type: 'text' },
            {
                key: 'expired_text',
                label: 'Texto al expirar',
                type: 'text',
            },
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
};

export function getBasicBlockDefinition(
    id: string,
): BasicBlockDefinition | null {
    return BASIC_BLOCKS_REGISTRY[id] ?? null;
}

export function listBasicBlockDefinitions(): BasicBlockDefinition[] {
    return Object.values(BASIC_BLOCKS_REGISTRY);
}