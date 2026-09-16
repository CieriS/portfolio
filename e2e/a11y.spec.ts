import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { ALL_PAGES, expectView, gotoView, navLabel } from './helpers';

// One scan per view in the default locale; the other locales share the same markup.
for (const { view, path } of ALL_PAGES.filter((p) => p.locale === 'en')) {
  test(`${path} has no WCAG A/AA violations`, async ({ page }) => {
    await page.goto(path);
    // The intro animation leaves elements mid-transition, which reads as low contrast.
    await page.waitForTimeout(2000);

    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(
      violations.map((v) => `${v.id} (${v.nodes.length}): ${v.help}`),
      `axe violations on ${view}`,
    ).toEqual([]);
  });
}

test('the scrollable view can be reached and scrolled with the keyboard alone', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 600 });
  await gotoView(page, 'en', 'discipline');
  const section = page.locator('main > section');

  await expect(section).toHaveAttribute('tabindex', '0');
  expect(await section.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);

  await section.focus();
  await page.keyboard.press('PageDown');
  await page.waitForTimeout(400);
  expect(await section.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
});

test('the skip link is hidden until focused, then visible, and targets the content', async ({ page }) => {
  await gotoView(page, 'en', 'hero');
  const link = page.locator('a[href="#main"]');

  await expect(link).toHaveCount(1);
  await expect(page.locator('#main')).toHaveCount(1);
  // Clipped away by sr-only until it takes focus.
  const clipped = await link.evaluate((el) => el.getBoundingClientRect().height);

  await link.focus();
  const shown = await link.evaluate((el) => el.getBoundingClientRect().height);
  expect(shown).toBeGreaterThan(clipped);
});

test('the skip link is the first tab stop', async ({ page, browserName }) => {
  // Safari leaves links out of the tab order unless the user turns on "Press Tab to
  // highlight each item on a webpage", so Tab lands elsewhere there by design.
  test.skip(browserName === 'webkit', 'WebKit excludes links from the tab order by default');

  await gotoView(page, 'en', 'hero');
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveAttribute('href', '#main');
});

test('a view change moves focus so screen readers announce it', async ({ page }) => {
  await gotoView(page, 'en', 'hero');
  await page.waitForTimeout(1500);

  // The first render must not steal focus: there is no previous view to announce.
  expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('BODY');

  await page.keyboard.press('3');
  await expectView(page, 'en', 'timeline');
  await page.waitForTimeout(300);

  expect(await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))).toBe(
    navLabel('en', 'timeline'),
  );
});

test('the projects accordion always points aria-controls at a real element', async ({ page }) => {
  await gotoView(page, 'en', 'projects');
  const button = page.locator('[aria-controls]').first();
  const panelId = await button.getAttribute('aria-controls');

  const targetExists = () => page.evaluate((id) => !!document.getElementById(id!), panelId);

  await expect(button).toHaveAttribute('aria-expanded', 'true');
  expect(await targetExists()).toBe(true);

  await button.click();
  await page.waitForTimeout(1000);
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  expect(await targetExists()).toBe(true);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the timeline packet loop stops', async ({ page }) => {
    await gotoView(page, 'en', 'timeline');
    await page.waitForTimeout(1500);
    // The travelling packet is hidden outright rather than left looping forever.
    const visible = await page.evaluate(() =>
      [...document.querySelectorAll('.motion-reduce\\:hidden')].some((el) => getComputedStyle(el).display !== 'none'),
    );
    expect(visible).toBe(false);
  });
});
