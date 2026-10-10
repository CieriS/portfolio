import { describe, expect, it } from 'vitest';
import { getPortfolioBundle } from '@/lib/portfolio';
import { LOCALES } from '@/lib/routes';
import { cvCopy, fill } from './copy';

describe('fill', () => {
  it('replaces known placeholders, repeatedly, and leaves unknown ones visible', () => {
    expect(fill('{a} and {a}, not {b}', { a: 1 })).toBe('1 and 1, not {b}');
  });

  it('does not treat inherited object keys as values', () => {
    expect(fill('{constructor}', {})).toBe('{constructor}');
  });
});

describe.each(LOCALES)('CV copy in %s', (locale) => {
  const { email, pdf } = cvCopy(locale);
  const form = getPortfolioBundle().contents[locale].ui.cv;

  it('puts the link and the validity in the email', () => {
    for (const placeholder of ['{link}', '{hours}', '{name}']) expect(email.body).toContain(placeholder);
    expect(email.subject).toContain('{name}');
  });

  it('dates the PDF footer', () => {
    expect(pdf.generated).toContain('{date}');
    expect(pdf.generated).toContain('{site}');
  });

  it('tells the visitor how long the link works', () => {
    expect(form.sent).toContain('{hours}');
  });
});
