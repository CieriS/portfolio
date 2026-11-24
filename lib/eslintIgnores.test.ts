import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('..', import.meta.url));
const eslint = new ESLint({ cwd: root });

/**
 * Playwright writes minified trace-viewer bundles to `playwright-report/trace/` as soon as a test
 * is retried. If ESLint read them, lint and the pre-push hook would fail on code nobody wrote (#152).
 */
describe('ESLint ignores', () => {
  it.each(['playwright-report/trace/index.js', 'playwright-report/index.js', 'test-results/run/trace.js'])(
    'skips generated test output: %s',
    async (file) => {
      expect(await eslint.isPathIgnored(root + file)).toBe(true);
    },
  );

  it.each(['lib/routes.ts', 'e2e/helpers.ts', 'scripts/sync-versions.mjs'])('still lints source: %s', async (file) => {
    expect(await eslint.isPathIgnored(root + file)).toBe(false);
  });
});
