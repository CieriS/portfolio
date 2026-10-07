import { expect, test } from '@playwright/test';
import { ALL_PAGES, LOCALES, navLabel, pathFor } from './helpers';

test.describe('every locale × view URL', () => {
  for (const { locale, view, path } of ALL_PAGES) {
    test(`${path} is served with its own content and metadata`, async ({ page, baseURL }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);

      await expect(page.locator('html')).toHaveAttribute('lang', locale);

      // One h1 per URL is the rule the whole heading structure rests on.
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).not.toBeEmpty();

      await expect(page.locator('main > section')).toHaveAttribute('aria-label', navLabel(locale, view));

      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${baseURL}${path}`);

      // hreflang: one entry per locale plus x-default.
      for (const other of LOCALES) {
        await expect(page.locator(`link[rel="alternate"][hreflang="${other}"]`)).toHaveAttribute(
          'href',
          `${baseURL}${pathFor(other, view)}`,
        );
      }
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
    });
  }
});

test('an unknown slug returns a localized, non-indexable 404', async ({ page }) => {
  const response = await page.goto('/it/questa-vista-non-esiste');
  expect(response?.status()).toBe(404);
  await expect(page.locator('html')).toHaveAttribute('lang', 'it');

  // Only Next's own `noindex` for the not-found boundary: `index, follow` is set per page,
  // not in the layout, so a 404 never carries two contradicting robots tags.
  const directives = await page
    .locator('meta[name="robots"]')
    .evaluateAll((tags) => tags.map((tag) => tag.getAttribute('content')));
  expect(directives).toEqual(['noindex']);
});

test('a slug from another locale does not resolve', async ({ page }) => {
  // /en/sistemi is the Italian slug under the English prefix: it must not be a page.
  const response = await page.goto('/en/sistemi');
  expect(response?.status()).toBe(404);
});
