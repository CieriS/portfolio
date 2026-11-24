import { expect, test, type Page } from '@playwright/test';
import { ALL_PAGES, CASE_STUDY_PAGES, gotoView, LOCALES } from './helpers';

/** Rendered text nodes whose computed font size is below `min` px, as "size: text". */
async function textBelow(page: Page, min: number): Promise<string[]> {
  return page.evaluate((limit) => {
    const small: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.textContent?.trim();
      const parent = node.parentElement;
      if (!text || !parent || parent.closest('[aria-hidden="true"], .sr-only, script, style, noscript')) continue;
      const style = getComputedStyle(parent);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      const size = parseFloat(style.fontSize);
      if (size < limit) small.push(`${size}px: ${text.slice(0, 40)}`);
    }
    return small;
  }, min);
}

test.describe('no text below 12 px on a phone (#97)', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  for (const { path } of [...ALL_PAGES.filter((p) => p.locale === 'en'), ...CASE_STUDY_PAGES.filter((p) => p.locale === 'en')]) {
    test(path, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      expect(await textBelow(page, 12)).toEqual([]);
    });
  }
});

for (const width of [375, 768, 1440]) {
  test.describe(`timeline phase labels stay inside the viewport at ${width} px (#97)`, () => {
    test.use({ viewport: { width, height: 1000 } });

    for (const locale of LOCALES) {
      test(locale, async ({ page }) => {
        await gotoView(page, locale, 'timeline');
        const overflow = await page.evaluate(() =>
          [...document.querySelectorAll('main .whitespace-nowrap')]
            .map((el) => el.getBoundingClientRect())
            .filter((box) => box.width > 0 && box.right > document.documentElement.clientWidth + 0.5)
            .map((box) => box.right),
        );
        expect(overflow).toEqual([]);
      });
    }
  });
}
