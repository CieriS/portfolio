import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { OG_ALT, renderOgImage } from '@/lib/og';
import { VIEW_IDS, VIEW_SLUGS, viewFromSlug } from '@/lib/views';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = OG_ALT;

// Prerendered at build for every locale × view slug. Handles both top-down params
// (locale provided by the parent segment) and bottom-up generation.
export function generateStaticParams({ params }: { params?: { locale?: string } } = {}) {
  const parentLocale = params?.locale;
  const locales = parentLocale && hasLocale(routing.locales, parentLocale) ? [parentLocale] : routing.locales;
  return locales.flatMap((locale) =>
    VIEW_IDS.filter((id) => id !== 'hero').map((id) => ({
      ...(parentLocale ? {} : { locale }),
      view: VIEW_SLUGS[locale][id],
    })),
  );
}

export default async function Image({ params }: { params: Promise<{ locale: string; view: string }> }) {
  const { locale: rawLocale, view: slug } = await params;
  const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale;
  return renderOgImage(locale, viewFromSlug(locale, slug) ?? 'hero');
}
