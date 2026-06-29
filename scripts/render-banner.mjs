// scripts/render-banner.mjs — render banner-webapp.svg to PNG via @resvg/resvg-js.
// Usage: node scripts/render-banner.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const svgPath = process.argv[2] ?? 'banner-webapp.svg';
const pngPath = process.argv[3] ?? 'banner-webapp.png';

const svg = readFileSync(svgPath, 'utf8');

const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1280 },
    background: '#0a0814',
    font: {
        fontFiles: [
            '/home/hostbol/web/app.hostbol.lat/public_html/.claude/skills/canvas-design/canvas-fonts/CrimsonPro-Italic.ttf',
            '/home/hostbol/web/app.hostbol.lat/public_html/.claude/skills/canvas-design/canvas-fonts/JetBrainsMono-Regular.ttf',
            '/home/hostbol/web/app.hostbol.lat/public_html/.claude/skills/canvas-design/canvas-fonts/JetBrainsMono-Bold.ttf',
        ],
        loadSystemFonts: true,
        defaultFontFamily: 'CrimsonPro-Italic',
    },
});

const png = resvg.render().asPng();
writeFileSync(pngPath, png);

console.log(`Wrote ${pngPath} (${png.length} bytes)`);
