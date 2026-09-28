import { expect, test } from '@playwright/test';
import { locales } from './content';
import { expectView, gotoView, pathFor } from './helpers';

const copy = locales.en.projects;

test('a private project shows its highlights and never links to a repository', async ({ page }) => {
  await gotoView(page, 'en', 'projects');

  // The first project starts expanded.
  const panel = page.locator('#project-yourfinance');
  await expect(panel.getByRole('heading', { name: copy.labels.highlights })).toBeVisible();
  await expect(panel.getByRole('listitem').filter({ hasText: copy.items.yourfinance.highlights[0] })).toBeVisible();

  await expect(panel.locator('a[href*="github.com"]')).toHaveCount(0);
  await expect(panel.getByRole('link', { name: copy.labels.private })).toHaveAttribute('href', pathFor('en', 'identity'));
});

test('the private source link swaps to the contacts view in place', async ({ page }) => {
  await gotoView(page, 'en', 'projects');
  await page.locator('#project-yourfinance').getByRole('link', { name: copy.labels.private }).click();

  await expectView(page, 'en', 'identity');
  expect(new URL(page.url()).pathname).toBe(pathFor('en', 'identity'));
});

test('private projects publish no codeRepository in the JSON-LD', async ({ page }) => {
  await page.goto(pathFor('en', 'projects'));
  const raw = await page.locator('script[type="application/ld+json"]').innerHTML();
  expect(raw).toContain('SoftwareSourceCode');
  expect(raw).not.toContain('codeRepository');
});
