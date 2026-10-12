import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { OG_ALT, renderCaseStudyOgImage, renderOgImage } from '@/lib/og';
import { CASE_STUDY_IDS, isCaseStudyId, VIEW_SLUGS } from '@/lib/views';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = OG_ALT;

// Prerendered for every locale × case study, under the projects slug of that locale. Handles
// both top-down params (given by the parent segments) and bottom-up generation.
export function generateStaticParams({ params }: { params?: { locale?: string; view?: string } } = {}) {
  const parentLocale = params?.locale;
  const locales = parentLocale && hasLocale(routing.locales, parentLocale) ? [parentLocale] : routing.locales;
  return locales.flatMap((locale) => {
    const view = VIEW_SLUGS[locale].projects;
    if (params?.view !== undefined && params.view !== view) return [];
    return CASE_STUDY_IDS.map((study) => ({
      ...(parentLocale ? {} : { locale }),
      ...(params?.view === undefined ? { view } : {}),
      study,
    }));
  });
}

export default async function Image({ params }: { params: Promise<{ locale: string; view: string; study: string }> }) {
  const { locale: rawLocale, study } = await params;
  const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale;
  return isCaseStudyId(study) ? renderCaseStudyOgImage(locale, study) : renderOgImage(locale, 'projects');
}
