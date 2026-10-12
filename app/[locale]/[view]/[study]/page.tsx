import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { CaseStudyPage } from '@/components/case-study/CaseStudyPage';
import { routing, type Locale } from '@/i18n/routing';
import { buildCaseStudyMetadata } from '@/lib/seo';
import { CASE_STUDY_IDS, isCaseStudyId, VIEW_SLUGS, viewFromSlug, type CaseStudyId } from '@/lib/views';

// A case study lives one level below the projects view, under that view's localized slug:
// only the locale comes from a parent layout, so this returns the view segment too.
// Anything else reaches the page and hits notFound(), like an unknown view slug does.
export function generateStaticParams({ params }: { params: { locale: string } }) {
  const locale = hasLocale(routing.locales, params.locale) ? params.locale : routing.defaultLocale;
  return CASE_STUDY_IDS.map((study) => ({ view: VIEW_SLUGS[locale].projects, study }));
}

type Params = PageProps<'/[locale]/[view]/[study]'>['params'];

async function resolve(params: Params): Promise<{ locale: Locale; id: CaseStudyId } | null> {
  const { locale, view, study } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  return viewFromSlug(locale, view) === 'projects' && isCaseStudyId(study) ? { locale, id: study } : null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const resolved = await resolve(params);
  return resolved ? buildCaseStudyMetadata(resolved.locale, resolved.id) : {};
}

export default async function CaseStudyRoute({ params }: { params: Params }) {
  const resolved = await resolve(params);
  if (!resolved) notFound();
  setRequestLocale(resolved.locale);

  return <CaseStudyPage locale={resolved.locale} id={resolved.id} />;
}
