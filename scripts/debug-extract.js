import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import path from 'node:path';
import fs from 'node:fs';

async function main() {
  const PDF_PATH = process.argv[2];
  if (!PDF_PATH) {
    console.error('Usage: node scripts/debug-extract.js <pdf>');
    process.exit(1);
  }
  const abs = path.resolve(PDF_PATH);
  const doc = await pdfjs.getDocument(abs).promise;
  const lines = [];
  const round = (n, p = 1) => {
    const f = 10 ** p;
    return Math.round(n * f) / f;
  };
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent({ disableCombineTextItems: false });
    const byY = new Map();
    content.items.forEach((it) => {
      const text = it.str.replace(/\s+/g, ' ').trim();
      if (!text) return;
      const y = round(it.transform[5], 1);
      const x = Math.round(it.transform[4]);
      const fs = Math.hypot(it.transform[0], it.transform[1]);
      if (!byY.has(y)) byY.set(y, []);
      byY.get(y).push({ x, text, fs });
    });
    const ys = Array.from(byY.keys()).sort((a, b) => b - a);
    ys.forEach((y) => {
      const items = byY.get(y).sort((a, b) => a.x - b.x);
      const line = items.map((i) => i.text).join(' ').trim();
      const fsMax = Math.max(...items.map((i) => i.fs));
      lines.push({ page: p, y, fs: fsMax, line });
    });
  }
  lines.forEach((l, i) => {
    console.log(`${i}. [p${l.page}] fs=${l.fs.toFixed(1)} y=${l.y}: ${l.line}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}); 