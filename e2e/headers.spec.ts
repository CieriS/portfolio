import { expect, test } from '@playwright/test';
import { pathFor } from './helpers';

test('security headers are served on every page', async ({ request }) => {
  const response = await request.get(pathFor('en', 'hero'));
  const headers = response.headers();

  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['strict-transport-security']).toContain('max-age=');
  expect(headers['permissions-policy']).toContain('camera=()');

  const csp = headers['content-security-policy'];
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("base-uri 'self'");
  expect(csp).toContain("frame-ancestors 'none'");
});

test('the site declares no external origins it does not use', async ({ request }) => {
  const csp = (await request.get(pathFor('en', 'hero'))).headers()['content-security-policy'];
  // next/font self-hosts Geist and Instrument Serif at build time, so no font CDN is needed.
  expect(csp).toContain("font-src 'self'");
  expect(csp).toContain("connect-src 'self'");
});

test('the CSP blocks nothing the page actually needs', async ({ page }) => {
  const violations: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && /Content Security Policy|Refused to/i.test(message.text())) {
      violations.push(message.text());
    }
  });

  await page.goto(pathFor('en', 'hero'));
  // Long enough for the lazily loaded canvas and the theme script to have run.
  await page.waitForTimeout(2500);

  expect(violations).toEqual([]);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
  await expect(page.locator('html')).toHaveAttribute('class', /light|dark/);
});

test('X-Powered-By is not advertised', async ({ request }) => {
  const response = await request.get(pathFor('en', 'hero'));
  expect(response.headers()['x-powered-by']).toBeUndefined();
});
