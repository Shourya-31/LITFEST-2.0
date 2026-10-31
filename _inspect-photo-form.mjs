import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const buf = fs.readFileSync(path.resolve('team-members.pdf'));
const previewDir = path.resolve('_pdf-preview');
fs.mkdirSync(previewDir, { recursive: true });

function findStartXref() {
  const tail = buf.subarray(buf.length - 4096).toString('latin1');
  return Number(tail.match(/startxref\s+(\d+)\s+%%EOF/)[1]);
}

function parseXref(offset) {
  const s = buf.subarray(offset, Math.min(buf.length, offset + 400000)).toString('latin1');
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
      const rm = lines[i].match(/^(\d{10})\s+(\d{5})\s+([nf])/);
      if (rm && rm[3] === 'n') table.set(start + k, Number(rm[1]));
    }
  }
  return table;
}

function readObject(offset) {
  const slice = buf.subarray(offset, Math.min(buf.length, offset + 8_000_000));
  const latin = slice.toString('latin1');
  const endobjIdx = latin.indexOf('endobj');
  const streamIdx = latin.indexOf('stream');
  if (streamIdx < 0 || streamIdx > endobjIdx) {
    return { dict: latin.slice(0, endobjIdx), stream: null };
  }
  let streamStart = streamIdx + 6;
  if (slice[streamStart] === 0x0d) streamStart++;
  if (slice[streamStart] === 0x0a) streamStart++;
  const dict = latin.slice(0, streamIdx);
  const lengthMatch = dict.match(/\/Length\s+(\d+)/);
  const stream = lengthMatch
    ? slice.subarray(streamStart, streamStart + Number(lengthMatch[1]))
    : slice.subarray(streamStart, latin.indexOf('endstream', streamIdx));
  return { dict, stream };
}

const xref = parseXref(findStartXref());

function dump(num) {
  const { dict, stream } = readObject(xref.get(num));
  console.log('\n====', num, '====');
  console.log(dict.slice(0, 1800));
  if (!stream) return dict;
  let decoded = stream;
  if (dict.includes('/FlateDecode') && !dict.includes('/DCTDecode')) {
    try {
      decoded = zlib.inflateSync(stream);
    } catch {}
  }
  if (dict.includes('/Subtype /Image')) {
    const w = dict.match(/\/Width\s+(\d+)/)?.[1];
    const h = dict.match(/\/Height\s+(\d+)/)?.[1];
    const filter = dict.match(/\/Filter\s+\/(\w+)/)?.[1];
    console.log('IMAGE', w, h, filter, 'bytes', stream.length);
    if (filter === 'DCTDecode') {
      fs.writeFileSync(path.join(previewDir, `form-img-${num}-${w}x${h}.jpg`), stream);
    }
  } else {
    console.log(decoded.toString('latin1').slice(0, 1500));
  }
  return dict;
}

const d = dump(1290);
const refs = [...d.matchAll(/\/X\d+\s+(\d+)\s+0\s+R/g)].map((m) => Number(m[1]));
console.log('nested refs', refs);
for (const r of refs) dump(r);
