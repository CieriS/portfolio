/**
 * Addresses of the files written for AI agents (#172, #173, #174). Framework-free like
 * `lib/routes.ts`, which every path here is built from: no slug is written by hand.
 *
 * The public addresses are the page URL plus `.md` and `llms-full.txt` under a locale. Those
 * segments collide with the dynamic page routes (`[locale]/[view]`), so `next.config.ts`
 * rewrites each public address to an internal route handler under `/agents/`, listed by
 * `agentRewrites()`.
 */
import {
  CASE_STUDY_IDS,
  caseStudyPath,
  DEFAULT_LOCALE,
  isCaseStudyId,
  isLocale,
  LOCALES,
  pathFor,
  VIEW_IDS,
  type CaseStudyId,
  type Locale,
  type ViewId,
} from '../routes';

export const LLMS_TXT_PATH = '/llms.txt';

/** A page that has a Markdown version: one of the views, or a case study. */
export type MarkdownPage = { locale: Locale; view: ViewId } | { locale: Locale; study: CaseStudyId };

/** Every indexable page in every locale, in reading order: the views, then the case studies. */
export function markdownPages(): MarkdownPage[] {
  return LOCALES.flatMap((locale) => [
    ...VIEW_IDS.map((view): MarkdownPage => ({ locale, view })),
    ...CASE_STUDY_IDS.map((study): MarkdownPage => ({ locale, study })),
  ]);
}

/** The HTML page a Markdown file stands for. */
export function htmlPath(page: MarkdownPage): string {
  return 'study' in page ? caseStudyPath(page.locale, page.study) : pathFor(page.locale, page.view);
}

/** `/en/identity` → `/en/identity.md`; the home `/en` → `/en.md`. */
export function markdownPath(page: MarkdownPage): string {
  return `${htmlPath(page)}.md`;
}

/** The whole site in one file: `/llms-full.txt` in English, `/<locale>/llms-full.txt` otherwise. */
export function fullTextPath(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? '/llms-full.txt' : `/${locale}/llms-full.txt`;
}

/** One URL segment per page for the internal route: `en-identity`, `it-study-ariaer`. */
export function markdownKey(page: MarkdownPage): string {
  return 'study' in page ? `${page.locale}-study-${page.study}` : `${page.locale}-${page.view}`;
}

export function pageFromKey(key: string): MarkdownPage | null {
  const [locale, kind, study, ...rest] = key.split('-');
  if (!isLocale(locale) || rest.length > 0) return null;
  if (kind === 'study') return isCaseStudyId(study) ? { locale, study } : null;
  const view = VIEW_IDS.find((id) => id === kind);
  return view && study === undefined ? { locale, view } : null;
}

export const INTERNAL_PREFIX = '/agents';

export function internalMarkdownPath(page: MarkdownPage): string {
  return `${INTERNAL_PREFIX}/md/${markdownKey(page)}`;
}

export function internalFullTextPath(locale: Locale): string {
  return `${INTERNAL_PREFIX}/full/${locale}`;
}

/** Public address → internal route handler, one literal rule per file (no pattern to get wrong). */
export function agentRewrites(): { source: string; destination: string }[] {
  return [
    ...markdownPages().map((page) => ({ source: markdownPath(page), destination: internalMarkdownPath(page) })),
    ...LOCALES.map((locale) => ({ source: fullTextPath(locale), destination: internalFullTextPath(locale) })),
  ];
}
