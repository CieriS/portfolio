/**
 * Date of last change of a page (#176): the last commit that touched the files the page is
 * built from, so `dateModified` in the JSON-LD and `lastmod` in the sitemap say the same thing
 * and move only when the content does. Pure; the git call is passed in (`lib/gitDates.ts`).
 */
import type { CaseStudyId, Locale } from './routes';

/** `YYYY-MM-DD` of the last commit touching any of `files`, or null when git cannot say. */
export type GitDate = (files: string[]) => string | null;

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

export function lastModified(files: string[], gitDate: GitDate, buildDate: string): string {
  const date = gitDate(files);
  return date && ISO_DAY.test(date) ? date : buildDate;
}

/** Every view reads the shared data and the copy of its language. */
export function viewSources(locale: Locale): string[] {
  return ['data/shared.json', `data/locales/${locale}.json`];
}

/** A case study adds its own file to what the views read. */
export function caseStudySources(locale: Locale, id: CaseStudyId): string[] {
  return [...viewSources(locale), `data/case-studies/${id}.json`];
}
