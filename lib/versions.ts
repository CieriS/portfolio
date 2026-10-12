/**
 * Keeping the project versions in `data/shared.json` in step with the projects' own releases.
 * Pure and dependency-free: `scripts/sync-versions.mjs` does the network and the file I/O, a
 * scheduled workflow turns the result into a pull request. Nothing here is used by the site.
 */

/** The fields of a GitHub release this module reads. */
export type Release = { tag_name: string; draft: boolean; prerelease: boolean; published_at: string | null };
export type Latest = { version: string; released: string | null };
export type VersionChange = { id: string; from: string; to: string };

type Triple = [number, number, number];

/** `v1.2.3` or `1.2.3` → `[1, 2, 3]`; anything else, pre-release suffixes included, is not a version here. */
export function parseVersion(text: string): Triple | null {
  const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(text.trim());
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
}

/** Negative when `a` is older than `b`, positive when newer, zero when equal. Unparsable sorts first. */
export function compareVersions(a: string, b: string): number {
  const left = parseVersion(a);
  const right = parseVersion(b);
  if (!left || !right) return Number(Boolean(left)) - Number(Boolean(right));
  return left[0] - right[0] || left[1] - right[1] || left[2] - right[2];
}

/**
 * The highest published version among a repository's releases. Drafts never count; whether
 * pre-releases do is the caller's choice. GitHub's own "latest" skips them, which would hide a
 * project whose only release so far is a pre-release.
 */
export function latestRelease(releases: readonly Release[], options: { prereleases: boolean }): Latest | null {
  let latest: Latest | null = null;
  for (const release of releases) {
    if (release.draft || (release.prerelease && !options.prereleases)) continue;
    const parsed = parseVersion(release.tag_name);
    if (!parsed) continue;
    const version = parsed.join('.');
    if (!latest || compareVersions(version, latest.version) > 0) {
      latest = { version, released: release.published_at ? release.published_at.slice(0, 10) : null };
    }
  }
  return latest;
}

/** `https://github.com/owner/repo/` → `owner/repo`; `null` for anything that is not a GitHub repository. */
export function repositoryOf(url: string): string | null {
  const match = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/.exec(url);
  return match ? `${match[1]}/${match[2]}` : null;
}

/**
 * Writes newer versions into the text of `shared.json`, touching nothing else: the file is
 * edited as text because re-serialising it would reformat every line. Only a project that
 * already declares a version is updated, and never to an older or equal one.
 */
export function applyVersions(
  text: string,
  latest: Readonly<Record<string, Latest>>,
): { text: string; changes: VersionChange[] } {
  const changes: VersionChange[] = [];
  let result = text;

  for (const [id, { version, released }] of Object.entries(latest)) {
    const start = result.indexOf(`"id": "${id}"`, result.indexOf('"projects"'));
    if (start < 0) continue;
    // A project's own fields come before its layers, whose entries carry ids of their own.
    const layers = result.indexOf('"layers"', start);
    const end = layers < 0 ? result.length : layers;
    const block = result.slice(start, end);
    const current = /"version": "([^"]*)"/.exec(block)?.[1];
    if (current === undefined || compareVersions(version, current) <= 0) continue;

    let next = block.replace(/"version": "[^"]*"/, `"version": "${version}"`);
    if (released) {
      next = /"released": "[^"]*"/.test(next)
        ? next.replace(/"released": "[^"]*"/, `"released": "${released}"`)
        : next.replace(/("version": "[^"]*",?)(\s*)/, (_, field: string, space: string) => {
            const comma = field.endsWith(',') ? field : `${field},`;
            return `${comma}${space}"released": "${released}",${space}`;
          });
    }
    result = result.slice(0, start) + next + result.slice(end);
    changes.push({ id, from: current, to: version });
  }
  return { text: result, changes };
}
