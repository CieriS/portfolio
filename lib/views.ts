import type { UiMessages } from '@/lib/portfolio';
import type { ViewId } from '@/lib/routes';

export {
  CASE_STUDY_IDS,
  caseStudyPath,
  isCaseStudyId,
  pathFor,
  VIEW_IDS,
  VIEW_SLUGS,
  viewFromPath,
  viewFromSlug,
  type CaseStudyId,
  type ViewId,
} from '@/lib/routes';

/** Mirrors the server title template (`%s — siteName`, hero absolute) for client-side view swaps. */
export function documentTitle(meta: UiMessages['meta'], view: ViewId): string {
  const { title } = meta.views[view];
  return view === 'hero' ? title : `${title} — ${meta.siteName}`;
}
