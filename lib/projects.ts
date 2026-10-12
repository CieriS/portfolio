import type { Project } from '@/lib/portfolio';

/** `0.9.0` → `v0.9.0`, the way a release is tagged and talked about. */
export function versionLabel(project: Pick<Project, 'version'>): string | null {
  return project.version ? `v${project.version}` : null;
}

/**
 * Where the released version can be seen: the tag's page in a public repository. A private
 * project has a version and no address, so its version is shown as plain text.
 */
export function releaseUrl(project: Pick<Project, 'source' | 'version'>): string | null {
  if (project.source.visibility !== 'public' || !project.version) return null;
  return `${project.source.url.replace(/\/$/, '')}/releases/tag/v${project.version}`;
}
