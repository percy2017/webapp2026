// Verify that the puck-config.tsx registry wiring has no duplicates and
// that each block/section shows up exactly once.

import { readFileSync } from 'node:fs';
import ts from 'typescript';

const SECTION_SRC = readFileSync(
    'resources/js/site/lib/template-registry.ts',
    'utf-8',
);
const BASIC_SRC = readFileSync(
    'resources/js/site/lib/basic-blocks-registry.ts',
    'utf-8',
);
const CONFIG_SRC = readFileSync(
    'resources/js/site/lib/puck-config.tsx',
    'utf-8',
);

function extractKeys(source, registryName) {
    // Match everything from `export const XYZ` up to the closing brace of the
    // top-level object. The block is a flat object so we can scan line-by-line
    // for keys at 4-space indent.
    const startPattern = new RegExp(`export const ${registryName}\\b`);
    const startMatch = startPattern.exec(source);
    if (!startMatch) throw new Error(`Could not find ${registryName}`);
    const startIdx = startMatch.index;
    const block = source.slice(startIdx);
    const endIdx = block.indexOf('\n};');
    if (endIdx === -1) throw new Error(`Could not find end of ${registryName}`);
    const slice = block.slice(0, endIdx);
    const keys = [
        ...slice.matchAll(/^\s{4}(?:'([a-z][a-z0-9-]*)'|"([a-z][a-z0-9-]*)"|([a-z][a-z0-9-]*)):\s*\{/gm),
    ].map((m) => m[1] ?? m[2] ?? m[3]);
    return keys;
}

const sectionIds = extractKeys(SECTION_SRC, 'SECTION_REGISTRY');
const basicIds = extractKeys(BASIC_SRC, 'BASIC_BLOCKS_REGISTRY');

console.log('Sections (' + sectionIds.length + '):');
sectionIds.forEach((id) => console.log('  -', id));
console.log('Basic blocks (' + basicIds.length + '):');
basicIds.forEach((id) => console.log('  -', id));

const sectionDuplicates = sectionIds.filter(
    (id, i) => sectionIds.indexOf(id) !== i,
);
const basicDuplicates = basicIds.filter(
    (id, i) => basicIds.indexOf(id) !== i,
);

if (sectionDuplicates.length) {
    console.error('!! Duplicate section IDs:', sectionDuplicates);
    process.exit(1);
}
if (basicDuplicates.length) {
    console.error('!! Duplicate basic block IDs:', basicDuplicates);
    process.exit(1);
}

const overlap = sectionIds.filter((id) => basicIds.includes(id));
if (overlap.length) {
    console.error('!! IDs that appear in BOTH registries:', overlap);
    process.exit(1);
}

const sectionPushCount = (CONFIG_SRC.match(/preDesignedIds/g) ?? []).length;
const basicPushCount = (CONFIG_SRC.match(/basicIds/g) ?? []).length;

console.log('preDesignedIds references:', sectionPushCount);
console.log('basicIds references:', basicPushCount);

// Sanity: each registry must contribute its keys to its category exactly once.
const preAssigned = (CONFIG_SRC.match(/components:\s*preDesignedIds/g) ?? []).length;
const basicAssigned = (CONFIG_SRC.match(/components:\s*basicIds/g) ?? []).length;
console.log('categories.pre-designed.components = preDesignedIds:', preAssigned);
console.log('categories.basics.components = basicIds:', basicAssigned);

if (preAssigned !== 1 || basicAssigned !== 1) {
    console.error('!! Categories must wire to preDesignedIds/basicIds exactly once');
    process.exit(1);
}

console.log('\n✓ All checks passed.');