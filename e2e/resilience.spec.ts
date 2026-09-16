import { expect, test } from '@playwright/test';
import { expectView, gotoView, navLabel } from './helpers';

/**
 * The canvas is mounted in the root layout, above every view. Without a boundary a throw
 * there escalates past the pages and replaces the whole site with the global error screen.
 */
test('the site survives a WebGL failure and only loses the canvas', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...rest: unknown[]
    ) {
      if (String(type).includes('webgl')) return null;
      return (original as (...args: unknown[]) => unknown).call(this, type, ...rest);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });

  await gotoView(page, 'en', 'projects');
  await page.waitForTimeout(2500);

  await expect(page.locator('main > section')).toHaveAttribute('aria-label', navLabel('en', 'projects'));
  await expect(page.locator('footer nav a')).toHaveCount(5);
  await expect(page.locator('h1')).toHaveCount(1);

  // And navigation still works with no scene behind it.
  await page.keyboard.press('2');
  await expectView(page, 'en', 'identity');
});
