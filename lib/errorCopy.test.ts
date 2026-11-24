import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { errorCopy } from './errorCopy';
import { reachable, type SourceTree } from './importGraph';
import { LOCALES } from './routes';

const root = fileURLToPath(new URL('..', import.meta.url));

function sources(dir: string): string[] {
  return readdirSync(join(root, dir)).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(join(root, path)).isDirectory()) return sources(path);
    return /\.tsx?$/.test(entry) && !entry.endsWith('.test.ts') ? [path] : [];
  });
}

const EXTENSIONS = ['', '.ts', '.tsx', '/index.ts', '/index.tsx'];

/** Local files as the bundler finds them: `@/` is the project root, relative paths from the importer. */
const projectTree: SourceTree = {
  read: (path) => (/\.tsx?$/.test(path) ? readFileSync(path, 'utf8') : undefined),
  resolve: (specifier, from) => {
    const base = specifier.startsWith('@/')
      ? join(root, specifier.slice(2))
      : specifier.startsWith('.')
        ? join(dirname(from), specifier)
        : null;
    if (base === null) return null;
    const file = EXTENSIONS.map((extension) => base + extension).find((path) => {
      try {
        return statSync(path).isFile();
      } catch {
        return false;
      }
    });
    return file ?? base;
  },
};

function isBuildOnly(target: string): boolean {
  if (target === 'zod' || target.startsWith('zod/')) return true;
  const local = relative(root, target);
  return local === join('lib', 'portfolio.ts') || local.startsWith(join('lib', 'content') + '/');
}

describe('errorCopy', () => {
  it.each(LOCALES)('has every string for %s', (locale) => {
    const copy = errorCopy(locale);
    for (const text of [copy.title, copy.body, copy.cta]) expect(text.trim()).not.toBe('');
  });
});

describe('client components', () => {
  // Build-time validation must stay out of the browser: one runtime import of these modules,
  // even through another module (issue #123), ships zod and every locale file with every page.
  const client = ['app', 'components', 'store'].flatMap(sources).filter((file) => {
    return /^['"]use client['"]/.test(readFileSync(join(root, file), 'utf8'));
  });

  it('are found by the scan', () => {
    expect(client.length).toBeGreaterThan(10);
    expect(client).toContain(join('app', 'global-error.tsx'));
    expect(client).toContain(join('components', 'case-study', 'LiveResults.tsx'));
  });

  it.each(client)('%s reaches no build-only module at runtime', (file) => {
    const offending = [...reachable(join(root, file), projectTree).entries()].filter(([target]) => isBuildOnly(target));
    expect(offending.map(([, chain]) => chain.map((step) => relative(root, step) || step).join(' → '))).toEqual([]);
  });

  it('the rule names zod, the loader and the content modules, not the rest of lib', () => {
    expect(isBuildOnly('zod')).toBe(true);
    expect(isBuildOnly('zod/mini')).toBe(true);
    expect(isBuildOnly(join(root, 'lib', 'portfolio.ts'))).toBe(true);
    expect(isBuildOnly(join(root, 'lib', 'content', 'schema.ts'))).toBe(true);
    expect(isBuildOnly(join(root, 'lib', 'liveResults.ts'))).toBe(false);
    expect(isBuildOnly('zodiac')).toBe(false);
  });
});
