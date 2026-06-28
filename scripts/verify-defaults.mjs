import fs from 'node:fs';

function extractIds(content) {
  // crude but effective: match id: 'xxx' inside BASIC_BLOCKS_REGISTRY / SECTION_REGISTRY
  const result = {};
  const text = fs.readFileSync(content, 'utf8');
  const lines = text.split('\n');
  let inRegistry = false;
  let inBlock = false;
  let curId = null;
  let curLabel = null;
  let curDefault = null;
  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!inRegistry) {
      if (/BASIC_BLOCKS_REGISTRY|SECTION_REGISTRY/.test(line)) inRegistry = true;
      continue;
    }
    if (!inBlock) {
      const idMatch = line.match(/^\s+id:\s*['"]([^'"]+)['"]/);
      const labelMatch = line.match(/^\s+label:\s*['"]([^'"]+)['"]/);
      if (idMatch) { curId = idMatch[1]; }
      if (labelMatch) { curLabel = labelMatch[1]; }
      if (/defaultContent:/.test(line)) {
        inBlock = true;
        curDefault = '';
        depth = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        // if depth is 0, the entire defaultContent is on this line; treat as one-liner
        if (depth <= 0) {
          // single line like: defaultContent: { foo: 'bar' }
          inBlock = false;
          result[curId] = { label: curLabel, content: line.split('defaultContent:')[1] || '' };
          curId = null;
        }
        continue;
      }
      if (/^\s*\},\s*$/.test(line) && curId) {
        // end of object — shouldn't normally hit before defaultContent
      }
    } else {
      curDefault += line + '\n';
      depth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      if (depth <= 0) {
        // we just closed defaultContent
        // check for image-bearing fields
        const hasImg = /(_media_id|media_id):/.test(curDefault);
        const imgs = (curDefault.match(/_media_id:\s*['"]([^'"]+)['"]/g) || [])
          .map(s => s.match(/['"]([^'"]+)['"]$/)[1]);
        result[curId] = { label: curLabel, content: curDefault, hasImage: hasImg, imageRefs: imgs };
        curId = null;
        curLabel = null;
        inBlock = false;
        curDefault = '';
        depth = 0;
      }
    }
  }
  return result;
}

function audit(file, registryName) {
  const result = extractIds(file);
  console.log(`\n=== ${registryName} (${file}) ===`);
  for (const [id, info] of Object.entries(result)) {
    const imgStr = info.imageRefs && info.imageRefs.length
      ? `→ ${info.imageRefs.join(', ')}`
      : '—';
    console.log(`  ${id.padEnd(16)} ${(info.label || '').padEnd(28)} images: ${imgStr}`);
  }
}

audit('resources/js/site/lib/basic-blocks-registry.ts', 'BASIC BLOCKS');
audit('resources/js/site/lib/template-registry.ts', 'SECTIONS');
