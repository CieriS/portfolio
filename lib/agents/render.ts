/**
 * Server glue: binds the validated content to the pure renderers. Imported only by the route
 * handlers under `app/`, never by a client component (bundle rule in `lib/importGraph.ts`).
 */
import { getCaseStudy } from '../caseStudy';
import { getPortfolioBundle } from '../portfolio';
import { CASE_STUDY_IDS, VIEW_IDS, type Locale } from '../routes';
import { SITE_URL } from '../site';
import { joinPages } from './fullText';
import { buildLlmsTxt } from './llmsTxt';
import { renderCaseStudyMarkdown, renderViewMarkdown, type Site } from './markdown';
import type { MarkdownPage } from './paths';

function site(locale: Locale): Site {
  const { shared, contents } = getPortfolioBundle();
  return { shared, content: contents[locale], locale, siteUrl: SITE_URL };
}

export function renderPage(page: MarkdownPage): string {
  const context = site(page.locale);
  if (!('study' in page)) return renderViewMarkdown(context, page.view);
  const { data, copy } = getCaseStudy(page.study);
  const project = context.shared.projects.find((item) => item.id === data.project);
  return renderCaseStudyMarkdown(context, { id: page.study, data, copy: copy[page.locale], project });
}

/** Home, identity, timeline, projects, then each case study. */
export function renderFullText(locale: Locale): string {
  return joinPages([
    ...VIEW_IDS.map((view) => renderPage({ locale, view })),
    ...CASE_STUDY_IDS.map((study) => renderPage({ locale, study })),
  ]);
}

export function renderLlmsTxt(): string {
  const { shared, contents } = getPortfolioBundle();
  return buildLlmsTxt(shared, contents.en, SITE_URL);
}

/** Headers of every agent file. `noindex` keeps search engines on the HTML page (#173). */
export function agentHeaders(contentType: 'text/plain' | 'text/markdown', indexable: boolean): HeadersInit {
  return {
    'Content-Type': `${contentType}; charset=utf-8`,
    ...(indexable ? {} : { 'X-Robots-Tag': 'noindex' }),
  };
}
