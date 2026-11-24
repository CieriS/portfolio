import { describe, expect, it } from 'vitest';
import { CASE_STUDY_IDS, LOCALES, VIEW_IDS } from '../routes';
import { FULL_TEXT_BUDGET_BYTES, FULL_TEXT_SEPARATOR, joinPages } from './fullText';
import { renderFullText, renderPage } from './render';

describe('llms-full.txt', () => {
  it.each(LOCALES)('%s is the page renderers in order, and nothing else', (locale) => {
    const expected = [
      ...VIEW_IDS.map((view) => renderPage({ locale, view })),
      ...CASE_STUDY_IDS.map((study) => renderPage({ locale, study })),
    ];
    expect(renderFullText(locale)).toBe(expected.join(FULL_TEXT_SEPARATOR));
  });

  it.each(LOCALES)('%s stays under the size budget and carries no e-mail or phone', (locale) => {
    const text = renderFullText(locale);
    expect(new TextEncoder().encode(text).length).toBeLessThan(FULL_TEXT_BUDGET_BYTES);
    expect(text).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/);
    expect(text).not.toMatch(/\+?\d[\d ()-]{7,}\d/);
  });

  it('joins with a rule between pages', () => {
    expect(joinPages(['a\n', 'b\n'])).toBe('a\n\n---\n\nb\n');
  });
});
