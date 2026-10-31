import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const buf = fs.readFileSync(path.resolve('team-members.pdf'));

function findStartXref() {
  const tail = buf.subarray(buf.length - 4096).toString('latin1');
  const m = tail.match(/startxref\s+(\d+)\s+%%EOF/);
  return Number(m[1]);
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
const { dict, stream } = readObject(xref.get(2738));
console.log(dict.slice(0, 1500));
console.log('stream len', stream && stream.length);

// Also inspect page 2 form 106
const p2 = readObject(xref.get(106));
console.log('\n==== PAGE2 FORM 106 dict ====');
console.log(p2.dict.slice(0, 2000));
let decoded = zlib.inflateSync(p2.stream);
console.log(decoded.toString('latin1').slice(0, 2000));
// extract xobject refs
const refs = [...p2.dict.matchAll(/\/X\d+\s+(\d+)\s+0\s+R/g)];
console.log('xobject refs', refs.map((r) => r[0]));
