import { z } from 'zod';
import ariaer from '@/data/case-studies/ariaer.json';
import yourfinance from '@/data/case-studies/yourfinance.json';
import { CASE_STUDY_IDS, LOCALES, type CaseStudyId, type Locale } from '@/lib/routes';

/**
 * Case studies: one JSON file per project, holding the language-independent structure and the
 * copy in every language. Kept out of `data/locales`, which ships to the browser with every
 * page: this content is read only by the server-rendered case-study route.
 *
 * Checked like the rest of the content (see `lib/portfolio.ts`): the structure is parsed with
 * zod, every locale has the shape of the English copy, and the cross-checks below catch what
 * types cannot. A broken edit fails the build.
 */
const id = z.string().min(1);

export const CaseStudySchema = z.object({
  project: id,
  stack: z.array(id).min(1),
  /** Rows from the outside in: each row depends only on the rows below it. */
  crates: z.array(z.array(z.object({ id, name: id })).min(1)).min(1),
  flow: z.array(id).min(1),
  decisions: z.array(id).min(1),
  measures: z.array(z.object({ id, query: id, before: id, after: id })),
  screens: z.array(z.object({ id, device: z.enum(['desktop', 'phone']) })).min(1),
  /** Results the project publishes itself, read in the browser (`lib/liveResults.ts`). */
  live: z.object({ source: z.string().url(), municipality: id }).optional(),
});

export type CaseStudyData = z.infer<typeof CaseStudySchema>;
type Copy = (typeof yourfinance)['copy']['en'];
/**
 * The copy of one language. The keyed maps are typed by string rather than by the ids of the
 * first case study, so another study can name its own crates, steps and screens; the
 * cross-checks below make sure every id has its entry.
 */
export type CaseStudyCopy = Omit<Copy, 'architecture' | 'flow' | 'decisions' | 'measures' | 'screens'> & {
  architecture: Omit<Copy['architecture'], 'crates'> & { crates: Record<string, string> };
  flow: Omit<Copy['flow'], 'steps'> & { steps: Record<string, { actor: string; text: string }> };
  decisions: Omit<Copy['decisions'], 'items'> & { items: Record<string, { title: string; body: string }> };
  measures: Omit<Copy['measures'], 'rows'> & { rows: Record<string, string> };
  screens: Omit<Copy['screens'], 'items'> & { items: Record<string, { alt: string; caption: string }> };
  live?: LiveCopy;
};

/** Copy of the live results section; `{date}` is replaced by the date of the data. */
export type LiveCopy = {
  title: string;
  intro: string;
  exceedances: { title: string; caption: string; allowed: string };
  trend: { title: string; caption: string };
  loading: string;
  error: string;
  updated: string;
  stale: string;
  credits: string;
};
export type CaseStudy = { data: CaseStudyData; copy: Record<Locale, CaseStudyCopy> };

/** The slice of the copy that the cross-checks read; structural, so tests can pass small fixtures. */
export type CaseStudyCopyUnderCheck = {
  meta: { description: string };
  title: string;
  titleEmphasis: string;
  architecture: { crates: Record<string, string> };
  flow: { steps: Record<string, unknown> };
  decisions: { items: Record<string, unknown> };
  measures: { rows: Record<string, string> };
  screens: { items: Record<string, { alt: string }> };
  live?: unknown;
};

/** Google shows about this many characters of a meta description. */
export const MAX_DESCRIPTION = 160;

/** Copy keyed by ids of the structure, in every language; returns every problem at once. */
export function findCaseStudyIssues(data: CaseStudyData, copy: Record<string, CaseStudyCopyUnderCheck>): string[] {
  const issues: string[] = [];
  for (const locale of LOCALES) {
    const text = copy[locale];
    if (!text) {
      issues.push(`${locale}: no copy`);
      continue;
    }
    const need = (label: string, keys: Record<string, unknown>, ids: string[]) => {
      for (const key of ids) if (!Object.hasOwn(keys, key)) issues.push(`${locale}.${label} has no entry for "${key}"`);
    };
    need(
      'architecture.crates',
      text.architecture.crates,
      data.crates.flat().map((crate) => crate.id),
    );
    need('flow.steps', text.flow.steps, data.flow);
    need('decisions.items', text.decisions.items, data.decisions);
    need(
      'measures.rows',
      text.measures.rows,
      data.measures.map((measure) => measure.id),
    );
    need(
      'screens.items',
      text.screens.items,
      data.screens.map((screen) => screen.id),
    );
    for (const screen of data.screens) {
      if (text.screens.items[screen.id]?.alt.trim() === '') issues.push(`${locale}.screens.items.${screen.id} has an empty alt`);
    }
    if (data.live && !text.live) issues.push(`${locale}.live is missing`);
    if (!text.title.includes(text.titleEmphasis)) issues.push(`${locale}.titleEmphasis does not occur in the title`);
    if (text.meta.description.length > MAX_DESCRIPTION) {
      issues.push(`${locale}.meta.description is longer than ${MAX_DESCRIPTION} characters`);
    }
  }
  return issues;
}

function load(raw: { copy: Record<Locale, CaseStudyCopy> }): CaseStudy {
  const data = CaseStudySchema.parse(raw);
  const issues = findCaseStudyIssues(data, raw.copy);
  if (issues.length > 0) throw new Error(`Invalid case study "${data.project}":\n- ${issues.join('\n- ')}`);
  return { data, copy: raw.copy };
}

const CASE_STUDIES: Record<CaseStudyId, CaseStudy> = { yourfinance: load(yourfinance), ariaer: load(ariaer) };

for (const key of CASE_STUDY_IDS) {
  if (CASE_STUDIES[key].data.project !== key)
    throw new Error(`Case study "${key}" describes project "${CASE_STUDIES[key].data.project}"`);
}

export function getCaseStudy(key: CaseStudyId): CaseStudy {
  return CASE_STUDIES[key];
}
