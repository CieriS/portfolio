import { expect, test } from '@playwright/test';
import { contactsPath } from '../lib/routes';
import { locales } from './content';
import { expectView, gotoView, LOCALES, pathFor } from './helpers';

/**
 * The two ways on from the home page (#131, #132): the projects, which are the evidence, and the
 * contacts. Measured on the phone of the design review, where both used to be far away.
 */
test.describe('on a 390 × 844 phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const locale of LOCALES) {
    test(`both calls to action are on the first screen, in ${locale}`, async ({ page }) => {
      await gotoView(page, locale, 'hero');
      const projects = page.locator('a[data-cta="projects"]');
      const contact = page.locator('a[data-cta="contacts"]');
      await expect(projects).toContainText(locales[locale].hero.cta);
      await expect(projects).toHaveAttribute('href', pathFor(locale, 'projects'));
      await expect(contact).toHaveText(locales[locale].identity.contactsTitle);
      await expect(contact).toHaveAttribute('href', contactsPath(locale));

      // Above the fade at the bottom of the view (2.5rem), so neither looks faded (#95).
      const fadeTop = await page.locator('main').evaluate((el) => el.getBoundingClientRect().bottom - 40);
      for (const link of [projects, contact]) {
        const box = (await link.boundingBox())!;
        expect(box.y + box.height).toBeLessThanOrEqual(fadeTop);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    });
  }
});

test('the main call to action opens the projects in place', async ({ page }) => {
  await gotoView(page, 'en', 'hero');
  await page.locator('a[data-cta="projects"]').click();
  await expectView(page, 'en', 'projects');
  expect(new URL(page.url()).pathname).toBe(pathFor('en', 'projects'));
});

test('the contact link lands on the contacts, with the keyboard inside them', async ({ page, browserName }) => {
  await gotoView(page, 'en', 'hero');
  await page.locator('a[data-cta="contacts"]').click();
  await expectView(page, 'en', 'identity');
  expect(new URL(page.url()).hash).toBe('#contacts');
  const section = page.locator('#contacts');
  await expect(section).toBeFocused();
  await expect(section).toBeInViewport();
  // The next Tab reaches the first row of the list: the CV. Safari's Tab order is its own (see below).
  if (browserName === 'webkit') return;
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: new RegExp(locales.en.ui.cv.label) })).toBeFocused();
});

test('the keyboard meets the home links in the order they are shown', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'Safari leaves links out of the Tab order by default');
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await gotoView(page, 'en', 'hero');
    const links = page.locator('main a');
    const order: string[] = [];
    await page.locator('main > section').focus();
    for (let i = 0; i < (await links.count()); i++) {
      await page.keyboard.press('Tab');
      order.push(await page.evaluate(() => document.activeElement?.textContent?.trim() ?? ''));
    }
    // Reading order: left to right, then top to bottom.
    const positions = await links.evaluateAll((els) =>
      els.map((el) => {
        const box = el.getBoundingClientRect();
        return { text: el.textContent?.trim() ?? '', x: box.x, y: box.y };
      }),
    );
    const shown = [...positions].sort((a, b) => (Math.abs(a.y - b.y) < 8 ? a.x - b.x : a.y - b.y)).map((link) => link.text);
    // On a wide screen the columns read left to right; on a phone everything is one column.
    if (viewport.width < 768) expect(order).toEqual(shown);
    else expect(order.slice(0, 2)).toEqual([`${locales.en.hero.cta}→`, locales.en.identity.contactsTitle]);
  }
});

test('the cursor hint is not shown on a touch screen', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'needs a touch device without hover');
  await gotoView(page, 'en', 'hero');
  await expect(page.getByText(locales.en.hero.hint)).toBeHidden();
});

test('the cursor hint is shown where there is a pointer', async ({ page, isMobile }) => {
  test.skip(isMobile, 'a desktop pointer only');
  await gotoView(page, 'en', 'hero');
  await expect(page.getByText(locales.en.hero.hint)).toBeVisible();
});
