import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { ImageBlock } from '../resources/js/site/blocks/image-block.tsx';

const defaultContent = {
    image_media_id: null,
    image_url: '/blocks/sample-image.svg',
    alt: 'Imagen de muestra',
    aspect: 'auto',
    rounded: false,
};

const el = createElement(ImageBlock, { content: defaultContent });
console.log(renderToStaticMarkup(el));
