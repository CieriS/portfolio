import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { languageAlternates } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import { pathFor, VIEW_IDS } from '@/lib/views';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routing.locales.flatMap((locale) =>
    VIEW_IDS.map((view) => ({
      url: absoluteUrl(pathFor(locale, view)),
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: view === 'hero' ? 1 : 0.8,
      alternates: { languages: languageAlternates(view) },
    })),
  );
}
