import { defineConfig, devices } from '@playwright/test';

/**
 * Smoke suite against a deployed site (issue #82), not a local build: no webServer. CI runs it on
 * every successful Vercel deployment (.github/workflows/smoke.yml); by hand:
 *   SMOKE_BASE_URL=https://cieri.vercel.app SMOKE_ENV=production npm run test:smoke
 * SMOKE_SITE_URL is the SITE_URL the deployment was built with (canonical tags, sitemap,
 * alias redirects); it defaults to the base URL, which is right for production.
 */
const baseURL = process.env.SMOKE_BASE_URL?.replace(/\/+$/, '');
if (!baseURL) throw new Error('SMOKE_BASE_URL is required: the URL of the deployment to check');

export default defineConfig({
  testDir: './smoke',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // A deployment that is still propagating can drop one request; a second failure is real.
  retries: 1,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  use: { baseURL, trace: 'retain-on-failure' },
  // One browser is enough: this suite checks the deployment, the full suite checks the browsers.
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
