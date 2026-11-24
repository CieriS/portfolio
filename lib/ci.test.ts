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

const workflows = readdirSync(dir)
  .filter((file) => /\.ya?ml$/.test(file))
  .map((file) => ({ file, text: readFileSync(dir + file, 'utf8') }));

/** issue #129: local runs and every workflow use the same Node, and no workflow writes by default. */
describe('workflows', () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const nvmrc = readFileSync(root + '.nvmrc', 'utf8').trim();
  const engines: string = JSON.parse(readFileSync(root + 'package.json', 'utf8')).engines.node;

  it.each(workflows)('$file declares its permissions', ({ text }) => {
    expect(text).toMatch(/^permissions:\n {2}contents: read$/m);
  });

  it.each(workflows.filter(({ text }) => text.includes('setup-node')))('$file reads Node from .nvmrc', ({ text }) => {
    expect(text).not.toMatch(/node-version:/);
    expect(text).toMatch(/node-version-file: \.nvmrc/);
  });

  it('.nvmrc names a major that engines accepts', () => {
    expect(nvmrc).toMatch(/^\d+$/);
    expect(engines).toMatch(new RegExp(`^>=${nvmrc}\\.\\d+\\.\\d+$`));
  });

  it('ci.yml runs on branches that exist', () => {
    const ci = workflows.find(({ file }) => file === 'ci.yml')!.text;
    expect(ci).toMatch(/branches: \[development\]/);
  });
});
