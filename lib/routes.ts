/**
 * Locales, views and their localized slugs. Framework-free on purpose (no next-intl, no
 * path aliases): the app and the Playwright suite import this same module, so a slug can
 * never drift between what is served and what is tested.
 */
export const LOCALES = ['en', 'it', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const VIEW_IDS = ['hero', 'identity', 'timeline', 'projects', 'discipline'] as const;
export type ViewId = (typeof VIEW_IDS)[number];

/** Localized URL segment per view; the hero lives at the locale root. */
export const VIEW_SLUGS: Record<Locale, Record<ViewId, string>> = {
  en: { hero: '', identity: 'identity', timeline: 'execution', projects: 'systems', discipline: 'optimization' },
  it: { hero: '', identity: 'identita', timeline: 'esecuzione', projects: 'sistemi', discipline: 'ottimizzazione' },
  fr: { hero: '', identity: 'identite', timeline: 'execution', projects: 'systemes', discipline: 'optimisation' },
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

/** `/it/sistemi` → `projects`. The slug is resolved against the locale written in the path. */
export function viewFromPath(pathname: string): ViewId | null {
  const [, locale, slug] = pathname.split('/');
  if (!isLocale(locale)) return null;
  return viewFromSlug(locale, slug);
}
