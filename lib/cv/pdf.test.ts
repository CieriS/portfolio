import { PDFDocument, StandardFonts } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import type { CvDocument } from './document';
import { renderCvPdf, toWinAnsi, wrap } from './pdf';

const cv: CvDocument = {
  name: 'Ada Example',
  headline: 'Software Developer — Data Engineering',
  contact: ['ada@example.com', 'Bologna, IT'],
  summary: 'Università, perché, Größe, señal → ok',
  sections: [
    { title: 'Experience', entries: [{ heading: 'Developer', meta: 'Acme · 01/2020 – present', body: 'Body', tags: ['Rust'] }] },
  ],
  footer: 'Generated on 10/10/2026 from example.com',
};

describe('renderCvPdf', () => {
  it('produces a readable PDF with title and author set', async () => {
    const bytes = await renderCvPdf(cv, 'Ada Example — CV');
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe('%PDF-');

    const parsed = await PDFDocument.load(bytes);
    expect(parsed.getPageCount()).toBe(1);
    expect(parsed.getTitle()).toBe('Ada Example — CV');
    expect(parsed.getAuthor()).toBe('Ada Example');
  });

  it('flows onto new pages instead of running off the bottom', async () => {
    const entries = Array.from({ length: 40 }, (_, i) => ({
      heading: `Entry ${i}`,
      meta: 'meta',
      body: 'word '.repeat(80),
      tags: ['A'],
    }));
    const bytes = await renderCvPdf({ ...cv, sections: [{ title: 'Long', entries }] }, 'Long');
    expect((await PDFDocument.load(bytes)).getPageCount()).toBeGreaterThan(1);
  });

  it('survives characters the standard fonts cannot encode', async () => {
    await expect(renderCvPdf({ ...cv, summary: 'emoji 🚀, CJK 漢字, arrows ↑ ←' }, 'x')).resolves.toBeInstanceOf(Uint8Array);
  });
});

describe('toWinAnsi', () => {
  it('keeps Latin-1 and the CP1252 punctuation the copy uses', () => {
    expect(toWinAnsi('àèéìòù ÄÖÜß çñ — – · … ’ € “”')).toBe('àèéìòù ÄÖÜß çñ — – · … ’ € “”');
  });

  it('spells out arrows and comparisons, maps thin spaces, and marks the rest', () => {
    expect(toWinAnsi('a → b ≤ c d 🚀 漢')).toBe('a -> b <= c d ? ?');
  });

  it('keeps line breaks but drops other control characters', () => {
    expect(toWinAnsi('a\nb\tc\u0000')).toBe('a\nb?c?');
  });
});

describe('wrap', async () => {
  const font = await (await PDFDocument.create()).embedFont(StandardFonts.Helvetica);

  it('keeps every line within the width and loses no word', () => {
    const text = 'The quick brown fox jumps over the lazy dog '.repeat(10).trim();
    const lines = wrap(text, font, 10, 200);
    expect(lines.length).toBeGreaterThan(1);
    for (const line of lines) expect(font.widthOfTextAtSize(line, 10)).toBeLessThanOrEqual(200);
    expect(lines.join(' ')).toBe(text);
  });

  it('gives an overlong word a line of its own', () => {
    expect(wrap(`a ${'x'.repeat(200)} b`, font, 10, 100)).toEqual(['a', 'x'.repeat(200), 'b']);
  });

  it('honours explicit line breaks and collapses runs of spaces', () => {
    expect(wrap('one  two\nthree', font, 10, 500)).toEqual(['one two', 'three']);
    expect(wrap('', font, 10, 500)).toEqual([]);
  });
});
