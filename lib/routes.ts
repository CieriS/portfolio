/**
 * Locales, views and their localized slugs. Framework-free on purpose (no next-intl, no
 * path aliases): the app and the Playwright suite import this same module, so a slug can
 * never drift between what is served and what is tested.
 */
export const LOCALES = ['en', 'it', 'fr', 'de', 'es'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/** Each language's name in itself: the language menu shows it the same way whatever the active locale. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  it: 'Italiano',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
};

export const VIEW_IDS = ['hero', 'identity', 'timeline', 'projects', 'discipline'] as const;
export type ViewId = (typeof VIEW_IDS)[number];

/** Localized URL segment per view; the hero lives at the locale root. */
export const VIEW_SLUGS: Record<Locale, Record<ViewId, string>> = {
  en: { hero: '', identity: 'identity', timeline: 'execution', projects: 'systems', discipline: 'optimization' },
  it: { hero: '', identity: 'identita', timeline: 'esecuzione', projects: 'sistemi', discipline: 'ottimizzazione' },
  fr: { hero: '', identity: 'identite', timeline: 'execution', projects: 'systemes', discipline: 'optimisation' },
  de: { hero: '', identity: 'identitaet', timeline: 'ausfuehrung', projects: 'systeme', discipline: 'optimierung' },
  es: { hero: '', identity: 'identidad', timeline: 'ejecucion', projects: 'sistemas', discipline: 'optimizacion' },
};

export function isLocale(value: string | undefined): value is Locale {
  return LOCALES.some((locale) => locale === value);
}

export function pathFor(locale: Locale, view: ViewId): string {
  const slug = VIEW_SLUGS[locale][view];
  return slug ? `/${locale}/${slug}` : `/${locale}`;
}

export function viewFromSlug(locale: Locale, slug: string | undefined): ViewId | null {
  if (!slug) return 'hero';
  return VIEW_IDS.find((id) => id !== 'hero' && VIEW_SLUGS[locale][id] === slug) ?? null;
}

/** Projects with a page of their own, one level below the projects view: `/it/sistemi/yourfinance`. */
export const CASE_STUDY_IDS = ['yourfinance', 'ariaer'] as const;
export type CaseStudyId = (typeof CASE_STUDY_IDS)[number];

export function isCaseStudyId(value: string | undefined): value is CaseStudyId {
  return CASE_STUDY_IDS.some((id) => id === value);
}

export function caseStudyPath(locale: Locale, id: CaseStudyId): string {
  return `${pathFor(locale, 'projects')}/${id}`;
}

/**
 * Where a project is told: its case study when it has one, otherwise the projects view with
 * that project's panel open (`/it/sistemi#<id>`).
 */
export function projectPath(locale: Locale, projectId: string): string {
  return isCaseStudyId(projectId) ? caseStudyPath(locale, projectId) : `${pathFor(locale, 'projects')}#${projectId}`;
}

/** `/it/sistemi` → `projects`. The slug is resolved against the locale written in the path. */
export function viewFromPath(pathname: string): ViewId | null {
  const [, locale, slug] = pathname.split('/');
  if (!isLocale(locale)) return null;
  return viewFromSlug(locale, slug);
}

/**
 * The same address with the view segment in the language of its locale, or null when there is
 * nothing to change. `/it/systems/ariaer` becomes `/it/sistemi/ariaer`, so a link written in one
 * language works in every other: with the locale prefix that the proxy adds from the browser
 * language, `/systems/ariaer` opens the case study in the reader's language.
 */
export function localizedPath(pathname: string): string | null {
  const [locale, slug, ...rest] = pathname.split('/').filter(Boolean);
  if (!isLocale(locale) || !slug) return null;
  if (VIEW_IDS.some((id) => VIEW_SLUGS[locale][id] === slug)) return null;
  const view = VIEW_IDS.find((id) => id !== 'hero' && LOCALES.some((other) => VIEW_SLUGS[other][id] === slug));
  if (!view) return null;
  return ['', locale, VIEW_SLUGS[locale][view], ...rest].join('/');
}
