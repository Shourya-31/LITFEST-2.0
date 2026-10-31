import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { createHash } from 'node:crypto';

const pdfPath = path.resolve('team-members.pdf');
const outDir = path.resolve('public/team-photos');
const previewDir = path.resolve('_pdf-preview');
const buf = fs.readFileSync(pdfPath);

function findStartXref() {
  const tail = buf.subarray(buf.length - 4096).toString('latin1');
  const m = tail.match(/startxref\s+(\d+)\s+%%EOF/);
  if (!m) throw new Error('no startxref');
  return Number(m[1]);
}

function parseXref(offset) {
  const s = buf.subarray(offset, Math.min(buf.length, offset + 400000)).toString('latin1');
  if (!s.startsWith('xref')) throw new Error('not xref at ' + offset);
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
      if (!rm) throw new Error('bad xref row: ' + JSON.stringify(row));
      if (rm[3] === 'n') table.set(start + k, Number(rm[1]));
    }
  }
  return table;
}

function readObjectRaw(offset) {
  const max = Math.min(buf.length, offset + 12_000_000);
  const slice = buf.subarray(offset, max);
  const latin = slice.toString('latin1');
  const streamIdx = latin.indexOf('stream');
  const endobjIdx = latin.indexOf('endobj');
  if (endobjIdx < 0) throw new Error('endobj not found at ' + offset);
  if (streamIdx < 0 || streamIdx > endobjIdx) {
    return { dictText: latin.slice(0, endobjIdx), stream: null };
  }
  let streamStart = streamIdx + 6;
  if (slice[streamStart] === 0x0d) streamStart++;
  if (slice[streamStart] === 0x0a) streamStart++;
  const dictText = latin.slice(0, streamIdx);
  const lengthMatch = dictText.match(/\/Length\s+(\d+)/);
  let stream;
  if (lengthMatch) {
    const len = Number(lengthMatch[1]);
    stream = slice.subarray(streamStart, streamStart + len);
  } else {
    const endstreamRel = latin.indexOf('endstream', streamIdx);
    stream = slice.subarray(streamStart, endstreamRel);
    if (stream[stream.length - 1] === 0x0a) stream = stream.subarray(0, stream.length - 1);
    if (stream[stream.length - 1] === 0x0d) stream = stream.subarray(0, stream.length - 1);
  }
  return { dictText, stream };
}

function parseName(dict, key) {
  const re = new RegExp(`/${key}\\s*/([A-Za-z0-9]+)`);
  const m = dict.match(re);
  return m ? m[1] : null;
}

function parseNum(dict, key) {
  const re = new RegExp(`/${key}\\s+(\\d+)`);
  const m = dict.match(re);
  return m ? Number(m[1]) : null;
}

function parseRef(dict, key) {
  const re = new RegExp(`/${key}\\s+(\\d+)\\s+(\\d+)\\s+R`);
  const m = dict.match(re);
  return m ? Number(m[1]) : null;
}

function crc32(data) {
  let c = ~0;
  for (let i = 0; i < data.length; i++) {
    c ^= data[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const src = y * width * 4;
    const dst = y * (width * 4 + 1);
    raw[dst] = 0;
    rgba.copy(raw, dst + 1, src, src + width * 4);
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function decodeImage(dict, stream, xref) {
  const width = parseNum(dict, 'Width');
  const height = parseNum(dict, 'Height');
  const bpc = parseNum(dict, 'BitsPerComponent') || 8;
  const filter = parseName(dict, 'Filter');
  const colorSpace = dict.includes('/DeviceGray')
    ? 'gray'
    : dict.includes('/DeviceRGB') || dict.includes('/ICCBased')
      ? 'rgb'
      : dict.includes('/DeviceCMYK')
        ? 'cmyk'
        : 'unknown';
  if (!width || !height || !stream) return null;
  let pixels;
  if (filter === 'FlateDecode') {
    pixels = zlib.inflateSync(stream);
  } else if (filter === 'DCTDecode') {
    return { kind: 'jpeg', width, height, data: stream, dict };
  } else {
    return { kind: 'raw', width, height, filter, data: stream, dict };
  }
  const smaskRef = parseRef(dict, 'SMask');
  let alpha = null;
  if (smaskRef && xref.has(smaskRef)) {
    const sm = readObjectRaw(xref.get(smaskRef));
    const smFilter = parseName(sm.dictText, 'Filter');
    if (smFilter === 'FlateDecode') alpha = zlib.inflateSync(sm.stream);
    else if (sm.stream) alpha = sm.stream;
  }
  const expectedRgb = width * height * 3;
  const expectedGray = width * height;
  let rgba;
  if (colorSpace === 'gray' || pixels.length === expectedGray) {
    rgba = Buffer.alloc(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      const g = pixels[i];
      rgba[i * 4] = g;
      rgba[i * 4 + 1] = g;
      rgba[i * 4 + 2] = g;
      rgba[i * 4 + 3] = alpha ? alpha[i] : 255;
    }
  } else if (pixels.length >= expectedRgb) {
    rgba = Buffer.alloc(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      rgba[i * 4] = pixels[i * 3];
      rgba[i * 4 + 1] = pixels[i * 3 + 1];
      rgba[i * 4 + 2] = pixels[i * 3 + 2];
      rgba[i * 4 + 3] = alpha ? alpha[i] : 255;
    }
  } else {
    return { kind: 'mismatch', width, height, pixelLen: pixels.length, expectedRgb, expectedGray, dict };
  }
  return { kind: 'png', width, height, rgba, dict, hasAlpha: Boolean(alpha) };
}

const xref = parseXref(findStartXref());
const dims = {};
const images = [];
for (const [obj, off] of xref) {
  const peek = buf.subarray(off, Math.min(buf.length, off + 600)).toString('latin1');
  if (!peek.includes('/Subtype /Image') && !peek.includes('/Subtype/Image')) continue;
  const { dictText, stream } = readObjectRaw(off);
  const decoded = decodeImage(dictText, stream, xref);
  if (!decoded) continue;
  const key = `${decoded.kind} ${decoded.width}x${decoded.height}${decoded.hasAlpha ? ' A' : ''}`;
  dims[key] = (dims[key] || 0) + 1;
  images.push({ obj, ...decoded });
}

console.log('decoded images', images.length);
console.log(
  Object.entries(dims)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
);

fs.mkdirSync(previewDir, { recursive: true });
fs.mkdirSync(outDir, { recursive: true });

function hashImage(im) {
  if (im.kind === 'jpeg') return createHash('sha1').update(im.data).digest('hex');
  if (im.kind === 'png') return createHash('sha1').update(im.rgba).digest('hex');
  return createHash('sha1').update(im.data || Buffer.alloc(0)).digest('hex');
}

const uniqueByHash = new Map();
for (const im of images) {
  const hash = hashImage(im);
  if (!uniqueByHash.has(hash)) uniqueByHash.set(hash, im);
}
console.log('unique images overall', uniqueByHash.size);

const uniqueJpeg = [...uniqueByHash.values()].filter((im) => im.kind === 'jpeg');
console.log(
  'unique jpegs',
  uniqueJpeg.map((im) => `${im.width}x${im.height} obj${im.obj}`)
);

let n = 0;
for (const im of uniqueByHash.values()) {
  if (im.kind === 'jpeg' && !(im.width === 295 && im.height === 524)) {
    n++;
    fs.writeFileSync(path.join(previewDir, `jpeg-${String(n).padStart(3, '0')}-${im.width}x${im.height}-obj${im.obj}.jpg`), im.data);
  }
}
console.log('wrote non-bg unique jpegs', n);

const alpha383 = images.filter((im) => im.kind === 'png' && im.width === 383 && im.height === 370 && im.hasAlpha);
const hashes383 = new Set(alpha383.map((im) => hashImage(im)));
console.log('383x370 A count', alpha383.length, 'unique hashes', hashes383.size);

const alpha360 = images.filter((im) => im.kind === 'png' && im.hasAlpha && (im.width !== 109));
const byDim = {};
for (const im of alpha360) {
  const k = `${im.width}x${im.height}`;
  byDim[k] = (byDim[k] || 0) + 1;
}
console.log('alpha images not 109-wide', byDim);

// Save a few 383x370 alpha images by object number spread
for (const idx of [0, 1, 2, 20, 40, 60, 84]) {
  const im = alpha383[idx];
  if (!im) continue;
  const png = encodePng(im.width, im.height, im.rgba);
  fs.writeFileSync(path.join(previewDir, `alpha383-${idx}-obj${im.obj}.png`), png);
}
