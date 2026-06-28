import ts from 'typescript';
import fs from 'node:fs';

const src = fs.readFileSync('resources/js/site/lib/puck-config.tsx', 'utf8');
// Strip imports and type exports — they reference modules that don't resolve
const stubbed = src
  .replace(/^import .*$/gm, '')
  .replace(/^export type .*$/gm, '')
  .replace(/^export interface .*$/gm, '');

const out = ts.transpileModule(stubbed, {
  compilerOptions: { module: 'commonjs', target: 'es2022' },
}).outputText;

// Provide stubs for the imported registries
const stubRegistries = `
  const SECTION_REGISTRY = ${JSON.stringify(Object.fromEntries(Array.from({length: 9}, (_, i) => ['sec' + i, {}])))};
  const BASIC_BLOCKS_REGISTRY = ${JSON.stringify(Object.fromEntries(Array.from({length: 13}, (_, i) => ['blk' + i, {}])))};
`;

// Strip the `import` lines that reference the registries
const cleaned = out
  .replace(/Object\.entries\(SECTION_REGISTRY\)/g, 'Object.entries(SECTION_REGISTRY||{})')
  .replace(/Object\.entries\(BASIC_BLOCKS_REGISTRY\)/g, 'Object.entries(BASIC_BLOCKS_REGISTRY||{})');

const wrapper = `
  ${stubRegistries}
  ${cleaned}
`;

const mod = { exports: {} };
new Function('exports', 'module', wrapper)(mod.exports, mod);

try {
  const cfg = mod.exports.buildPuckConfig({ theme: {} });
  console.log('=== Puck categories ===');
  for (const [catId, cat] of Object.entries(cfg.categories)) {
    console.log('  ' + catId + ' (' + cat.title + ') — ' + cat.components.length + ' components:');
    cat.components.forEach(c => console.log('    - ' + c));
  }
  console.log('\n=== All components (' + Object.keys(cfg.components).length + ') ===');
  Object.keys(cfg.components).forEach(c => console.log('  - ' + c));
} catch (e) {
  console.error('Error:', e.message);
  console.error(e.stack);
}
