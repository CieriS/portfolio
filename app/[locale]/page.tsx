import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { PortfolioPage } from '@/components/seo/PortfolioPage';
import { routing } from '@/i18n/routing';
import { buildViewMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  return hasLocale(routing.locales, locale) ? buildViewMetadata(locale, 'hero') : {};
}

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return <PortfolioPage locale={locale} view="hero" />;
}
