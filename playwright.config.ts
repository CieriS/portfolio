import { defineConfig, devices } from '@playwright/test';

/**
 * A port of its own, not 3000: with `reuseExistingServer` a dev server left running on the
 * default port would be reused silently, and the suite would then assert security headers
 * and prerendered output against `next dev` instead of a production build.
 */
const PORT = Number(process.env.PORT ?? 3210);
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  // A stray `test.only` must never pass silently on CI.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : 'list',

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],

  /**
   * Production build on purpose. Security headers, SSG output and the prerendered
   * metadata are what this suite asserts, and `next dev` reproduces none of them
   * faithfully. Reusing a server that is already up keeps local runs quick.
   */
  webServer: {
    command: `npm run build && npm start -- --port ${PORT}`,
    // Canonical URLs, hreflang and the sitemap are built from SITE_URL, which otherwise
    // falls back to a hardcoded localhost:3000 and would not match the port under test.
    env: { SITE_URL: BASE_URL },
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
