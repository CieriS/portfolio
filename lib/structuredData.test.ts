import { describe, expect, it } from 'vitest';
import { getPortfolioBundle } from './portfolio';
import { CASE_STUDY_IDS, caseStudyPath, LOCALES, pathFor, VIEW_IDS } from './routes';
import { absoluteUrl } from './site';
import { buildCaseStudyJsonLd, buildJsonLd } from './structuredData';

/** issue #125: the schema.org graph of every page, checked on the values search engines use. */
type Node = Record<string, unknown> & { '@type': string; '@id'?: string };
const graph = (ld: Record<string, unknown>) => ld['@graph'] as Node[];
const types = (ld: Record<string, unknown>) => graph(ld).map((node) => node['@type']);
const byType = (ld: Record<string, unknown>, type: string) => graph(ld).find((node) => node['@type'] === type);

const { shared } = getPortfolioBundle();
const siteUrl = absoluteUrl('/');

describe('buildJsonLd', () => {
  const pages = LOCALES.flatMap((locale) => VIEW_IDS.map((view) => ({ locale, view })));

  it.each(pages)('$locale/$view has the expected node types', ({ locale, view }) => {
    const ld = buildJsonLd(locale, view);
    expect(ld['@context']).toBe('https://schema.org');
    const expected = ['WebSite', 'Person', 'ProfilePage'];
    if (view !== 'hero') expected.push('BreadcrumbList');
    if (view === 'projects') expected.push('ItemList');
    expect(types(ld)).toEqual(expected);
  });

  it.each(pages)('$locale/$view links its nodes by id and points at its own URL', ({ locale, view }) => {
    const ld = buildJsonLd(locale, view);
    const pageUrl = absoluteUrl(pathFor(locale, view));
    const page = byType(ld, 'ProfilePage')!;
    expect(page).toMatchObject({ url: pageUrl, inLanguage: locale, mainEntity: { '@id': `${siteUrl}#person` } });
    expect(byType(ld, 'Person')).toMatchObject({ '@id': `${siteUrl}#person`, url: siteUrl, name: shared.name });
    expect(byType(ld, 'WebSite')).toMatchObject({ '@id': `${siteUrl}#website`, inLanguage: [...LOCALES] });
    if (view !== 'hero') {
      expect(page.breadcrumb).toEqual({ '@id': `${pageUrl}#breadcrumb` });
      const items = byType(ld, 'BreadcrumbList')!.itemListElement as { item: string }[];
      expect(items.map((entry) => entry.item)).toEqual([absoluteUrl(pathFor(locale, 'hero')), pageUrl]);
    }
  });

  it('keeps the Person URL at the bare origin in every language', () => {
    const urls = new Set(LOCALES.map((locale) => byType(buildJsonLd(locale, 'identity'), 'Person')!.url));
    expect([...urls]).toEqual([siteUrl]);
  });

  it('lists every project, linking the code only for a public one', () => {
    const list = byType(buildJsonLd('en', 'projects'), 'ItemList')!.itemListElement as { item: Record<string, unknown> }[];
    expect(list).toHaveLength(shared.projects.length);
    shared.projects.forEach((project, index) => {
      const { item } = list[index];
      expect(item['@type']).toBe('SoftwareSourceCode');
      expect(item.name).toBe(project.name);
      if (project.source.visibility === 'public') expect(item.codeRepository).toBe(project.source.url);
      else expect(item).not.toHaveProperty('codeRepository');
    });
  });
});

describe('buildCaseStudyJsonLd', () => {
  const pages = LOCALES.flatMap((locale) => CASE_STUDY_IDS.map((id) => ({ locale, id })));

  it.each(pages)('$locale/$id is an article about the project, under the projects view', ({ locale, id }) => {
    const ld = buildCaseStudyJsonLd(locale, id);
    const pageUrl = absoluteUrl(caseStudyPath(locale, id));
    expect(types(ld)).toEqual(['Person', 'TechArticle', 'BreadcrumbList']);
    expect(byType(ld, 'TechArticle')).toMatchObject({
      '@id': `${pageUrl}#article`,
      url: pageUrl,
      inLanguage: locale,
      author: { '@id': `${siteUrl}#person` },
      about: { '@type': 'SoftwareSourceCode' },
    });
    const items = byType(ld, 'BreadcrumbList')!.itemListElement as { item: string }[];
    expect(items.map((entry) => entry.item)).toEqual([
      absoluteUrl(pathFor(locale, 'hero')),
      absoluteUrl(pathFor(locale, 'projects')),
      pageUrl,
    ]);
  });

  it('never links the code of a private project', () => {
    for (const id of CASE_STUDY_IDS) {
      const about = byType(buildCaseStudyJsonLd('en', id), 'TechArticle')!.about as Record<string, unknown>;
      const project = shared.projects.find((item) => item.name === about.name);
      if (project?.source.visibility !== 'public') expect(about, id).not.toHaveProperty('codeRepository');
    }
  });
});
