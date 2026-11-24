import { expect, test } from '@playwright/test';
import { locales, shared } from './content';
import { gotoView, LOCALES } from './helpers';

/** The contact list of the identity view: what a recruiter wants comes first (#133), and every row says what it holds (#134). */
for (const locale of LOCALES) {
  test(`the contacts start with the CV and LinkedIn and show every detail on a phone, in ${locale}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoView(page, locale, 'identity');
    const copy = locales[locale];
    const rows = page.locator('#contacts li:has(> a), #contacts li:has(> button)');
    const labels = [copy.ui.cv.label, 'LinkedIn', 'GitHub', 'Instagram', copy.identity.sponsor];
    const details = [copy.ui.cv.handle, ...shared.contacts.map((contact) => contact.handle), shared.sponsor.label];
    await expect(rows).toHaveCount(labels.length);

    for (const [index, label] of labels.entries()) {
      const row = rows.nth(index).locator('a, button').first();
      await expect(row).toContainText(label);
      const detail = row.getByText(details[index], { exact: true });
      await row.scrollIntoViewIfNeeded();
      await expect(detail).toBeVisible();
      // Nothing spills out of the row.
      expect(await row.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
