import { expect, test } from '@playwright/test';
import { expectView, gotoView, localeOptionName, LOCALES, pathFor, switchLocale, pressViewDigit } from './helpers';

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
  const last = LOCALES[LOCALES.length - 1]!;
  await expect(page.getByRole('option', { name: localeOptionName(last), exact: true })).toBeFocused();

  await page.keyboard.press('Enter');
  await expectView(page, last, 'projects');
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
  await pressViewDigit(page, 4);
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

// #115: popstate used to change the view first, so the store subscriber saw the other language's
// slug and pushed a new entry, which erased Forward.
test('Back then Forward across a language switch keeps every history entry', async ({ page }) => {
  await gotoView(page, 'en', 'hero');
  await pressViewDigit(page, 2);
  await expectView(page, 'en', 'identity');
  await switchLocale(page, 'it');
  await expectView(page, 'it', 'identity');
  await pressViewDigit(page, 3);
  await expectView(page, 'it', 'timeline');
  const length = await page.evaluate(() => history.length);

  await page.goBack();
  await expectView(page, 'it', 'identity');
  await page.goBack();
  await expectView(page, 'it', 'hero');
  expect(new URL(page.url()).pathname).toBe(pathFor('it', 'hero'));
  expect(await page.evaluate(() => history.length)).toBe(length);

  await page.goForward();
  await expectView(page, 'it', 'identity');
  await page.goForward();
  await expectView(page, 'it', 'timeline');
  expect(new URL(page.url()).pathname).toBe(pathFor('it', 'timeline'));
  expect(await page.evaluate(() => history.length)).toBe(length);
});

// #116: the switch rewrote the path without the fragment, so the named project closed.
test('a language switch keeps the project named in the address, with its panel open', async ({ page }) => {
  await page.goto(`${pathFor('en', 'projects')}#ariaer`);
  await page.waitForFunction(() => (document.querySelector('[data-theme-toggle]')?.textContent ?? '').trim().length > 0);
  await expect(page.getByRole('button', { name: /aria-er/ })).toHaveAttribute('aria-expanded', 'true');

  await switchLocale(page, 'it');
  await expectView(page, 'it', 'projects');
  const url = new URL(page.url());
  expect(url.pathname).toBe(pathFor('it', 'projects'));
  expect(url.hash).toBe('#ariaer');
  await expect(page.getByRole('button', { name: /aria-er/ })).toHaveAttribute('aria-expanded', 'true');
});

// #130: next-intl wrote NEXT_LOCALE on a plain visit whenever the address language differed from
// the browser's. Only an explicit choice may set it now.
test('a plain visit in another language than the browser sets no cookie', async ({ page, request }) => {
  const response = await request.get(pathFor('it', 'hero'), { headers: { 'accept-language': 'en-US,en;q=0.9' } });
  expect(response.status()).toBe(200);
  expect(response.headersArray().filter((header) => header.name.toLowerCase() === 'set-cookie')).toEqual([]);

  await gotoView(page, 'de', 'projects');
  expect(await page.context().cookies()).toEqual([]);
});

test('an explicit choice is stored as a cookie and remembered on the next visit to /', async ({ page }) => {
  await gotoView(page, 'en', 'hero');
  await switchLocale(page, 'fr');

  const cookie = (await page.context().cookies()).find((c) => c.name === 'NEXT_LOCALE');
  expect(cookie?.value).toBe('fr');
  // The suite runs over plain HTTP, so `Secure` is off here (unit test in lib/localeCookie.test.ts).
  expect(cookie?.sameSite).toBe('Lax');

  await page.goto('/');
  expect(new URL(page.url()).pathname).toBe(pathFor('fr', 'hero'));
});
