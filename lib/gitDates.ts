/**
 * The git edge of `lib/lastModified.ts`, run at build. Vercel builds have the repository (a
 * shallow clone: a file older than the clone gets the date of its oldest commit, never a date
 * in the future). Without git the build date is used.
 */
import { execFileSync } from 'node:child_process';
import { lastModified, type GitDate } from './lastModified';

const gitDate: GitDate = (files) => {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...files], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return out.trim() || null;
  } catch {
    return null;
  }
};

const BUILD_DATE = new Date().toISOString().slice(0, 10);
const cache = new Map<string, string>();

/** Memoized per set of files: every page of a build asks once. */
export function pageLastModified(files: string[]): string {
  const key = files.join('\n');
  let date = cache.get(key);
  if (!date) {
    date = lastModified(files, gitDate, BUILD_DATE);
    cache.set(key, date);
  }
  return date;
}
