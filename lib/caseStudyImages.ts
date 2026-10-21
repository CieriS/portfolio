import type { StaticImageData } from 'next/image';
import exceedances from '@/data/case-studies/ariaer/exceedances.webp';
import lineage from '@/data/case-studies/ariaer/lineage.webp';
import traffic from '@/data/case-studies/ariaer/traffic.webp';
import dashboard from '@/data/case-studies/yourfinance/dashboard.webp';
import movements from '@/data/case-studies/yourfinance/movements-phone.webp';
import statistics from '@/data/case-studies/yourfinance/statistics.webp';
import type { CaseStudyId } from '@/lib/routes';

/**
 * Screenshots of each case study, keyed by the screen ids of its JSON file. Static imports,
 * so Next knows their size at build time and serves resized, cached variants. Apart from
 * `lib/caseStudy.ts` because only the bundler understands an image import.
 */
export const CASE_STUDY_IMAGES: Record<CaseStudyId, Record<string, StaticImageData>> = {
  yourfinance: { dashboard, statistics, movements },
  ariaer: { exceedances, traffic, lineage },
};
