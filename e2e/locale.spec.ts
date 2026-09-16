import { expect, test } from '@playwright/test';
import { expectView, gotoView, LOCALES, localeSwitchLabel, pathFor } from './helpers';

test('the switcher offers every locale', async ({ page }) => {
  await gotoView(page, 'en', 'hero');
  const links = page.locator('header nav a');
  await expect(links).toHaveCount(LOCALES.length);
  for (const locale of LOCALES) {
    await expect(page.locator(`header nav a[hreflang="${locale}"]`)).toHaveAttribute('href', pathFor(locale, 'hero'));
  }
});

for (const target of LOCALES.filter((locale) => locale !== 'en')) {
  test(`switching to ${target} keeps the view and does not navigate`, async ({ page }) => {
    await gotoView(page, 'en', 'projects');
    await page.evaluate(() => {
      (window as unknown as { __noReload?: boolean }).__noReload = true;
    });

    await page.getByRole('link', { name: localeSwitchLabel(target), exact: true }).click();

    await expectView(page, target, 'projects');
    expect(new URL(page.url()).pathname).toBe(pathFor(target, 'projects'));
    await expect(page.locator('html')).toHaveAttribute('lang', target);

    // No navigation happened: the sentinel and therefore the canvas survived.
    expect(await page.evaluate(() => (window as unknown as { __noReload?: boolean }).__noReload === true)).toBe(true);

    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === 'NEXT_LOCALE')?.value).toBe(target);
  });
}

test('the active locale is marked for assistive tech', async ({ page }) => {
  await gotoView(page, 'it', 'hero');
  await expect(page.locator('header nav a[hreflang="it"]')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('header nav a[hreflang="en"]')).not.toHaveAttribute('aria-current', 'page');
});

test('going back across a language switch realigns the URL', async ({ page }) => {
  await gotoView(page, 'en', 'hero');
  await page.keyboard.press('4');
  await expectView(page, 'en', 'projects');

  await page.getByRole('link', { name: localeSwitchLabel('fr'), exact: true }).click();
  await expectView(page, 'fr', 'projects');

  // The switch used replaceState, so going back lands on the entry before it — written
  // as `/en`, while the app is now French. The popstate handler has to realign the URL
  // to the current language instead of leaving a locale the page no longer renders.
  await page.goBack();
  await expectView(page, 'fr', 'hero');
  expect(new URL(page.url()).pathname).toBe(pathFor('fr', 'hero'));
});
