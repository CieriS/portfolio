import { expect, test } from '@playwright/test';
import { locales } from './content';
import { expectView, gotoView, LOCALES, navLinkName, pathFor, VIEWS, pressViewDigit } from './helpers';

/** Marks the document so a full page reload can be told apart from a client-side swap. */
async function markNoReload(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    (window as unknown as { __noReload?: boolean }).__noReload = true;
  });
}
const stillSamePage = (page: import('@playwright/test').Page) =>
  page.evaluate(() => (window as unknown as { __noReload?: boolean }).__noReload === true);

test('a nav link swaps the view without reloading', async ({ page }) => {
  await gotoView(page, 'en', 'hero');
  await markNoReload(page);

  await page.getByRole('link', { name: navLinkName('en', 'projects'), exact: true }).click();

  await expectView(page, 'en', 'projects');
  expect(new URL(page.url()).pathname).toBe(pathFor('en', 'projects'));
  expect(await stillSamePage(page)).toBe(true);
});

test('number and arrow shortcuts move between views', async ({ page }) => {
  await gotoView(page, 'en', 'hero');
  await markNoReload(page);

  await pressViewDigit(page, 4);
  await expectView(page, 'en', 'projects');

  // The order wraps around, so from the last view ArrowRight lands on the first.
  await page.keyboard.press('ArrowRight');
  await expectView(page, 'en', 'hero');

  await page.keyboard.press('ArrowLeft');
  await expectView(page, 'en', 'projects');

  expect(await stillSamePage(page)).toBe(true);
});

// #121 (WCAG 2.1.4): a bare digit acting page-wide fires when speech input dictates a number.
test('a digit pressed outside the view menu does not change view', async ({ page }) => {
  await gotoView(page, 'en', 'hero');
  await page.keyboard.press('3');
  await page.locator('main > section').focus();
  await page.keyboard.press('2');
  await page.waitForTimeout(300);
  await expectView(page, 'en', 'hero');

  // The arrows keep working from anywhere.
  await page.keyboard.press('ArrowRight');
  await expectView(page, 'en', 'identity');
});

test('back and forward retrace the view history', async ({ page }) => {
  await gotoView(page, 'en', 'hero');
  await pressViewDigit(page, 2);
  await expectView(page, 'en', 'identity');
  await pressViewDigit(page, 4);
  await expectView(page, 'en', 'projects');

  await page.goBack();
  await expectView(page, 'en', 'identity');
  expect(new URL(page.url()).pathname).toBe(pathFor('en', 'identity'));

  await page.goForward();
  await expectView(page, 'en', 'projects');
});

test('a sideways trackpad scroll cannot turn into history navigation', async ({ page }) => {
  await gotoView(page, 'en', 'projects');

  // The gesture itself is browser chrome and cannot be driven from a test: assert the rule that disables it.
  for (const selector of ['html', 'body']) {
    await expect(page.locator(selector)).toHaveCSS('overscroll-behavior-x', 'none');
  }
  await expect(page.locator('html')).toHaveCSS('overscroll-behavior-y', 'none');
});

test('a held arrow key does not flood the history', async ({ page }) => {
  await gotoView(page, 'en', 'hero');
  const before = await page.evaluate(() => history.length);

  // Real key repeat: the first keydown has repeat=false, every later one repeat=true.
  await page.evaluate(() => {
    for (let i = 0; i < 40; i++) {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', repeat: i > 0, bubbles: true }));
    }
  });
  await page.waitForTimeout(500);

  // Safari throws SecurityError past ~100 pushState calls per 30s, so one entry is the point.
  expect(await page.evaluate(() => history.length)).toBe(before + 1);
});

test('Shift+Arrow extends a selection instead of changing view', async ({ page }) => {
  await gotoView(page, 'en', 'hero');
  await page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true, bubbles: true }));
  });
  await page.waitForTimeout(400);
  expect(new URL(page.url()).pathname).toBe(pathFor('en', 'hero'));
});

test('nav links are real hrefs, so they survive a middle click or a crawler', async ({ page }) => {
  await gotoView(page, 'en', 'hero');
  await expect(page.getByRole('link', { name: navLinkName('en', 'timeline'), exact: true })).toHaveAttribute(
    'href',
    pathFor('en', 'timeline'),
  );
});

test('every nav link names its view in plain words, and the active one shows them', async ({ page }) => {
  // The narrowest phones still in use: the bar must fit without scrolling sideways.
  await page.setViewportSize({ width: 360, height: 740 });
  for (const locale of LOCALES) {
    for (const view of VIEWS) {
      await page.goto(pathFor(locale, view));
      const nav = page.locator('footer nav');
      // Every link carries the everyday word in their name, whichever is active.
      for (const other of VIEWS)
        await expect(nav.getByRole('link', { name: navLinkName(locale, other), exact: true })).toHaveCount(1);

      const active = nav.locator('a[aria-current="page"]');
      const { nav: names, navPlain } = locales[locale].ui;
      await expect(active).toContainText(names[view]);
      await expect(active).toContainText(navPlain[view]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      expect(await nav.evaluate((el) => el.getBoundingClientRect().right <= window.innerWidth)).toBe(true);
    }
  }
});

test('on a 375 px phone every nav entry shows its plain word, and every control is a 44 px target', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const locale of LOCALES) {
    await gotoView(page, locale, 'hero');
    const plain = page.locator('footer nav [data-plain]');
    await expect(plain).toHaveCount(VIEWS.length);
    for (const [index, view] of VIEWS.entries()) {
      await expect(plain.nth(index)).toContainText(locales[locale].ui.navPlain[view]);
      expect((await plain.nth(index).boundingBox())!.width).toBeGreaterThan(10);
    }
    // Header controls and the footer navigation (#95). The visual size may stay small: the hit area grows.
    const controls = page.locator('header a, header button, footer nav a');
    for (const control of await controls.all()) {
      if (!(await control.isVisible())) continue;
      const box = (await control.boundingBox())!;
      expect(box.width, (await control.textContent()) ?? '').toBeGreaterThanOrEqual(44);
      expect(box.height, (await control.textContent()) ?? '').toBeGreaterThanOrEqual(44);
      expect(box.x + box.width).toBeLessThanOrEqual(375);
    }
  }
});
