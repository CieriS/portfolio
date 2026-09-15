import type { Locale } from '@/i18n/routing';
import type { UiMessages } from '@/lib/portfolio';

export const VIEW_IDS = ['hero', 'identity', 'timeline', 'projects', 'discipline'] as const;

export type ViewId = (typeof VIEW_IDS)[number];

/** Localized URL segment per view; the hero lives at the locale root. */
export const VIEW_SLUGS: Record<Locale, Record<ViewId, string>> = {
  en: { hero: '', identity: 'identity', timeline: 'execution', projects: 'systems', discipline: 'optimization' },
  it: { hero: '', identity: 'identita', timeline: 'esecuzione', projects: 'sistemi', discipline: 'ottimizzazione' },
};

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
  if (locale !== 'en' && locale !== 'it') return null;
  return viewFromSlug(locale, slug);
}

/** Mirrors the server title template (`%s — siteName`, hero absolute) for client-side view swaps. */
export function documentTitle(meta: UiMessages['meta'], view: ViewId): string {
  const { title } = meta.views[view];
  return view === 'hero' ? title : `${title} — ${meta.siteName}`;
}
