import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/** Unit tests for pure modules only; anything rendered in a browser belongs to the Playwright suite in e2e/. Local git worktrees under .claude/ are skipped: they hold their own copy of the tests and of node_modules. */
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  test: { include: ['**/*.test.ts'], exclude: ['node_modules/**', '.next/**', 'e2e/**', '.claude/**'], environment: 'node' },
});
