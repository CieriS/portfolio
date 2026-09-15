import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { PortfolioPage } from '@/components/seo/PortfolioPage';
import { routing, type Locale } from '@/i18n/routing';
import { buildViewMetadata } from '@/lib/seo';
import { VIEW_IDS, VIEW_SLUGS, viewFromSlug, type ViewId } from '@/lib/views';

// Every localized slug is prerendered; unknown ones reach the page and hit notFound(),
// which renders the branded [locale]/not-found (with noindex) instead of Next's bare 404.
export function generateStaticParams({ params }: { params: { locale: string } }) {
  const locale = hasLocale(routing.locales, params.locale) ? params.locale : routing.defaultLocale;
  return VIEW_IDS.filter((id) => id !== 'hero').map((id) => ({ view: VIEW_SLUGS[locale][id] }));
}

async function resolve(params: PageProps<'/[locale]/[view]'>['params']): Promise<{ locale: Locale; view: ViewId } | null> {
  const { locale, view: slug } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  const view = viewFromSlug(locale, slug);
  return view && view !== 'hero' ? { locale, view } : null;
}

export async function generateMetadata({ params }: PageProps<'/[locale]/[view]'>): Promise<Metadata> {
  const resolved = await resolve(params);
  return resolved ? buildViewMetadata(resolved.locale, resolved.view) : {};
}

export default async function ViewPage({ params }: PageProps<'/[locale]/[view]'>) {
  const resolved = await resolve(params);
  if (!resolved) notFound();
  setRequestLocale(resolved.locale);

  return <PortfolioPage locale={resolved.locale} view={resolved.view} />;
}
