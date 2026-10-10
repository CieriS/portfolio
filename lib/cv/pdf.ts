import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from 'pdf-lib';
import type { CvDocument } from './document';

/**
 * Renders a `CvDocument` to an A4 PDF with the two standard Helvetica faces: no font file to
 * ship, nothing to fetch, a few kilobytes of output. Standard fonts only encode WinAnsi, so
 * every string goes through `toWinAnsi` first.
 */
const PAGE = { width: 595.28, height: 841.89 };
const MARGIN = 56;
const WIDTH = PAGE.width - 2 * MARGIN;
const INK = rgb(0.1, 0.1, 0.1);
const MUTED = rgb(0.42, 0.42, 0.42);

type Style = { size: number; font: 'regular' | 'bold'; color?: typeof INK; gap?: number };

export async function renderCvPdf(cv: CvDocument, title: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(toWinAnsi(title));
  pdf.setAuthor(toWinAnsi(cv.name));
  pdf.setSubject(toWinAnsi(cv.headline));
  pdf.setCreator(toWinAnsi(cv.footer));

  const fonts = { regular: await pdf.embedFont(StandardFonts.Helvetica), bold: await pdf.embedFont(StandardFonts.HelveticaBold) };
  let page: PDFPage = pdf.addPage([PAGE.width, PAGE.height]);
  let y = PAGE.height - MARGIN;

  const write = (text: string, style: Style) => {
    const font = fonts[style.font];
    const leading = style.size * 1.4;
    for (const line of wrap(toWinAnsi(text), font, style.size, WIDTH)) {
      if (y - leading < MARGIN) {
        page = pdf.addPage([PAGE.width, PAGE.height]);
        y = PAGE.height - MARGIN;
      }
      y -= leading;
      page.drawText(line, { x: MARGIN, y, size: style.size, font, color: style.color ?? INK });
    }
    y -= style.gap ?? 0;
  };

  write(cv.name, { size: 24, font: 'bold', gap: 2 });
  write(cv.headline, { size: 11, font: 'regular', gap: 6 });
  write(cv.contact.join('   ·   '), { size: 9, font: 'regular', color: MUTED, gap: 14 });
  write(cv.summary, { size: 10, font: 'regular', gap: 10 });

  for (const section of cv.sections) {
    y -= 8;
    write(section.title.toUpperCase(), { size: 9, font: 'bold', color: MUTED, gap: 4 });
    for (const entry of section.entries) {
      write(entry.heading, { size: 11, font: 'bold' });
      if (entry.meta) write(entry.meta, { size: 9, font: 'regular', color: MUTED, gap: 2 });
      if (entry.body) write(entry.body, { size: 10, font: 'regular', gap: 2 });
      if (entry.tags.length > 0) write(entry.tags.join(' · '), { size: 9, font: 'regular', color: MUTED });
      y -= 10;
    }
  }

  write(cv.footer, { size: 8, font: 'regular', color: MUTED });
  return pdf.save();
}

/** Greedy word wrap on measured widths. A single word wider than the line keeps a line of its own. */
export function wrap(text: string, font: Pick<PDFFont, 'widthOfTextAtSize'>, size: number, width: number): string[] {
  return text.split('\n').flatMap((paragraph) => {
    const lines: string[] = [];
    let line = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && font.widthOfTextAtSize(candidate, size) > width) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    return line ? [...lines, line] : lines;
  });
}

/** Characters above Latin-1 that WinAnsi (CP1252) still encodes. */
const WIN_ANSI_EXTRA = new Set('€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ');
const SUBSTITUTES: Record<string, string> = {
  '→': '->',
  '←': '<-',
  '↑': '^',
  '≤': '<=',
  '≥': '>=',
  '−': '-',
  ' ': ' ',
  ' ': ' ',
};

/** Keeps what Helvetica can encode, spells out a few symbols, and turns anything else into `?`. */
export function toWinAnsi(text: string): string {
  return Array.from(text, (char) => {
    if (char === '\n' || WIN_ANSI_EXTRA.has(char)) return char;
    if (Object.hasOwn(SUBSTITUTES, char)) return SUBSTITUTES[char];
    const code = char.codePointAt(0) ?? 0;
    return (code >= 0x20 && code < 0x7f) || (code >= 0xa0 && code <= 0xff) ? char : '?';
  }).join('');
}
