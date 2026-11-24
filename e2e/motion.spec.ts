import { expect, test, type Page } from '@playwright/test';
import { locales } from './content';
import { caseStudyPath } from '../lib/routes';
import { expectView, gotoView } from './helpers';

const toggle = (page: Page) => page.locator('[data-motion-toggle]');

/** Decorative loops are the infinite CSS animations (timeline packets, pulses). */
const runningLoops = (page: Page) =>
  page.evaluate(
    () =>
      document.getAnimations().filter((a) => a.playState === 'running' && a.effect?.getTiming().iterations === Infinity).length,
  );

/** The canvas mounts on timers after load; WebKit headless has no WebGL and never shows it. */
async function visibleCanvas(page: Page) {
  const canvas = page.locator('canvas');
  await expect(canvas).toHaveCSS('opacity', '1', { timeout: 15_000 });
  return canvas;
}

// #142 (WCAG 2.2.2): a visitor without the reduced-motion setting can still stop the movement.
test('the pause control works from the keyboard and names its state', async ({ page }) => {
  await gotoView(page, 'en', 'timeline');
  const button = toggle(page);
  await expect(button).toHaveAccessibleName(locales.en.ui.motion.pause);
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  expect(await runningLoops(page)).toBeGreaterThan(0);

  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'paused');
  expect(await runningLoops(page)).toBe(0);

  await page.keyboard.press('Space');
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(() => runningLoops(page)).toBeGreaterThan(0);
});

test('the pause control has a 44 px hit area', async ({ page }) => {
  await gotoView(page, 'en', 'hero');
  const box = (await toggle(page).boundingBox())!;
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
});

test('while paused the scene does not change', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'WebKit headless has no WebGL');
  await gotoView(page, 'en', 'hero');
  const canvas = await visibleCanvas(page);
  await toggle(page).click();
  await page.waitForTimeout(300);
  const before = await canvas.screenshot();
  await page.mouse.move(400, 300);
  await page.waitForTimeout(1500);
  expect((await canvas.screenshot()).equals(before)).toBe(true);
});

test('the pause survives a change of view and a reload', async ({ page }) => {
  await gotoView(page, 'en', 'hero');
  await toggle(page).click();
  await page.keyboard.press('ArrowRight');
  await expectView(page, 'en', 'identity');
  await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true');

  await page.reload();
  await gotoView(page, 'en', 'timeline');
  await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true');
  expect(await runningLoops(page)).toBe(0);
});

test('the pause chosen in the views holds on a case study', async ({ page }) => {
  await gotoView(page, 'en', 'hero');
  await toggle(page).click();
  await page.goto(caseStudyPath('en', 'ariaer'));
  await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'paused');
});

// #143: under reduced motion the timeline counter must not tick every second.
test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the uptime counter does not change over 3 s', async ({ page }) => {
    // Ten seconds into a minute, so the once-a-minute refresh cannot fall inside the window.
    await page.clock.install({ time: new Date('2026-11-24T10:00:10Z') });
    await gotoView(page, 'en', 'timeline');
    const counter = page.locator('main > section p.tabular-nums').first();
    await expect(counter).toHaveText(/\d/);
    const before = await counter.innerText();
    await page.clock.runFor(3_000);
    await expect(counter).toHaveText(before);
  });
});

test('without reduced motion the uptime counter ticks', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-24T10:00:10Z') });
  await gotoView(page, 'en', 'timeline');
  const counter = page.locator('main > section p.tabular-nums').first();
  await expect(counter).toHaveText(/\d/);
  const before = await counter.innerText();
  await page.clock.runFor(3_000);
  await expect(counter).not.toHaveText(before);
});
