import type { SharedData } from './schema';

/**
 * The slice of a locale's copy that the cross-checks read. Structural on purpose, so the
 * checks can be unit-tested with small fixtures instead of the real content files.
 */
export type CopyUnderCheck = {
  ui: { locale: Record<string, string> };
  timeline: { threads: Record<string, { phases: Record<string, unknown> }> };
  projects: { items: Record<string, { layers: Record<string, string> }> };
};

/**
 * Rules the type system cannot see: copy keyed by ids that live in the shared data, and
 * `*Emphasis` words that must occur in the text they highlight. Returns every problem at
 * once, as readable paths, so a broken content edit is fixed in one pass.
 */
export function findContentIssues(shared: SharedData, contents: Record<string, CopyUnderCheck>): string[] {
  const issues: string[] = [];
  const locales = Object.keys(contents);

  for (const [locale, copy] of Object.entries(contents)) {
    const at = (path: string) => `${locale}.${path}`;

    for (const other of locales) {
      if (!copy.ui.locale[other]) issues.push(`${at('ui.locale')} has no label for "${other}"`);
    }

    for (const thread of shared.timeline.threads) {
      const threadCopy = copy.timeline.threads[thread.id];
      if (!threadCopy) {
        issues.push(`${at('timeline.threads')} has no copy for thread "${thread.id}"`);
        continue;
      }
      for (const phase of thread.phases) {
        if (!threadCopy.phases[phase.id]) issues.push(`${at(`timeline.threads.${thread.id}.phases`)} has no copy for "${phase.id}"`);
      }
    }

    for (const project of shared.projects) {
      const item = copy.projects.items[project.id];
      if (!item) {
        issues.push(`${at('projects.items')} has no copy for project "${project.id}"`);
        continue;
      }
      for (const layer of project.layers) {
        if (!item.layers[layer.id]) issues.push(`${at(`projects.items.${project.id}.layers`)} has no copy for "${layer.id}"`);
      }
    }

    issues.push(...findEmphasisIssues(copy, locale));
  }

  return issues;
}

/** Every `<key>Emphasis` must be a substring of its sibling `<key>`, or the italic accent silently disappears. */
export function findEmphasisIssues(node: unknown, path: string): string[] {
  if (typeof node !== 'object' || node === null) return [];
  const record = node as Record<string, unknown>;
  const issues: string[] = [];

  for (const [key, value] of Object.entries(record)) {
    if (key.endsWith('Emphasis') && typeof value === 'string') {
      const target = record[key.slice(0, -'Emphasis'.length)];
      if (typeof target !== 'string' || !target.includes(value)) {
        issues.push(`${path}.${key} "${value}" does not occur in ${path}.${key.slice(0, -'Emphasis'.length)}`);
      }
    } else {
      issues.push(...findEmphasisIssues(value, `${path}.${key}`));
    }
  }
  return issues;
}
