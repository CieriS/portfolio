import { expect, test } from '@playwright/test';
import { expectView, gotoView, localeOptionName, LOCALES, pathFor, switchLocale } from './helpers';

const TRIGGER = 'header button[aria-haspopup="listbox"]';

test('the header shows only the active language until the menu opens', async ({ page }) => {
  await gotoView(page, 'it', 'hero');
  const trigger = page.locator(TRIGGER);
  await expect(trigger).toContainText('IT');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('listbox')).toHaveCount(0);

  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  const options = page.getByRole('option');
  await expect(options).toHaveCount(LOCALES.length);
  for (const locale of LOCALES) {
    const option = page.getByRole('option', { name: localeOptionName(locale), exact: true });
    await expect(option).toHaveAttribute('lang', locale);
  }
});

test('every page advertises the other languages through hreflang alternates', async ({ page }) => {
  await gotoView(page, 'de', 'projects');
  for (const locale of LOCALES) {
    await expect(page.locator(`link[rel="alternate"][hreflang="${locale}"]`)).toHaveAttribute(
      'href',
      new RegExp(`${pathFor(locale, 'projects')}$`),
    );
  }
});

for (const target of LOCALES.filter((locale) => locale !== 'en')) {
  test(`switching to ${target} keeps the view and does not navigate`, async ({ page }) => {
    await gotoView(page, 'en', 'projects');
    await page.evaluate(() => {
      (window as unknown as { __noReload?: boolean }).__noReload = true;
    });

    await switchLocale(page, target);

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
  await page.locator(TRIGGER).click();
  await expect(page.getByRole('option', { name: localeOptionName('it'), exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('option', { name: localeOptionName('en'), exact: true })).toHaveAttribute('aria-selected', 'false');
});

test('the menu works from the keyboard and returns focus to the trigger', async ({ page }) => {
  await gotoView(page, 'en', 'projects');
  const trigger = page.locator(TRIGGER);
  await trigger.focus();

  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('option', { name: localeOptionName('en'), exact: true })).toBeFocused();

  // Inside the menu the arrows move the highlight and must not also change the view.
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('option', { name: localeOptionName('it'), exact: true })).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.getByRole('option', { name: localeOptionName('de'), exact: true })).toBeFocused();

  await page.keyboard.press('Enter');
  await expectView(page, 'de', 'projects');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('Escape and an outside click close the menu without switching', async ({ page }) => {
  await gotoView(page, 'en', 'hero');
  const trigger = page.locator(TRIGGER);

  await trigger.click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await trigger.click();
  await page.locator('main').click({ position: { x: 10, y: 10 } });
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('going back across a language switch realigns the URL', async ({ page }) => {
  await gotoView(page, 'en', 'hero');
  await page.keyboard.press('4');
  await expectView(page, 'en', 'projects');

  await switchLocale(page, 'fr');
  await expectView(page, 'fr', 'projects');

  // The switch used replaceState, so going back lands on the entry before it — written
  // as `/en`, while the app is now French. The popstate handler has to realign the URL
  // to the current language instead of leaving a locale the page no longer renders.
  await page.goBack();
  await expectView(page, 'fr', 'hero');
  expect(new URL(page.url()).pathname).toBe(pathFor('fr', 'hero'));
});
