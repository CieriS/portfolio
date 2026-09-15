import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { SceneLayer } from '@/components/scene/SceneLayer';
import { routing } from '@/i18n/routing';
import { getPortfolioBundle } from '@/lib/portfolio';
import { IS_INDEXABLE, SITE_URL } from '@/lib/site';
import '../globals.css';

const sans = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' });
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' });
const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f3f2ee' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0b0b' },
  ],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Site-wide defaults; each page adds its own title, description, canonical, hreflang and Open Graph.
export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const { name } = getPortfolioBundle().shared;
  const googleVerification = process.env.GOOGLE_SITE_VERIFICATION;

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t('title'), template: `%s — ${t('siteName')}` },
    description: t('description'),
    applicationName: t('siteName'),
    authors: [{ name, url: SITE_URL }],
    creator: name,
    publisher: name,
    formatDetection: { email: false, address: false, telephone: false },
    robots: IS_INDEXABLE
      ? {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
        }
      : { index: false, follow: false },
    ...(googleVerification ? { verification: { google: googleVerification } } : {}),
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${sans.variable} ${mono.variable} ${serif.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {/* Persistent layer: lives above every view swap, never unmounted by AnimatePresence. */}
          <SceneLayer />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
