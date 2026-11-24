import { expect, test, type Page } from '@playwright/test';
import { gotoView } from './helpers';

/** Height of the view's scroll container that is actually on screen. */
const visibleViewHeight = (page: Page) =>
  page.evaluate(() => {
    const box = document.querySelector('main > section')!.getBoundingClientRect();
    return Math.min(box.bottom, window.innerHeight) - Math.max(box.top, 0);
  });

// #141 (WCAG 1.4.10): at high zoom the fixed header and menu left the view a strip of the screen.
// 320 × 256 is 1280 × 1024 at 400%; 640 × 360 is 1280 × 720 at 200%.
for (const viewport of [
  { width: 320, height: 256 },
  { width: 640, height: 360 },
  { width: 844, height: 390 },
]) {
  test(`the view takes at least two thirds of a ${viewport.width} × ${viewport.height} screen`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await gotoView(page, 'en', 'identity');
    expect(await visibleViewHeight(page)).toBeGreaterThanOrEqual((viewport.height * 2) / 3);

    // The view still scrolls on its own, and the whole page reaches the menu at the bottom.
    const section = page.locator('main > section');
    expect(await section.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
    await section.evaluate((el) => el.scrollTo(0, el.scrollHeight));
    await page.locator('footer nav a').first().scrollIntoViewIfNeeded();
    await expect(page.locator('footer nav a').first()).toBeInViewport();
  });
}

test('at a normal height header and menu stay on screen', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await gotoView(page, 'en', 'identity');
  await expect(page.getByRole('banner')).toBeInViewport();
  await expect(page.locator('footer nav')).toBeInViewport();
});
