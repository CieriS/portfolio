import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { getPortfolioBundle } from '@/lib/portfolio';

export default function manifest(): MetadataRoute.Manifest {
  const meta = getPortfolioBundle().contents[routing.defaultLocale].ui.meta;

  return {
    name: meta.title,
    short_name: meta.siteName,
    description: meta.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0b0b',
    theme_color: '#0b0b0b',
    icons: [
      { src: '/icon.png', sizes: '256x256', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
