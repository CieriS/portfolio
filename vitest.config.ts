import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/** Unit tests for pure modules only; anything rendered in a browser belongs to the Playwright suite in e2e/. */
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  test: { include: ['**/*.test.ts'], exclude: ['node_modules/**', '.next/**', 'e2e/**', 'legacy/**'], environment: 'node' },
});
