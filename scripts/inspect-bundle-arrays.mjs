import fs from 'node:fs';
import path from 'node:path';

const dir = 'public/build/assets';

// Inspect the basic-blocks-registry bundle: count distinct block IDs
const regFile = fs.readdirSync(dir).find((f) => f.startsWith('basic-blocks-registry-') && f.endsWith('.js'));
const regCode = fs.readFileSync(path.join(dir, regFile), 'utf8');

console.log('Inspecting:', regFile);

// Find every `id:` property in object literals
const idMatches = [...regCode.matchAll(/id:([a-z0-9-]+)/g)].map((m) => m[1]);
const counts = {};
idMatches.forEach((id) => { counts[id] = (counts[id] || 0) + 1; });
const dup = Object.entries(counts).filter(([, c]) => c > 1);
console.log('Total id: references:', idMatches.length);
console.log('Distinct ids:', Object.keys(counts).length);
console.log('Duplicates:', dup.length === 0 ? 'NONE ✓' : dup);

// Inspect the edit bundle's category structure
const editFile = fs.readdirSync(dir).filter((f) => f.startsWith('edit-') && f.endsWith('.js'))
    .map((f) => ({ f, size: fs.statSync(path.join(dir, f)).size }))
    .sort((a, b) => b.size - a.size)[0].f;
const editCode = fs.readFileSync(path.join(dir, editFile), 'utf8');

console.log('\nInspecting:', editFile);
const catIdx = editCode.indexOf('categories:');
console.log('Categories block:');
console.log(editCode.slice(catIdx, catIdx + 350));

// Find Object.keys(te) and Object.keys(re) — these are SECTION_REGISTRY and BASIC_BLOCKS_REGISTRY
const okMatches = [...editCode.matchAll(/Object\.keys\(([a-z]+)\)/g)].map((m) => m[1]);
console.log('\nObject.keys args:', [...new Set(okMatches)]);