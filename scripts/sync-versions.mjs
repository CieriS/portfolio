#!/usr/bin/env node
// Compares the version of each project in data/shared.json with the project's latest GitHub
// release and rewrites the file when a release is newer. The logic is in lib/versions.ts;
// this file only talks to GitHub and to the disk. Run by .github/workflows/versions.yml,
// which turns a change into a pull request.
//
// Usage: GH_TOKEN=<token> [SOURCES_TOKEN=<token>] [VERSION_SOURCES='{"<project id>":"owner/repo"}'] \\
//          node scripts/sync-versions.mjs [--dry-run]
//
// A public project is looked up in the repository of its `source.url`. A private one has no
// address in the data, on purpose: its repository comes from VERSION_SOURCES, a secret, and is
// never printed. Its releases are read with SOURCES_TOKEN when given: a fine-grained token has
// one set of permissions for all its repositories, so reading private code and writing here
// are kept in two tokens, each with the least it needs. Needs Node 22.18 or later, which runs the TypeScript module as it is.
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { applyVersions, latestRelease, repositoryOf } from '../lib/versions.ts';

const FILE = new URL('../data/shared.json', import.meta.url);
const dryRun = process.argv.includes('--dry-run');
const token = process.env.GH_TOKEN ?? '';
const sourcesToken = process.env.SOURCES_TOKEN || token;

/** Project id → repository, for projects whose repository is not in the data. */
function privateSources() {
  const raw = process.env.VERSION_SOURCES?.trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('VERSION_SOURCES is not valid JSON: expected {"<project id>":"owner/repo"}');
  }
}

async function releasesOf(id, repository, auth) {
  const response = await fetch(`https://api.github.com/repos/${repository}/releases?per_page=100`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
  });
  if (!response.ok) {
    const hint = [401, 403, 404].includes(response.status)
      ? ': the token is missing, has expired or cannot read the releases of this project'
      : '';
    // The project id only: the repository of a private project must not reach the log.
    throw new Error(`${id}: GitHub answered ${response.status}${hint}`);
  }
  return response.json();
}

// Any failure becomes one readable line in the workflow run, not a stack trace.
process.on('uncaughtException', (error) => {
  console.error(`::error::${error.message}`);
  process.exit(1);
});

const text = readFileSync(FILE, 'utf8');
const { projects } = JSON.parse(text);
const hidden = privateSources();
const latest = {};
const notes = [];

for (const project of projects) {
  if (!project.version) continue;
  const repository = hidden[project.id] ?? (project.source.visibility === 'public' ? repositoryOf(project.source.url) : null);
  if (!repository) {
    notes.push(`${project.name}: no repository to read releases from, left at ${project.version}`);
    continue;
  }
  // Pre-releases count: a project whose only release so far is one is still worth showing.
  const auth = hidden[project.id] ? sourcesToken : token;
  const found = latestRelease(await releasesOf(project.id, repository, auth), { prereleases: true });
  if (!found) {
    notes.push(`${project.name}: no release with a vMAJOR.MINOR.PATCH tag, left at ${project.version}`);
    continue;
  }
  latest[project.id] = found;
}

const { text: next, changes } = applyVersions(text, latest);
for (const note of notes) console.log(note);

const lines = changes.map(({ id, from, to }) => {
  const project = projects.find((item) => item.id === id);
  const page = project.source.visibility === 'public' ? `${project.source.url.replace(/\/$/, '')}/releases/tag/v${to}` : null;
  return { name: project.name, from, to, page };
});
for (const line of lines) console.log(`${line.name}: ${line.from} -> ${line.to}`);
if (changes.length === 0) console.log('Every project is at its latest release.');

if (changes.length > 0 && !dryRun) writeFileSync(FILE, next);

if (process.env.GITHUB_OUTPUT) {
  const summary = lines.map((line) => `${line.name} ${line.to}`).join(', ');
  const body = [
    'A newer release was found for the projects below. `data/shared.json` is the only file changed.',
    '',
    ...lines.map((line) => `- **${line.name}**: ${line.from} → ${line.page ? `[${line.to}](${line.page})` : line.to}`),
    '',
    'The version shows in the project panel, in the CV, in the JSON-LD and in the case study.',
    '',
    'If a check fails here, some copy depends on the version (for example, what a project still has to do before 1.0.0): update the copy in this branch, then merge.',
  ].join('\n');
  const bodyFile = join(process.env.RUNNER_TEMP ?? tmpdir(), 'versions-pr.md');
  writeFileSync(bodyFile, `${body}\n`);
  appendFileSync(
    process.env.GITHUB_OUTPUT,
    [
      `changed=${changes.length > 0}`,
      `title=Project versions: ${summary}`,
      `message=Versioni dei progetti: ${summary}`,
      `body=${bodyFile}`,
      '',
    ].join('\n'),
  );
}
