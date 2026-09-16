import type { Metadata } from 'next';
import { routing, type Locale } from '@/i18n/routing';
import { getPortfolioBundle } from '@/lib/portfolio';
import { absoluteUrl } from '@/lib/site';
import { pathFor, type ViewId } from '@/lib/views';

const OG_LOCALE: Record<Locale, string> = { en: 'en_US', it: 'it_IT', fr: 'fr_FR' };

/** hreflang map for one view: every locale plus x-default (auto-detecting root for the hero, English otherwise). */
export function languageAlternates(view: ViewId): Record<string, string> {
  return {
    ...Object.fromEntries(routing.locales.map((locale) => [locale, absoluteUrl(pathFor(locale, view))])),
    'x-default': view === 'hero' ? absoluteUrl('/') : absoluteUrl(pathFor(routing.defaultLocale, view)),
  };
}

export function buildViewMetadata(locale: Locale, view: ViewId): Metadata {
  const { shared, contents } = getPortfolioBundle();
  const meta = contents[locale].ui.meta;
  const { title, description } = meta.views[view];
  const url = absoluteUrl(pathFor(locale, view));
  const [firstName, ...lastName] = shared.name.split(' ');

  return {
    title: view === 'hero' ? { absolute: title } : title,
    description,
    alternates: { canonical: url, languages: languageAlternates(view) },
    openGraph: {
      type: 'profile',
      firstName,
      lastName: lastName.join(' '),
      username: shared.handle,
      url,
      siteName: meta.siteName,
      title,
      description,
      locale: OG_LOCALE[locale],
      alternateLocale: routing.locales.filter((other) => other !== locale).map((other) => OG_LOCALE[other]),
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}
