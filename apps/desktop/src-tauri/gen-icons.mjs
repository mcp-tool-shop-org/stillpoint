#!/usr/bin/env node
/**
 * Generate placeholder Tauri icon files.
 * Reuses the same PNG generation logic as the MSIX asset generator.
 */
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = join(__dirname, "icons");

const ICONS = [
  { name: "32x32.png", w: 32, h: 32 },
  { name: "128x128.png", w: 128, h: 128 },
  { name: "128x128@2x.png", w: 256, h: 256 },
  { name: "icon.png", w: 512, h: 512 },
];

const BG_R = 0x1a, BG_G = 0x1a, BG_B = 0x2e;
const FG_R = 0xe9, FG_G = 0x45, FG_B = 0x60;

function createPng(w, h) {
  const pixels = Buffer.alloc(h * (1 + w * 3));
  for (let y = 0; y < h; y++) {
    const rowOff = y * (1 + w * 3);
    pixels[rowOff] = 0;
    for (let x = 0; x < w; x++) {
      const px = rowOff + 1 + x * 3;
      const cx = w / 2, cy = h / 2;
      const r = Math.min(w, h) * 0.3;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist < r) {
        pixels[px] = FG_R; pixels[px + 1] = FG_G; pixels[px + 2] = FG_B;
      } else {
        pixels[px] = BG_R; pixels[px + 1] = BG_G; pixels[px + 2] = BG_B;
      }
    }
  }
  const deflated = deflateStored(pixels);
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([sig, makeChunk("IHDR", ihdr), makeChunk("IDAT", deflated), makeChunk("IEND", Buffer.alloc(0))]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const typeB = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([typeB, data])), 0);
  return Buffer.concat([len, typeB, data, crc]);
}

function deflateStored(data) {
  const blocks = []; let off = 0;
  while (off < data.length) {
    const sz = Math.min(data.length - off, 65535);
    const hdr = Buffer.alloc(5);
    hdr[0] = off + sz >= data.length ? 0x01 : 0x00;
    hdr.writeUInt16LE(sz, 1); hdr.writeUInt16LE(sz ^ 0xffff, 3);
    blocks.push(hdr, data.subarray(off, off + sz));
    off += sz;
  }
  const adler = adler32(data);
  const ab = Buffer.alloc(4); ab.writeUInt32BE(adler, 0);
  return Buffer.concat([Buffer.from([0x78, 0x01]), ...blocks, ab]);
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) { c ^= buf[i]; for (let j = 0; j < 8; j++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0); }
  return (c ^ 0xffffffff) >>> 0;
}

function adler32(buf) {
  let a = 1, b = 0;
  for (let i = 0; i < buf.length; i++) { a = (a + buf[i]) % 65521; b = (b + a) % 65521; }
  return ((b << 16) | a) >>> 0;
}

// Generate ICO from 32x32 PNG
function createIco(png32) {
  // ICO = header(6) + entry(16) + PNG data
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);  // reserved
  header.writeUInt16LE(1, 2);  // ICO type
  header.writeUInt16LE(1, 4);  // 1 image

  const entry = Buffer.alloc(16);
  entry[0] = 32;   // width
  entry[1] = 32;   // height
  entry[2] = 0;    // no palette
  entry[3] = 0;    // reserved
  entry.writeUInt16LE(1, 4);   // color planes
  entry.writeUInt16LE(32, 6);  // bits per pixel
  entry.writeUInt32LE(png32.length, 8);  // size
  entry.writeUInt32LE(22, 12); // offset (6+16)

  return Buffer.concat([header, entry, png32]);
}

mkdirSync(ICONS_DIR, { recursive: true });

let png32;
for (const icon of ICONS) {
  const png = createPng(icon.w, icon.h);
  writeFileSync(join(ICONS_DIR, icon.name), png);
  if (icon.w === 32) png32 = png;
  console.log(`  ${icon.name} (${icon.w}x${icon.h})`);
}

// ICO file
const ico = createIco(png32);
writeFileSync(join(ICONS_DIR, "icon.ico"), ico);
console.log("  icon.ico (32x32)");

console.log(`\nGenerated ${ICONS.length + 1} icons in ${ICONS_DIR}`);
