import { expect, test } from '@playwright/test';
import { CASE_STUDY_PAGES, ALL_PAGES } from '../e2e/helpers';
import { DEFAULT_LOCALE } from '../lib/routes';
import { deployExpectations, parseDeployEnvironment, robotsHeaderOn } from '../lib/smoke';

/**
 * issue #82: what only the deployment decides, checked on the deployed URL. The full suite in
 * e2e/ covers behaviour on a local production build; this one stays short and read-only (no CV
 * request that could send an email, no form submitted).
 */
const baseURL = process.env.SMOKE_BASE_URL!.replace(/\/+$/, '');
const siteUrl = (process.env.SMOKE_SITE_URL ?? baseURL).replace(/\/+$/, '');
const expected = deployExpectations(parseDeployEnvironment(process.env.SMOKE_ENV), siteUrl);

test.describe(`${expected.environment} deployment at ${baseURL}`, () => {
  for (const { locale, path } of [...ALL_PAGES, ...CASE_STUDY_PAGES]) {
    test(`${path} is served, hydrates and carries the metadata of its environment`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      // A chunk missing from the CDN shows up as a failed script, not as a page error. Only the
      // site's own: previews inject the Vercel toolbar from vercel.live, which the CSP blocks.
      page.on('requestfailed', (request) => {
        if (request.resourceType() === 'script' && new URL(request.url()).origin === new URL(baseURL).origin) {
          errors.push(`script failed: ${request.url()}`);
        }
      });

      const response = await page.goto(path, { waitUntil: 'load' });
      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).not.toBeEmpty();
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${siteUrl}${path}`);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        'content',
        expected.indexable ? 'index, follow' : 'noindex, nofollow',
      );
      expect(errors).toEqual([]);
    });
  }

  test('the root redirects to the default locale', async ({ request }) => {
    const response = await request.get('/', { maxRedirects: 0 });
    expect([307, 308]).toContain(response.status());
    expect(new URL(response.headers()['location'], baseURL).pathname).toBe(`/${DEFAULT_LOCALE}`);
  });

  test('an unknown path is a real 404', async ({ request }) => {
    expect((await request.get(`/${DEFAULT_LOCALE}/smoke-test-missing-page`)).status()).toBe(404);
  });

  test('headers: CSP on every page, X-Robots-Tag only where indexing is off', async ({ request }) => {
    const headers = (await request.get(`/${DEFAULT_LOCALE}`)).headers();
    expect(headers['content-security-policy']).toContain("default-src 'self'");
    if (robotsHeaderOn(expected, baseURL) === 'absent') expect(headers['x-robots-tag']).toBeUndefined();
    else expect(headers['x-robots-tag']).toContain('noindex');
  });

  test('robots.txt and the sitemap follow the environment', async ({ request }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.status()).toBe(200);
    const body = await robots.text();
    if (expected.indexable) {
      expect(body).toContain('Allow: /');
      expect(body).toContain(`Sitemap: ${siteUrl}/sitemap.xml`);
    } else {
      expect(body).toMatch(/Disallow: \/\s*$/m);
    }
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain(`<loc>${siteUrl}/${DEFAULT_LOCALE}</loc>`);
  });

  test('the CV endpoint is up and rejects a forged link', async ({ request }) => {
    // 503 in production would mean the CV variables are missing on Vercel.
    const status = (await request.get('/api/cv?token=forged.token')).status();
    expect(expected.cvForgedTokenStatuses).toContain(status);
  });

  for (const host of expected.redirectingHosts) {
    test(`${host} redirects permanently to SITE_URL`, async ({ request }) => {
      const response = await request.get(`https://${host}/${DEFAULT_LOCALE}`, { maxRedirects: 0 });
      expect(response.status()).toBe(308);
      expect(response.headers()['location']).toBe(`${siteUrl}/${DEFAULT_LOCALE}`);
    });
  }
});
