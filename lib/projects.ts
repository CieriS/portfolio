import type { Project } from '@/lib/portfolio';

/** `0.9.0` → `v0.9.0`, the way a release is tagged and talked about. */
export function versionLabel(project: Pick<Project, 'version'>): string | null {
  return project.version ? `v${project.version}` : null;
}

/** `2026-10-11` → `October 2026`, in the language of the page. */
export function releaseMonth(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${iso}T00:00:00Z`),
  );
}

/** `1.2.0, October 2026`: the version with the month it came out, when both are known. */
export function versionWithDate(project: Pick<Project, 'version' | 'released'>, locale: string): string | null {
  if (!project.version) return null;
  return project.released ? `${project.version}, ${releaseMonth(project.released, locale)}` : project.version;
}

/**
 * Where the released version can be seen: the tag's page in a public repository. A private
 * project has a version and no address, so its version is shown as plain text.
 */
export function releaseUrl(project: Pick<Project, 'source' | 'version'>): string | null {
  if (project.source.visibility !== 'public' || !project.version) return null;
  return `${project.source.url.replace(/\/$/, '')}/releases/tag/v${project.version}`;
}

export type NamedSegment = { text: string; id?: string };

/**
 * Cuts a sentence wherever it names one of the given items, so each name can be rendered as
 * a link: `'a X b'` with `X` → `[{ text: 'a ' }, { text: 'X', id }, { text: ' b' }]`. Only the
 * first occurrence of each name is marked; a name that does not occur is simply not there.
 */
export function splitByNames(text: string, items: ReadonlyArray<{ id: string; name: string }>): NamedSegment[] {
  const found = items
    .map((item) => ({ ...item, at: text.indexOf(item.name) }))
    .filter((item) => item.at >= 0)
    .sort((a, b) => a.at - b.at);

  const segments: NamedSegment[] = [];
  let cursor = 0;
  for (const { id, name, at } of found) {
    if (at < cursor) continue; // overlaps a name already taken
    if (at > cursor) segments.push({ text: text.slice(cursor, at) });
    segments.push({ text: name, id });
    cursor = at + name.length;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) });
  return segments;
}
