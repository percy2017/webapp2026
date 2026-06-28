import { readFileSync } from 'node:fs';

const src = readFileSync('resources/js/site/lib/basic-blocks-registry.ts', 'utf8');
const start = src.indexOf('heading: {');
const end = src.indexOf('paragraph: {');
const slice = src.slice(start, end);
console.log('--- heading entry ---');
console.log(slice.slice(0, 800));
console.log('---');

const dcMatch = slice.match(/defaultContent:\s*([^\n]+)/);
console.log('dcMatch[1]:', dcMatch ? JSON.stringify(dcMatch[1]) : 'NO MATCH');