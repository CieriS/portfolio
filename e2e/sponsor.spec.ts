import { expect, test } from '@playwright/test';
import { LOCALES } from '../lib/routes';
import { locales, shared } from './content';
import { gotoView, pathFor } from './helpers';

for (const locale of LOCALES) {
  test(`the contacts offer GitHub Sponsors, in ${locale}`, async ({ page }) => {
    await gotoView(page, locale, 'identity');
    const link = page.getByRole('link', { name: locales[locale].identity.sponsor });
    await expect(link).toHaveAttribute('href', shared.sponsor.url);
    await expect(link).toHaveAttribute('target', '_blank');
    // Not a profile of the person, so it does not claim to be one.
    await expect(link).not.toHaveAttribute('rel', /\bme\b/);
  });
}

test('the sponsor page stays out of the profiles in the JSON-LD', async ({ page }) => {
  await page.goto(pathFor('en', 'hero'));
  const raw = await page.locator('script[type="application/ld+json"]').textContent();
  expect(raw).not.toContain(shared.sponsor.url);
});
