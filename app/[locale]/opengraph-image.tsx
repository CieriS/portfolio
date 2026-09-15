import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { renderOgImage } from '@/lib/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Samuele Cieri — Software Developer & Data Engineering';

// Prerendered at build: no filesystem access at request time on serverless platforms.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return renderOgImage(hasLocale(routing.locales, locale) ? locale : routing.defaultLocale, 'hero');
}
