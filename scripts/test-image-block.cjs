const ts = require('typescript');
const fs = require('fs');
const code = fs.readFileSync('/home/hostbol/web/app.hostbol.lat/public_html/resources/js/site/blocks/image-block.tsx', 'utf8');
const result = ts.transpileModule(code, {
    compilerOptions: { module: 'commonjs', target: 'es2022', jsx: 'react-jsx' },
});
fs.writeFileSync('/tmp/image-block.cjs', result.outputText.replace(/from\s+['"][^'"]+['"]/g, "from 'node:path'"));
const ImageBlock = require('/tmp/image-block.cjs').ImageBlock;

const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const defaultContent = {
    image_media_id: null,
    image_url: '/blocks/sample-image.svg',
    alt: 'Imagen de muestra',
    aspect: 'auto',
    rounded: false,
};

const el = React.createElement(ImageBlock, { content: defaultContent });
console.log(renderToStaticMarkup(el));
