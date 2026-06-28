// Surgically remove before-after, countdown, stats, schedule from
// basic-blocks-registry.ts. They were atomic blocks historically but each
// one renders as a full-width composed widget — they belong in
// SECTION_REGISTRY under the "Bloques prediseñados" category.

import { readFileSync, writeFileSync } from 'node:fs';

const path = 'resources/js/site/lib/basic-blocks-registry.ts';
let src = readFileSync(path, 'utf8');

// Identify each entry by its leading "    <key>: {" line and the matching
// "    }," (or final "    }") that closes it. We work top-to-bottom so
// line offsets stay correct after each removal.
const targets = ['before-after', 'countdown', 'stats', 'schedule'];

for (const key of targets) {
    // Accept both `'key': {` and `key: {` forms.
    const headerRe = new RegExp(
        `^(\\s+)(?:\`${key}\`|'${key}'|"${key}"|${key}):\\s*\\{`,
        'm',
    );
    const headerMatch = src.match(headerRe);
    if (!headerMatch) {
        console.warn(`! Could not find entry "${key}"`);
        continue;
    }

    const startLine = src.slice(0, headerMatch.index).split('\n').length;
    const lines = src.split('\n');
    const startIdx = headerMatch.index;

    // Walk forward counting brace depth, starting at the `{` after the key.
    // We stop when depth returns to 0 — that's the matching `},` (or `}`).
    let depth = 0;
    let endIdx = -1;
    for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i];
        for (const ch of line) {
            if (ch === '{') depth += 1;
            else if (ch === '}') depth -= 1;
        }
        if (depth === 0) {
            endIdx = i;
            break;
        }
    }

    if (endIdx === -1) {
        console.warn(`! Could not find end of "${key}"`);
        continue;
    }

    const before = lines.slice(0, startLine - 1).join('\n');
    const after = lines.slice(endIdx + 1).join('\n');
    src = before + '\n' + after;

    console.log(
        `- Removed "${key}" (lines ${startLine}..${endIdx + 1}, ${endIdx - startLine + 1} lines)`,
    );
}

writeFileSync(path, src);
console.log('\n✓ Done. Verify with: node scripts/audit-puck-blocks.mjs');