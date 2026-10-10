import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { gotoView } from './helpers';

/**
 * The CV download as a visitor meets it. playwright.config.ts gives the server an admin
 * password and leaves email links unconfigured, so both the download and the graceful
 * "not available" path are exercised; the link flow itself is covered by lib/cv unit tests.
 */
const ADMIN_PASSWORD = 'e2e-admin-password-0001';

async function openCvPanel(page: Page) {
  await gotoView(page, 'en', 'identity');
  const toggle = page.getByRole('button', { name: /Curriculum/ });
  await toggle.scrollIntoViewIfNeeded();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
}

test('the owner password downloads the PDF', async ({ page }) => {
  await openCvPanel(page);
  await page.getByRole('button', { name: 'Password', exact: true }).click();
  await page.getByLabel('Password', { exact: true }).fill(ADMIN_PASSWORD);

  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download' }).click();
  const file = await download;

  expect(file.suggestedFilename()).toBe('Samuele-Cieri-CV.pdf');
  const stream = await file.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk as Buffer);
  expect(Buffer.concat(chunks).subarray(0, 5).toString()).toBe('%PDF-');
  await expect(page.getByRole('status')).toHaveText('Download started.');
});

test('a wrong password is refused', async ({ page }) => {
  await openCvPanel(page);
  await page.getByRole('button', { name: 'Password', exact: true }).click();
  await page.getByLabel('Password', { exact: true }).fill('not the password');
  await page.getByRole('button', { name: 'Download' }).click();
  await expect(page.getByRole('status')).toHaveText('Wrong password.');
});

test('typing digits in the form does not change view', async ({ page }) => {
  await openCvPanel(page);
  await page.getByLabel('Email address').pressSequentially('123');
  await expect(page).toHaveURL(/\/en\/identity$/);
});

test('without a mail sender the email request says so instead of failing', async ({ page }) => {
  await openCvPanel(page);
  await page.getByLabel('Email address').fill('visitor@example.com');
  await page.getByRole('button', { name: 'Send link' }).click();
  await expect(page.getByRole('status')).toHaveText('Not available right now: write to me on LinkedIn.');
});

test('the open panel has no WCAG A/AA violations', async ({ page }) => {
  await openCvPanel(page);
  await page.waitForTimeout(1500);
  const { violations } = await new AxeBuilder({ page })
    .include('main')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(violations.map((v) => `${v.id} (${v.nodes.length}): ${v.help}`)).toEqual([]);
});

test.describe('the API', () => {
  test('returns the PDF uncached and unindexed for the owner password', async ({ request }) => {
    const response = await request.post('/api/cv', { data: { method: 'password', locale: 'it', password: ADMIN_PASSWORD } });
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('application/pdf');
    expect(response.headers()['content-disposition']).toBe('attachment; filename="Samuele-Cieri-CV.pdf"');
    expect(response.headers()['cache-control']).toBe('no-store');
    expect(response.headers()['x-robots-tag']).toBe('noindex');
  });

  test('rejects malformed requests', async ({ request }) => {
    expect((await request.post('/api/cv', { data: 'nonsense' })).status()).toBe(400);
    expect((await request.post('/api/cv', { data: { method: 'password', locale: 'en' } })).status()).toBe(400);
  });

  test('refuses a link when links are not configured', async ({ request }) => {
    const response = await request.get('/api/cv?token=forged.token');
    expect(response.status()).toBe(503);
    expect(response.headers()['cache-control']).toBe('no-store');
  });
});
