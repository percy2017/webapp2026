// Export the peluqueria preset to JSON with __MEDIA:key__ placeholders
// instead of numeric Media IDs, so the seeder can resolve them against any DB.

import { readFileSync, writeFileSync } from 'node:fs';
import ts from 'typescript';

// Map from current DB Media IDs to stable SVG filenames (without extension).
// Keep this in sync with `php artisan media:register-peluqueria-canvas`.
const ID_TO_KEY = {
    17: 'ba-balayage-after',
    18: 'ba-balayage-before',
    19: 'ba-color-after',
    20: 'ba-color-before',
    21: 'service-barba',
    22: 'service-color',
    23: 'service-corte',
    24: 'service-novias',
    25: 'service-peinado',
    26: 'service-tratamientos',
    27: 'team-camila',
    28: 'team-diego',
    29: 'team-lucia',
    30: 'hero-peluqueria',
    31: 'gallery-balayage',
    32: 'gallery-color-fantasia',
    33: 'gallery-corte-bob',
    34: 'gallery-fade',
    35: 'gallery-keratina',
    36: 'gallery-novia',
};

function replaceIds(value) {
    if (Array.isArray(value)) {
        return value.map(replaceIds);
    }
    if (value && typeof value === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            if (
                typeof k === 'string' &&
                k.endsWith('_media_id') &&
                typeof v === 'number' &&
                ID_TO_KEY[v]
            ) {
                out[k] = `__MEDIA:${ID_TO_KEY[v]}__`;
            } else {
                out[k] = replaceIds(v);
            }
        }
        return out;
    }
    return value;
}

const source = readFileSync('resources/js/site/lib/preset-templates.ts', 'utf-8');
const transpiled = ts.transpileModule(source, {
    compilerOptions: { module: 'esnext', target: 'es2022' },
});

const js = transpiled.outputText.replace(
    /from\s+['"][^'"]+\.ts['"]/g,
    "from ''",
);

writeFileSync('_preset-extract.mjs', js);
const mod = await import('../_preset-extract.mjs');

const peluqueria = mod.PRESET_TEMPLATES.find((t) => t.id === 'peluqueria');
if (!peluqueria) {
    console.error('Peluqueria preset not found!');
    process.exit(1);
}

const sections = replaceIds(peluqueria.sections);
const blocks = replaceIds(peluqueria.blocks);
const menuItems = peluqueria.menu_items ?? [];

const output = {
    name: peluqueria.name,
    slug: peluqueria.defaultSlug,
    description: peluqueria.defaultDescription,
    sections,
    blocks,
    menu_items: menuItems,
    // Surface every placeholder that needs resolution so we can verify coverage.
    expected_media_keys: [...new Set(Object.values(ID_TO_KEY))].sort(),
};

const target = 'database/seeders/data/peluqueria-template.json';
writeFileSync(target, JSON.stringify(output, null, 4) + '\n');

console.log(`Written: ${target}`);
console.log(`  sections: ${sections.length}`);
console.log(`  blocks:   ${blocks.length}`);
console.log(`  menu_items: ${menuItems.length}`);
console.log(`  expected_media_keys: ${output.expected_media_keys.length}`);
console.log(`    ${output.expected_media_keys.join(', ')}`);