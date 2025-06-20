import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import path from 'node:path';

const round = (n, p = 1) => {
  const f = 10 ** p;
  return Math.round(n * f) / f;
};

(async () => {
  const doc = await pdfjs.getDocument(path.resolve('tests/fixtures/elisa/data/Profile.pdf')).promise;
  const lines = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent({ disableCombineTextItems: false });
    const byY = new Map();
    content.items.forEach((it) => {
      const text = it.str.replace(/\s+/g, ' ').trim();
      if (!text) return;
      const y = round(it.transform[5], 1);
      const fs = Math.hypot(it.transform[0], it.transform[1]);
      if (!byY.has(y)) byY.set(y, []);
      byY.get(y).push({ x: it.transform[4], text, fs });
    });
    [...byY.keys()].sort((a, b) => b - a).forEach((y) => {
      const items = byY.get(y).sort((a, b) => a.x - b.x);
      const lineText = items.map((i) => i.text).join(' ').trim();
      const fsMax = Math.max(...items.map((i) => i.fs));
      lines.push({ text: lineText, fs: fsMax });
    });
  }
  const idx = lines.findIndex((l) => l.text.includes('July 2024'));
  console.log('date line', idx, lines[idx]);
  const dateFont = lines[idx].fs;
  let tIdx = idx - 1;
  while (tIdx >= 0 && lines[tIdx].fs <= dateFont + 0.1) tIdx--;
  console.log('first title line', tIdx, lines[tIdx]);
  const titleFont = lines[tIdx].fs;
  const titleParts = [lines[tIdx].text];
  let prev = tIdx - 1;
  while (prev >= 0 && Math.abs(lines[prev].fs - titleFont) <= 0.2) {
    titleParts.unshift(lines[prev].text);
    prev--;
  }
  console.log('titleParts', titleParts);
})(); 