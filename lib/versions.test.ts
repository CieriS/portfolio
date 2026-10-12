import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { SharedSchema } from './content/schema';
import { applyVersions, compareVersions, latestRelease, parseVersion, repositoryOf, type Release } from './versions';

const release = (tag_name: string, more: Partial<Release> = {}): Release => ({
  tag_name,
  draft: false,
  prerelease: false,
  published_at: '2026-01-02T03:04:05Z',
  ...more,
});

describe('parseVersion', () => {
  it('reads a tag with or without the leading v', () => {
    expect(parseVersion('v1.2.3')).toEqual([1, 2, 3]);
    expect(parseVersion(' 10.0.4 ')).toEqual([10, 0, 4]);
  });

  it('refuses anything that is not MAJOR.MINOR.PATCH', () => {
    for (const text of ['1.2', 'v1.2.3-rc.1', 'release-1.2.3', '', 'latest']) expect(parseVersion(text), text).toBeNull();
  });
});

describe('compareVersions', () => {
  it('orders by number, not by text', () => {
    expect(compareVersions('1.10.0', '1.9.0')).toBeGreaterThan(0);
    expect(compareVersions('0.9.0', '1.0.0')).toBeLessThan(0);
    expect(compareVersions('2.3.1', 'v2.3.1')).toBe(0);
    expect(['1.2.0', '0.9.0', '1.10.0', '1.9.3'].sort(compareVersions)).toEqual(['0.9.0', '1.2.0', '1.9.3', '1.10.0']);
  });

  it('puts what it cannot parse before any real version', () => {
    expect(compareVersions('nightly', '0.0.1')).toBeLessThan(0);
    expect(compareVersions('0.0.1', 'nightly')).toBeGreaterThan(0);
  });
});

describe('latestRelease', () => {
  it('takes the highest version, whatever the order GitHub lists them in', () => {
    const releases = [release('v1.2.0'), release('v1.10.0', { published_at: '2026-05-06T00:00:00Z' }), release('v1.9.0')];
    expect(latestRelease(releases, { prereleases: true })).toEqual({ version: '1.10.0', released: '2026-05-06' });
  });

  it('never counts a draft, and counts a pre-release only when asked to', () => {
    const releases = [release('v1.0.0'), release('v1.1.0', { prerelease: true }), release('v2.0.0', { draft: true })];
    expect(latestRelease(releases, { prereleases: true })?.version).toBe('1.1.0');
    expect(latestRelease(releases, { prereleases: false })?.version).toBe('1.0.0');
  });

  it('skips tags that are not versions and reports nothing when none is left', () => {
    expect(latestRelease([release('nightly'), release('v0.3.0')], { prereleases: true })?.version).toBe('0.3.0');
    expect(latestRelease([release('nightly')], { prereleases: true })).toBeNull();
    expect(latestRelease([], { prereleases: true })).toBeNull();
  });

  it('keeps the version when the publication date is missing', () => {
    expect(latestRelease([release('v0.1.0', { published_at: null })], { prereleases: true })).toEqual({
      version: '0.1.0',
      released: null,
    });
  });
});

describe('repositoryOf', () => {
  it('reads owner and name from a GitHub address', () => {
    expect(repositoryOf('https://github.com/CieriS/aria-er')).toBe('CieriS/aria-er');
    expect(repositoryOf('https://github.com/CieriS/aria-er/')).toBe('CieriS/aria-er');
    expect(repositoryOf('https://github.com/some.org/tool.git')).toBe('some.org/tool');
  });

  it('refuses other hosts and deeper paths', () => {
    expect(repositoryOf('https://gitlab.com/me/tool')).toBeNull();
    expect(repositoryOf('https://github.com/me/tool/releases')).toBeNull();
    expect(repositoryOf('https://github.com/me')).toBeNull();
  });
});

describe('applyVersions', () => {
  const text = `{
  "name": "Someone",
  "projects": [
    {
      "id": "alpha",
      "source": { "visibility": "private" },
      "version": "1.2.0",
      "released": "2026-01-01",
      "layers": [{ "id": "beta", "tech": "Rust" }]
    },
    {
      "id": "beta",
      "version": "0.9.0",
      "layers": [{ "id": "api", "tech": "Rust" }]
    },
    { "id": "gamma", "layers": [] }
  ]
}
`;

  it('writes a newer version and its date, and changes nothing else', () => {
    const { text: next, changes } = applyVersions(text, { alpha: { version: '1.3.0', released: '2026-02-03' } });
    expect(changes).toEqual([{ id: 'alpha', from: '1.2.0', to: '1.3.0' }]);
    expect(next).toBe(text.replace('"1.2.0"', '"1.3.0"').replace('"2026-01-01"', '"2026-02-03"'));
  });

  it("adds the date where the project had none, in the file's own layout", () => {
    const { text: next } = applyVersions(text, { beta: { version: '1.0.0', released: '2026-03-04' } });
    expect(next).toContain('"id": "beta",\n      "version": "1.0.0",\n      "released": "2026-03-04",\n      "layers"');
    expect(JSON.parse(next).projects[1]).toMatchObject({ id: 'beta', version: '1.0.0', released: '2026-03-04' });
  });

  it('never goes back, and does not rewrite an equal version', () => {
    for (const version of ['1.2.0', '1.1.9', '0.0.1']) {
      const { text: next, changes } = applyVersions(text, { alpha: { version, released: '2030-01-01' } });
      expect(changes).toEqual([]);
      expect(next).toBe(text);
    }
  });

  it('leaves a project that declares no version, and one it does not know, alone', () => {
    const { text: next, changes } = applyVersions(text, {
      gamma: { version: '9.9.9', released: '2026-01-01' },
      missing: { version: '9.9.9', released: '2026-01-01' },
    });
    expect(changes).toEqual([]);
    expect(next).toBe(text);
  });

  it('does not mistake a layer for the project with the same id', () => {
    // "beta" is also the id of a layer of "alpha", which comes first in the file.
    const { text: next } = applyVersions(text, { beta: { version: '0.9.1', released: null } });
    const projects = JSON.parse(next).projects;
    expect(projects[0].version).toBe('1.2.0');
    expect(projects[1].version).toBe('0.9.1');
  });

  it('updates several projects at once', () => {
    const { changes } = applyVersions(text, {
      alpha: { version: '2.0.0', released: null },
      beta: { version: '1.0.0', released: null },
    });
    expect(changes.map((change) => change.id)).toEqual(['alpha', 'beta']);
  });

  it('works on the real file and leaves it valid', () => {
    const real = readFileSync(fileURLToPath(new URL('../data/shared.json', import.meta.url)), 'utf8');
    const { text: next, changes } = applyVersions(real, { ariaer: { version: '99.0.0', released: '2030-01-02' } });
    expect(changes).toHaveLength(1);
    const parsed = SharedSchema.parse(JSON.parse(next));
    expect(parsed.projects.find((project) => project.id === 'ariaer')).toMatchObject({
      version: '99.0.0',
      released: '2030-01-02',
    });
    // One line for the version, one for the date: the rest of the file is untouched.
    const changed = next.split('\n').filter((line, index) => line !== real.split('\n')[index]);
    expect(changed).toHaveLength(2);
  });
});

describe('the private repository', () => {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const files = (dir: string): string[] =>
    readdirSync(join(root, dir)).flatMap((entry) => {
      const path = join(dir, entry);
      if (statSync(join(root, path)).isDirectory()) return files(path);
      return /\.(json|ya?ml|mjs|ts|tsx)$/.test(entry) ? [path] : [];
    });

  // Its name comes to the workflow from a secret. Written in a file of this public
  // repository it would tell everyone where the private code lives.
  it.each(['.github', 'scripts', 'data'].flatMap(files))('%s does not name it', (file) => {
    expect(readFileSync(join(root, file), 'utf8')).not.toMatch(/your-finance/i);
  });
});
