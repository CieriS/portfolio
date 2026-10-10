import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { errorCopy } from './errorCopy';
import { LOCALES } from './routes';

const root = fileURLToPath(new URL('..', import.meta.url));

function sources(dir: string): string[] {
  return readdirSync(join(root, dir)).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(join(root, path)).isDirectory()) return sources(path);
    return /\.tsx?$/.test(entry) && !entry.endsWith('.test.ts') ? [path] : [];
  });
}

describe('errorCopy', () => {
  it.each(LOCALES)('has every string for %s', (locale) => {
    const copy = errorCopy(locale);
    for (const text of [copy.title, copy.body, copy.cta]) expect(text.trim()).not.toBe('');
  });
});

describe('client components', () => {
  // Build-time validation must stay out of the browser: one value import from these modules
  // in a client component ships zod and every locale file with every page.
  const BUILD_ONLY = /^import (?!type\b)[^;]*from '(@\/lib\/portfolio|@\/lib\/content\/[a-z]+|zod)'/m;
  const client = ['app', 'components', 'store'].flatMap(sources).filter((file) => {
    return /^['"]use client['"]/.test(readFileSync(join(root, file), 'utf8'));
  });

  it('are found by the scan', () => {
    expect(client.length).toBeGreaterThan(10);
    expect(client).toContain(join('app', 'global-error.tsx'));
  });

  it.each(client)('%s imports no build-only module at runtime', (file) => {
    expect(readFileSync(join(root, file), 'utf8')).not.toMatch(BUILD_ONLY);
  });

  it('the scan recognises a value import and ignores a type import', () => {
    expect("import { getPortfolioBundle } from '@/lib/portfolio';").toMatch(BUILD_ONLY);
    expect("import { z } from 'zod';").toMatch(BUILD_ONLY);
    expect("import type { PortfolioView } from '@/lib/portfolio';").not.toMatch(BUILD_ONLY);
  });
});
