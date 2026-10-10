import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { getPortfolioBundle } from '@/lib/portfolio';
import { THEME } from '@/lib/theme';

export default function manifest(): MetadataRoute.Manifest {
  const meta = getPortfolioBundle().contents[routing.defaultLocale].ui.meta;

  return {
    id: '/',
    name: meta.title,
    short_name: meta.siteName,
    description: meta.description,
    lang: routing.defaultLocale,
    dir: 'ltr',
    // Left unprefixed on purpose: `/` runs the middleware's language detection.
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: THEME.dark.paper,
    theme_color: THEME.dark.paper,
    icons: [
      { src: '/icon.png', sizes: '512x512', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
