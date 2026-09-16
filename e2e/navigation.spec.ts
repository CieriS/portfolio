import { expect, test } from '@playwright/test';
import { expectView, gotoView, navLabel, pathFor } from './helpers';

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

  await page.getByRole('link', { name: navLabel('en', 'projects'), exact: true }).click();

  await expectView(page, 'en', 'projects');
  expect(new URL(page.url()).pathname).toBe(pathFor('en', 'projects'));
  expect(await stillSamePage(page)).toBe(true);
});

test('number and arrow shortcuts move between views', async ({ page }) => {
  await gotoView(page, 'en', 'hero');
  await markNoReload(page);

  await page.keyboard.press('5');
  await expectView(page, 'en', 'discipline');

  // The order wraps around, so from the last view ArrowRight lands on the first.
  await page.keyboard.press('ArrowRight');
  await expectView(page, 'en', 'hero');

  await page.keyboard.press('ArrowLeft');
  await expectView(page, 'en', 'discipline');

  expect(await stillSamePage(page)).toBe(true);
});

test('back and forward retrace the view history', async ({ page }) => {
  await gotoView(page, 'en', 'hero');
  await page.keyboard.press('2');
  await expectView(page, 'en', 'identity');
  await page.keyboard.press('4');
  await expectView(page, 'en', 'projects');

  await page.goBack();
  await expectView(page, 'en', 'identity');
  expect(new URL(page.url()).pathname).toBe(pathFor('en', 'identity'));

  await page.goForward();
  await expectView(page, 'en', 'projects');
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
  await expect(page.getByRole('link', { name: navLabel('en', 'timeline'), exact: true })).toHaveAttribute(
    'href',
    pathFor('en', 'timeline'),
  );
});
