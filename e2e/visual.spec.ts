import { expect, test } from '@playwright/test';
import { gotoView, VIEWS, type ViewId } from './helpers';

/**
 * Reference screenshots of the layout. Rendering differs between operating systems, so the
 * references are the ones CI produces (Linux, Chromium) and the suite is skipped elsewhere:
 * a Mac would otherwise fail on antialiasing alone. README, "Visual regression", explains how
 * to refresh them after an intended change.
 */
test.skip(
  ({ browserName }) => browserName !== 'chromium' || process.platform !== 'linux',
  'references exist for Chromium on Linux only',
);
test.skip(({ isMobile }) => isMobile, 'the mobile cases set their own viewport below');

const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };

const CASES: Array<{ name: string; view: ViewId; scheme: 'light' | 'dark'; viewport: typeof DESKTOP }> = [
  ...VIEWS.map((view) => ({ name: `${view}-light-desktop`, view, scheme: 'light' as const, viewport: DESKTOP })),
  { name: 'hero-dark-desktop', view: 'hero', scheme: 'dark', viewport: DESKTOP },
  { name: 'timeline-dark-desktop', view: 'timeline', scheme: 'dark', viewport: DESKTOP },
  { name: 'hero-light-phone', view: 'hero', scheme: 'light', viewport: PHONE },
  { name: 'projects-light-phone', view: 'projects', scheme: 'light', viewport: PHONE },
];

for (const { name, view, scheme, viewport } of CASES) {
  test(`${name} matches its reference`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
    // The timeline draws "now" and a running uptime: pin the clock, or every run differs.
    await page.clock.setFixedTime(new Date('2026-06-15T12:00:00Z'));
    await gotoView(page, 'en', view);
    await page.evaluate(() => document.fonts.ready);
    // Entrance animations are done well within this; the WebGL scene is hidden by visual.css.
    await page.waitForTimeout(2500);

    await expect(page).toHaveScreenshot(`${name}.png`, {
      animations: 'disabled',
      stylePath: 'e2e/visual.css',
      maxDiffPixelRatio: 0.002,
    });
  });
}
