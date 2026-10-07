import type { Metadata } from 'next';
import { routing, type Locale } from '@/i18n/routing';
import { getPortfolioBundle } from '@/lib/portfolio';
import { absoluteUrl, IS_INDEXABLE } from '@/lib/site';
import { pathFor, type ViewId } from '@/lib/views';

const OG_LOCALE: Record<Locale, string> = { en: 'en_US', it: 'it_IT', fr: 'fr_FR', de: 'de_DE' };

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
    // Set per page rather than in the layout: the not-found boundary inherits layout metadata,
    // and would otherwise carry `index, follow` next to the `noindex` Next adds for it.
    robots: IS_INDEXABLE
      ? {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
        }
      : { index: false, follow: false },
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
