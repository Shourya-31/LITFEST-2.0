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

function info(num) {
  const { dict, stream } = readObject(xref.get(num));
  const w = dict.match(/\/Width\s+(\d+)/);
  const h = dict.match(/\/Height\s+(\d+)/);
  const sub = dict.match(/\/Subtype\s+\/(\w+)/);
  const filter = dict.match(/\/Filter\s+\/(\w+)/);
  return { num, sub: sub && sub[1], w: w && w[1], h: h && h[1], filter: filter && filter[1], dict, stream };
}

function saveJpeg(num, name) {
  const im = info(num);
  if (im.filter === 'DCTDecode') {
    fs.writeFileSync(path.join(previewDir, name + '.jpg'), im.stream);
    console.log('saved jpeg', name, im.w, 'x', im.h);
  } else {
    console.log('not jpeg', name, im);
  }
}

saveJpeg(2738, 'page1-x4-2738');

for (const num of [1288, 1289, 1290, 1291, 1292, 1293, 1294, 1295, 1296]) {
  const im = info(num);
  console.log('page2', num, im.sub, im.w, 'x', im.h, im.filter);
  if (im.sub === 'Image' && im.filter === 'DCTDecode') {
    fs.writeFileSync(path.join(previewDir, `page2-obj${num}-${im.w}x${im.h}.jpg`), im.stream);
  }
}
