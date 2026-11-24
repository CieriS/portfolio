import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = new URL('..', import.meta.url).pathname;

/** Every .ts/.tsx source under `dir`, as `[path relative to the repo, contents]`. */
function sources(dir: string): [string, string][] {
  return readdirSync(join(root, dir), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name))
    .map((entry) => {
      const path = join(entry.parentPath, entry.name);
      return [relative(root, path), readFileSync(path, 'utf8')];
    });
}

const files = [...sources('components'), ...sources('app')];

/** `[file, match]` for every match of `pattern` across the component and app sources. */
function find(pattern: RegExp): string[] {
  return files.flatMap(([path, text]) => [...text.matchAll(pattern)].map((match) => `${path}: ${match[0]}`));
}

describe('design tokens (#97, #145)', () => {
  it('scans the component and app sources', () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it('uses the type roles instead of arbitrary sizes, tracking and leading', () => {
    expect(find(/\b(?:text|tracking|leading)-\[[^\]]+\]/g)).toEqual([]);
  });

  it('uses the section gap tokens instead of large raw margins', () => {
    expect(find(/(?<![\w-])(?:md:)?mt-(?:2[0-9]|3[0-9])(?![\w-])/g)).toEqual([]);
  });
});

describe('accent colour (#100)', () => {
  // 2.52:1 on the light paper: dots, lines and fills only. `dark:` variants are allowed.
  it('is never a text colour in the light theme', () => {
    expect(find(/(?<!dark:)(?<![\w-])(?:text|fill|decoration|placeholder)-accent\b/g)).toEqual([]);
    expect(find(/\b(?:color|fill)\s*[:=]\s*["'{]*\s*["']?var\(--accent\)/g)).toEqual([]);
  });

  it('catches the patterns it guards against', () => {
    const sample = '<p className="text-accent" /> <p className="dark:text-accent" /> <text fill="var(--accent)" />';
    expect([...sample.matchAll(/(?<!dark:)(?<![\w-])(?:text|fill|decoration|placeholder)-accent\b/g)]).toHaveLength(1);
    expect([...sample.matchAll(/\b(?:color|fill)\s*[:=]\s*["'{]*\s*["']?var\(--accent\)/g)]).toHaveLength(1);
  });
});
