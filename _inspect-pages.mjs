import fs from 'node:fs';
import path from 'node:path';

const pdfPath = path.resolve('team-members.pdf');
const buf = fs.readFileSync(pdfPath);

function findStartXref() {
  const tail = buf.subarray(buf.length - 4096).toString('latin1');
  const m = tail.match(/startxref\s+(\d+)\s+%%EOF/);
  if (!m) throw new Error('no startxref');
  return Number(m[1]);
}

function parseXref(offset) {
  const s = buf.subarray(offset, Math.min(buf.length, offset + 400000)).toString('latin1');
  if (!s.startsWith('xref')) throw new Error('not xref');
  const table = new Map();
  const lines = s.split(/\r?\n/);
  let i = 1;
  while (i < lines.length) {
    const header = lines[i].trim();
    if (header.startsWith('trailer')) break;
    const hm = header.match(/^(\d+)\s+(\d+)$/);
    if (!hm) {
      i++;
      continue;
    }
    const start = Number(hm[1]);
    const count = Number(hm[2]);
    i++;
    for (let k = 0; k < count; k++, i++) {
      const row = lines[i];
      const rm = row.match(/^(\d{10})\s+(\d{5})\s+([nf])/);
      if (!rm) throw new Error('bad xref row');
      if (rm[3] === 'n') table.set(start + k, Number(rm[1]));
    }
  }
  return table;
}

function readDict(offset, maxLen = 8000) {
  const slice = buf.subarray(offset, Math.min(buf.length, offset + maxLen));
  return slice.toString('latin1');
}

const xref = parseXref(findStartXref());
let pageCount = 0;
for (const [obj, off] of xref) {
  const head = readDict(off, 2500);
  if (!head.includes('/Type /Page') || head.includes('/Type /Pages')) continue;
  pageCount++;
  if (pageCount <= 3 || pageCount === 10) {
    console.log('\n=== PAGE OBJ', obj, 'n=', pageCount, '===');
    console.log(head.slice(0, 1800));
  }
}
console.log('\npage objects found', pageCount);
