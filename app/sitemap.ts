import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { caseStudyAlternates, languageAlternates } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import { CASE_STUDY_IDS, caseStudyPath, pathFor, VIEW_IDS } from '@/lib/views';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routing.locales.flatMap((locale) => [
    ...VIEW_IDS.map((view) => ({
      url: absoluteUrl(pathFor(locale, view)),
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: view === 'hero' ? 1 : 0.8,
      alternates: { languages: languageAlternates(view) },
    })),
    ...CASE_STUDY_IDS.map((id) => ({
      url: absoluteUrl(caseStudyPath(locale, id)),
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: { languages: caseStudyAlternates(id) },
    })),
  ]);
}
