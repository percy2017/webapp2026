import type { ComponentType } from 'react';
import { ButtonBlock } from '@site/blocks/button-block';
import { ContainerBlock } from '@site/blocks/container-block';
import { DividerBlock } from '@site/blocks/divider-block';
import { HeadingBlock } from '@site/blocks/heading-block';
import { ImageBlock } from '@site/blocks/image-block';
import { MapBlock } from '@site/blocks/map-block';
import { ParagraphBlock } from '@site/blocks/paragraph-block';
import { SpacerBlock } from '@site/blocks/spacer-block';
import { VideoBlock } from '@site/blocks/video-block';
import type { ContentField } from '@site/lib/template-registry';

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
            source: 'url',
            image_media_id: null,
            image_url: '/blocks/sample-image.svg',
            url: '/blocks/sample-image.svg',
            alt: 'Imagen de muestra',
            aspect: 'auto',
            rounded: false,
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
            { key: 'url', label: 'URL de la imagen', type: 'text' },
            {
                key: 'image_media_id',
                label: 'Imagen de la biblioteca',
                type: 'image',
                mediaKind: 'image',
            },
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
        isEmpty: (content) => {
            if (content.source === 'media') return !content.image_media_id;

            return !content.url && !content.image_url;
        },
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
    container: {
        id: 'container',
        label: 'Contenedor',
        description:
            'Fila, columna o grid para agrupar otros bloques. Anidable.',
        icon: 'LayoutGrid',
        component: ContainerBlock,
        defaultContent: {
            layout: 'stack',
            align: 'stretch',
            gap: 'md',
            padding: 'md',
            background: 'transparent',
            radius: 'none',
            border: 'none',
            max_width: 'full',
            min_height: 'none',
        },
        schema: [
            {
                key: 'layout',
                label: 'Disposición',
                type: 'radio',
                options: [
                    { label: 'Columna', value: 'stack' },
                    { label: 'Fila', value: 'row' },
                    { label: 'Fila inversa', value: 'row-reverse' },
                    { label: 'Grid 3 col', value: 'grid' },
                ],
            },
            {
                key: 'align',
                label: 'Alineación',
                type: 'radio',
                options: [
                    { label: 'Arriba / Izquierda', value: 'start' },
                    { label: 'Centro', value: 'center' },
                    { label: 'Abajo / Derecha', value: 'end' },
                    { label: 'Distribuido', value: 'between' },
                    { label: 'Estirar', value: 'stretch' },
                ],
            },
            {
                key: 'gap',
                label: 'Espacio entre hijos',
                type: 'radio',
                options: [
                    { label: 'Ninguno', value: 'none' },
                    { label: 'Chico', value: 'sm' },
                    { label: 'Mediano', value: 'md' },
                    { label: 'Grande', value: 'lg' },
                    { label: 'Extra', value: 'xl' },
                ],
            },
            {
                key: 'padding',
                label: 'Padding interno',
                type: 'radio',
                options: [
                    { label: 'Ninguno', value: 'none' },
                    { label: 'Chico', value: 'sm' },
                    { label: 'Mediano', value: 'md' },
                    { label: 'Grande', value: 'lg' },
                    { label: 'Extra', value: 'xl' },
                ],
            },
            {
                key: 'background',
                label: 'Fondo',
                type: 'radio',
                options: [
                    { label: 'Transparente', value: 'transparent' },
                    { label: 'Fondo de página', value: 'background' },
                    { label: 'Tarjeta', value: 'card' },
                    { label: 'Suave', value: 'muted' },
                    { label: 'Primario', value: 'primary' },
                    { label: 'Acento', value: 'accent' },
                ],
            },
            {
                key: 'radius',
                label: 'Bordes redondeados',
                type: 'radio',
                options: [
                    { label: 'Sin bordes', value: 'none' },
                    { label: 'Suaves', value: 'sm' },
                    { label: 'Medios', value: 'md' },
                    { label: 'Redondeados', value: 'xl' },
                    { label: 'Muy redondeados', value: 'full' },
                ],
            },
            {
                key: 'border',
                label: 'Borde',
                type: 'radio',
                options: [
                    { label: 'Sin borde', value: 'none' },
                    { label: 'Sutil', value: 'light' },
                    { label: 'Primario', value: 'primary' },
                ],
            },
            {
                key: 'max_width',
                label: 'Ancho máximo',
                type: 'radio',
                options: [
                    { label: 'Full (sin límite)', value: 'full' },
                    { label: 'Contenedor (1280px)', value: 'container' },
                    { label: 'Angosto (896px)', value: 'narrow' },
                    { label: 'Texto (65ch)', value: 'prose' },
                ],
            },
            {
                key: 'min_height',
                label: 'Altura mínima',
                type: 'radio',
                options: [
                    { label: 'Auto', value: 'none' },
                    { label: 'Chico (20vh)', value: 'sm' },
                    { label: 'Mediano (40vh)', value: 'md' },
                    { label: 'Grande (60vh)', value: 'lg' },
                    { label: 'Pantalla completa', value: 'screen' },
                ],
            },
        ],
        isEmpty: () => false,
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
    video: {
        id: 'video',
        label: 'Video',
        description: 'Video de YouTube, Vimeo o archivo propio.',
        icon: 'Video',
        component: VideoBlock,
        defaultContent: {
            source: 'url',
            url: '/blocks/video-defaul.mp4',
            media_id: null,
            title: 'Video de muestra',
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
                mediaKind: 'video',
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
};

export function getBasicBlockDefinition(
    id: string,
): BasicBlockDefinition | null {
    return BASIC_BLOCKS_REGISTRY[id] ?? null;
}

export function listBasicBlockDefinitions(): BasicBlockDefinition[] {
    return Object.values(BASIC_BLOCKS_REGISTRY);
}