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

  // 'unsafe-eval' is granted to React in development only. This suite runs against the
  // production build, so finding it here means the dev-only guard has leaked into a deploy.
  expect(csp).not.toContain('unsafe-eval');
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

test('first-party scripts ship with a source map', async ({ request }) => {
  const html = await (await request.get(pathFor('en', 'hero'))).text();
  // Next's polyfill bundle is the one exception: prebuilt third-party code, served with
  // `nomodule` and therefore never loaded by a browser that supports modules.
  const tags = [...html.matchAll(/<script\b[^>]*\bsrc="(\/_next\/static\/[^"]+\.js)"[^>]*>/g)];
  const scripts = [...new Set(tags.filter((tag) => !/nomodule/i.test(tag[0])).map((tag) => tag[1]))];
  expect(scripts.length).toBeGreaterThan(0);

  let mapped = 0;
  for (const src of scripts) {
    const code = await (await request.get(src)).text();
    const reference = /\/\/# sourceMappingURL=(\S+)\s*$/.exec(code)?.[1];
    if (!reference) continue;
    const map = await request.get(new URL(reference, `http://x${src}`).pathname);
    expect(map.status(), `${src} points at a missing map`).toBe(200);
    expect(Array.isArray((await map.json()).sources)).toBe(true);
    mapped += 1;
  }
  // None of the chunks a modern browser loads may be left unreadable in production.
  expect(mapped).toBe(scripts.length);
});
