import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // Generated output: Playwright's reports (a retried test writes minified bundles there, #152) and local git worktrees under .claude/, whose .next builds would otherwise be linted.
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'playwright-report/**', 'test-results/**', '.claude/**']),
]);
