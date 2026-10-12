import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const dir = fileURLToPath(new URL('../.github/workflows/', import.meta.url));
const uses = readdirSync(dir)
  .filter((file) => /\.ya?ml$/.test(file))
  .flatMap((file) =>
    readFileSync(dir + file, 'utf8')
      .split('\n')
      .flatMap((line, index) => (/^\s*(- )?uses:/.test(line) ? [{ at: `${file}:${index + 1}`, line: line.trim() }] : [])),
  );

/**
 * A tag such as `@v7` can be moved by whoever controls the action's repository, and the
 * workflow would then run different code with the repository token. A full commit SHA cannot.
 * The trailing version comment is what Dependabot reads to keep proposing updates.
 */
describe('GitHub Actions', () => {
  it('are found by the scan', () => {
    expect(uses.length).toBeGreaterThan(0);
  });

  it.each(uses)('$at is pinned to a commit, with its version in a comment', ({ line }) => {
    expect(line).toMatch(/uses: [\w.-]+\/[\w./-]+@[0-9a-f]{40} # v\d+\.\d+\.\d+$/);
  });

  it('the rule tells a pin from a tag or a branch', () => {
    const rule = /uses: [\w.-]+\/[\w./-]+@[0-9a-f]{40} # v\d+\.\d+\.\d+$/;
    expect('uses: actions/checkout@v7').not.toMatch(rule);
    expect('uses: actions/checkout@main').not.toMatch(rule);
    expect('uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1').not.toMatch(rule);
    expect('uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1').toMatch(rule);
  });
});
