// Audit both registries: every block must have populated defaultContent.

import { readFileSync } from 'node:fs';

function auditRegistry(file, registryName) {
    const src = readFileSync(file, 'utf8');

    // Find the registry declaration.
    const declRe = new RegExp(`export const ${registryName}[\\s\\S]+?^};`, 'm');
    const block = src.match(declRe)?.[0];

    if (!block) {
        console.error(`Could not find ${registryName} in ${file}`);
        process.exit(1);
    }

    const entryRe = /^ {4}([a-z][a-z0-9-]*|\'[a-z][a-z0-9-]*\'|\"[a-z][a-z0-9-]*\"):\s*\{/gm;
    const entries = [...block.matchAll(entryRe)].map((m) => ({
        key: m[1].replace(/['"]/g, ''),
        index: m.index,
    }));

    console.log(`\n=== ${registryName} (${entries.length} entries) ===\n`);

    let allOk = true;

    for (let i = 0; i < entries.length; i++) {
        const start = entries[i].index;
        const end = i + 1 < entries.length ? entries[i + 1].index : block.length;
        const slice = block.slice(start, end);

        const labelMatch = slice.match(/label:\s*['"`]([^'"`]+)['"`]/);
        const label = labelMatch ? labelMatch[1] : '?';

        const dcOpenIdx = slice.indexOf('defaultContent:');

        if (dcOpenIdx === -1) {
            console.log(`  ✗ ${entries[i].key.padEnd(15)} ${label.padEnd(20)} MISSING`);
            allOk = false;
            continue;
        }

        const braceIdx = slice.indexOf('{', dcOpenIdx);

        if (braceIdx === -1) {
            console.log(`  ✗ ${entries[i].key.padEnd(15)} ${label.padEnd(20)} MISSING brace`);
            allOk = false;
            continue;
        }

        let depth = 0;
        let inStr = null;
        let dcEnd = -1;

        for (let j = braceIdx; j < slice.length; j++) {
            const c = slice[j];

            if (inStr) {
                if (c === '\\') {
 j += 1; continue; 
}

                if (c === inStr) {
inStr = null;
}

                continue;
            }

            if (c === '"' || c === "'" || c === '`') {
 inStr = c; continue; 
}

            if (c === '{') {
depth += 1;
} else if (c === '}') {
                depth -= 1;

                if (depth === 0) {
 dcEnd = j; break; 
}
            }
        }

        if (dcEnd === -1) {
            console.log(`  ✗ ${entries[i].key.padEnd(15)} ${label.padEnd(20)} UNCLOSED`);
            allOk = false;
            continue;
        }

        const dcBody = slice.slice(braceIdx + 1, dcEnd);
        const lines = dcBody.split('\n');
        const indents = lines
            .map((l) => l.match(/^(\s*)\S/))
            .filter(Boolean)
            .map((m) => m[1].length);

        let totalKeys = 0;
        let populatedKeys = 0;

        if (indents.length > 0) {
            const minIndent = Math.min(...indents);

            for (const line of lines) {
                const m = line.match(
                    new RegExp(`^\\s{${minIndent}}([a-zA-Z_][a-zA-Z0-9_]*)\\s*:`),
                );

                if (!m) {
continue;
}

                totalKeys += 1;
                const after = line.slice(m.index + m[0].length);
                const trimmed = after.trim().replace(/,$/, '').trim();

                if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
continue;
}

                populatedKeys += 1;
            }
        }

        const isPopulated = populatedKeys > 0;
        const flag = isPopulated ? '✓' : '✗';
        console.log(`  ${flag} ${entries[i].key.padEnd(15)} ${label.padEnd(20)} ${populatedKeys}/${totalKeys} keys`);

        if (!isPopulated) {
allOk = false;
}
    }

    return allOk;
}

const ok1 = auditRegistry(
    'resources/js/site/lib/basic-blocks-registry.ts',
    'BASIC_BLOCKS_REGISTRY',
);
const ok2 = auditRegistry(
    'resources/js/site/lib/template-registry.ts',
    'SECTION_REGISTRY',
);

console.log('\n' + (ok1 && ok2 ? '✓ All blocks have default content.' : '✗ Some are missing.'));
process.exit(ok1 && ok2 ? 0 : 1);