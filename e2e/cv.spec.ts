import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { LOCALES } from '../lib/routes';
import { locales, shared } from './content';
import { gotoView, type Locale } from './helpers';

/**
 * The CV download as a visitor meets it. playwright.config.ts gives the server an admin
 * password and leaves email links unconfigured, so both the download and the graceful
 * "not available" path are exercised; the link flow itself is covered by lib/cv unit tests.
 */
const ADMIN_PASSWORD = 'e2e-admin-password-0001';

async function openCvPanel(page: Page, locale: Locale = 'en') {
  await gotoView(page, locale, 'identity');
  const toggle = page.getByRole('button', { name: new RegExp(locales[locale].ui.cv.label) });
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

test('the password can be shown while typing and is hidden again by default', async ({ page }) => {
  await openCvPanel(page);
  // The email field has nothing to reveal.
  await expect(page.getByRole('button', { name: 'Show', exact: true })).toHaveCount(0);

  await page.getByRole('button', { name: 'Password', exact: true }).click();
  const field = page.getByLabel('Password', { exact: true });
  await field.fill('typed in the open');
  await expect(field).toHaveAttribute('type', 'password');

  await page.getByRole('button', { name: 'Show', exact: true }).click();
  await expect(field).toHaveAttribute('type', 'text');
  await expect(field).toHaveValue('typed in the open');

  await page.getByRole('button', { name: 'Hide', exact: true }).click();
  await expect(field).toHaveAttribute('type', 'password');

  // Leaving and coming back never leaves a password in the clear.
  await page.getByRole('button', { name: 'Show', exact: true }).click();
  await page.getByRole('button', { name: 'Email link' }).click();
  await page.getByRole('button', { name: 'Password', exact: true }).click();
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'password');
});

test('an empty or malformed field is explained by the page, not by the browser', async ({ page }) => {
  await openCvPanel(page);
  const email = page.getByLabel('Email address');
  // The browser's own validation is off: nothing of its "fill in this field" bubble is left.
  await expect(page.locator('form')).toHaveAttribute('novalidate', '');
  await expect(email).not.toHaveAttribute('required', '');

  await page.getByRole('button', { name: 'Send link' }).click();
  await expect(page.getByRole('status')).toHaveText('Write the address the link should be sent to.');
  await expect(email).toHaveAttribute('aria-invalid', 'true');
  await expect(email).toBeFocused();

  await email.fill('visitor@example');
  await expect(page.getByRole('status')).toHaveText('');
  await expect(email).not.toHaveAttribute('aria-invalid', 'true');
  await page.getByRole('button', { name: 'Send link' }).click();
  await expect(page.getByRole('status')).toHaveText('This does not look like an email address: check the part after the @.');

  await page.getByRole('button', { name: 'Password', exact: true }).click();
  await page.getByRole('button', { name: 'Download' }).click();
  await expect(page.getByRole('status')).toHaveText('Write the password.');
  await expect(page.getByLabel('Password', { exact: true })).toBeFocused();
});

test('nothing is sent while the field is empty', async ({ page }) => {
  let requests = 0;
  await page.route('**/api/cv', (route) => {
    requests += 1;
    return route.continue();
  });
  await openCvPanel(page);
  await page.getByRole('button', { name: 'Send link' }).click();
  await expect(page.getByRole('status')).not.toHaveText('');
  expect(requests).toBe(0);
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

// #136: the mail provider refusing the message answers 502. Retrying would fail the same way,
// so the message names another way to write, with a working link, in every language.
for (const locale of LOCALES) {
  test(`a refused email points to LinkedIn (${locale})`, async ({ page }) => {
    const copy = locales[locale].ui.cv;
    const linkedin = shared.contacts.find((contact) => contact.id === 'linkedin')!;
    await page.route('**/api/cv', (route) => route.fulfill({ status: 502, json: { status: 'failed' } }));
    await openCvPanel(page, locale);
    await page.getByLabel(copy.email).fill('visitor@example.com');
    await page.getByRole('button', { name: copy.send }).click();

    const status = page.getByRole('status');
    await expect(status).toHaveText(copy.notSent.replace('{linkedin}', linkedin.label));
    const link = status.getByRole('link', { name: linkedin.label });
    await expect(link).toHaveAttribute('href', linkedin.url);
    await expect(link).toHaveAttribute('target', '_blank');
  });
}

// #112: the firewall's rate limit answers 429.
test('a rate-limited request says to wait', async ({ page }) => {
  await page.route('**/api/cv', (route) => route.fulfill({ status: 429, body: 'Too Many Requests' }));
  await openCvPanel(page);
  await page.getByLabel('Email address').fill('visitor@example.com');
  await page.getByRole('button', { name: 'Send link' }).click();
  await expect(page.getByRole('status')).toHaveText(locales.en.ui.cv.tooMany);
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
    expect((await request.post('/api/cv', { data: 'nonsense', headers: { 'Content-Type': 'application/json' } })).status()).toBe(
      400,
    );
    expect((await request.post('/api/cv', { data: { method: 'password', locale: 'en' } })).status()).toBe(400);
  });

  // #113: without a mail sender an email request answers 503, so a 415 or 403 proves the request
  // stopped before the service and the mailer.
  test('refuses a non-JSON request before reading it', async ({ request }) => {
    const email = JSON.stringify({ method: 'email', locale: 'en', email: 'visitor@example.com' });
    const plain = await request.post('/api/cv', { data: email, headers: { 'Content-Type': 'text/plain' } });
    expect(plain.status()).toBe(415);
    expect(plain.headers()['cache-control']).toBe('no-store');
    const form = await request.post('/api/cv', { form: { method: 'email', locale: 'en', email: 'visitor@example.com' } });
    expect(form.status()).toBe(415);
  });

  test('refuses a request sent from another site', async ({ request, baseURL }) => {
    const data = { method: 'email', locale: 'en', email: 'visitor@example.com' };
    const foreign = await request.post('/api/cv', { data, headers: { Origin: 'https://evil.example' } });
    expect(foreign.status()).toBe(403);
    const own = await request.post('/api/cv', { data, headers: { Origin: new URL(baseURL!).origin } });
    expect(own.status()).toBe(503);
  });

  test('refuses a link when links are not configured', async ({ request }) => {
    const response = await request.get('/api/cv?token=forged.token');
    expect(response.status()).toBe(503);
    expect(response.headers()['cache-control']).toBe('no-store');
  });
});

// #147: the focused field was only a 1 px border changing colour.
test('the focused CV field has a 2 px ink border', async ({ page }) => {
  await openCvPanel(page);
  const field = page.getByLabel('Email address');
  const line = field.locator('xpath=..');
  await expect(line).toHaveCSS('border-bottom-width', '1px');
  await field.focus();
  await expect(line).toHaveCSS('border-bottom-width', '2px');
  const ink = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--ink').trim());
  const color = await line.evaluate((el) => getComputedStyle(el).borderBottomColor);
  const probe = await page.evaluate((value) => {
    const el = document.createElement('div');
    el.style.color = value;
    document.body.append(el);
    const rgb = getComputedStyle(el).color;
    el.remove();
    return rgb;
  }, ink);
  expect(color).toBe(probe);
});
