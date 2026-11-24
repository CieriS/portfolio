import { describe, expect, it } from 'vitest';
import { getCaseStudy } from '../caseStudy';
import { getPortfolioBundle } from '../portfolio';
import { CASE_STUDY_IDS, LOCALES, VIEW_IDS, type Locale } from '../routes';
import { isoMonth, isRunning, renderCaseStudyMarkdown, renderViewMarkdown, type Site } from './markdown';

const { shared, contents } = getPortfolioBundle();
const SITE_URL = 'https://example.test';
const site = (locale: Locale, overrides: Partial<Site> = {}): Site => ({
  shared,
  content: contents[locale],
  locale,
  siteUrl: SITE_URL,
  ...overrides,
});
const study = (locale: Locale, id: (typeof CASE_STUDY_IDS)[number]) => {
  const { data, copy } = getCaseStudy(id);
  return { id, data, copy: copy[locale], project: shared.projects.find((item) => item.id === data.project) };
};

/** Every string under `node`, with its dotted path. */
function strings(node: unknown, path = ''): [string, string][] {
  if (typeof node === 'string') return [[path, node]];
  if (typeof node !== 'object' || node === null) return [];
  return Object.entries(node).flatMap(([key, value]) => strings(value, path ? `${path}.${key}` : key));
}

/**
 * Copy the page shows that has no place in a text version, each with its reason. Anything not
 * listed here must appear in the Markdown: a new field on a page without its Markdown fails.
 */
const SKIPPED_VIEW_COPY = [
  /Emphasis$/, // an italic accent inside a title that is rendered whole
  /^hero\.hint$/, // tells the reader to move the cursor over the 3D scene
  /^timeline\.labels\.(thread|uptime|days)$/, // labels of the chart and of a clock-based counter
  /^timeline\.labels\.suspended$/, // shown only for a lane that is not running: tested below with ended lanes
];
const SKIPPED_STUDY_COPY = [
  /Emphasis$/,
  /^meta\.description$/, // the search snippet, not page text
  /^facts\.version\.label$/, // rendered only with a version; covered by its own test
  /^screens\.items\.\w+\.alt$/, // describes the picture; the caption says what it shows
  /^live\.(exceedances\.allowed|loading|error|updated|stale)$/, // states of the charts in the browser
];

const VIEW_KEYS = { hero: 'hero', identity: 'identity', timeline: 'timeline', projects: 'projects' } as const;
const pages = LOCALES.flatMap((locale) => VIEW_IDS.map((view) => ({ locale, view })));
const studies = LOCALES.flatMap((locale) => CASE_STUDY_IDS.map((id) => ({ locale, id })));
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]+/;
const PHONE = /\+?\d[\d ()-]{7,}\d/;

describe('renderViewMarkdown', () => {
  it.each(pages)('$locale/$view contains every string the view shows', ({ locale, view }) => {
    const markdown = renderViewMarkdown(site(locale), view);
    const copy = strings(contents[locale][VIEW_KEYS[view]], VIEW_KEYS[view]).filter(
      ([path]) => !SKIPPED_VIEW_COPY.some((rule) => rule.test(path)),
    );
    expect(copy.length).toBeGreaterThan(0);
    for (const [path, text] of copy) expect(markdown, path).toContain(text);
    expect(markdown).toContain(`# ${contents[locale].ui.meta.views[view].title}\n`);
  });

  it.each(pages)('$locale/$view has one H1, its canonical URL and the source line', ({ locale, view }) => {
    const markdown = renderViewMarkdown(site(locale), view);
    expect(markdown.match(/^# /gm)).toHaveLength(1);
    expect(markdown).toMatch(/\nSource: <https:\/\/example\.test\/[^>]*>\n$/);
  });

  it.each(pages)('$locale/$view has no e-mail address or phone number', ({ locale, view }) => {
    const markdown = renderViewMarkdown(site(locale), view);
    // GitHub handles (`@CieriS`) are not addresses: the regex needs a domain after the @.
    expect(markdown).not.toMatch(EMAIL);
    expect(markdown).not.toMatch(PHONE);
  });

  it('expands every project, and links code only for public sources', () => {
    const markdown = renderViewMarkdown(site('en'), 'projects');
    for (const project of shared.projects) {
      const copy = contents.en.projects.items[project.id as keyof typeof contents.en.projects.items];
      expect(markdown).toContain(`## ${project.name}`);
      for (const highlight of copy.highlights) expect(markdown).toContain(highlight);
      if (project.source.visibility === 'public') expect(markdown).toContain(project.source.url);
    }
    expect(markdown).not.toMatch(/github\.com\/CieriS\/your/i);
  });

  it('never gives a private project a repository link, even with a GitHub profile in the contacts', () => {
    const priv = shared.projects.map((project) => ({ ...project, source: { visibility: 'private' as const } }));
    const markdown = renderViewMarkdown(site('en', { shared: { ...shared, projects: priv } }), 'projects');
    expect(markdown).not.toContain('github.com');
    expect(markdown).toContain(contents.en.projects.labels.private);
  });

  it('writes dates as ISO months and reads "in progress" from the data', () => {
    const markdown = renderViewMarkdown(site('en'), 'timeline');
    const { labels } = contents.en.timeline;
    expect(markdown).not.toMatch(/\d{2}\.\d{2}\.\d{4}/);
    expect(markdown).toMatch(new RegExp(`\\d{4}-\\d{2} — ${labels.now}`));
    const ended = {
      ...shared,
      timeline: {
        threads: shared.timeline.threads.map((thread) => ({ ...thread, segments: [{ start: '2020-01-01', end: '2020-06-01' }] })),
      },
    };
    const done = renderViewMarkdown(site('en', { shared: ended }), 'timeline');
    expect(done).not.toContain(`- ${labels.running}\n`);
    expect(done).toContain(`- ${labels.suspended}\n`);
    expect(done).toContain('2020-01 — 2020-06');
  });

  it('isoMonth and isRunning', () => {
    expect(isoMonth('2021-11-12')).toBe('2021-11');
    expect(isRunning({ segments: [{ start: '2021-01-01', end: null }] })).toBe(true);
    expect(isRunning({ segments: [{ start: '2021-01-01', end: '2022-01-01' }] })).toBe(false);
  });

  it('links the same page in the other four languages', () => {
    const markdown = renderViewMarkdown(site('en'), 'identity');
    for (const path of ['/it/identita.md', '/fr/identite.md', '/de/identitaet.md', '/es/identidad.md']) {
      expect(markdown).toContain(`${SITE_URL}${path}`);
    }
    expect(markdown).not.toContain(`${SITE_URL}/en/identity.md`);
  });
});

describe('renderCaseStudyMarkdown', () => {
  it.each(studies)('$locale/$id contains every string the case study shows', ({ locale, id }) => {
    const input = study(locale, id);
    const markdown = renderCaseStudyMarkdown(site(locale), input);
    const copy = strings(input.copy).filter(([path]) => !SKIPPED_STUDY_COPY.some((rule) => rule.test(path)));
    // A private project shows no "contact" link next to the code (it already leads there).
    const shown = copy.filter(([path]) => !(path === 'access.contact' && input.project?.source.visibility !== 'public'));
    for (const [path, text] of shown) expect(markdown, path).toContain(text);
    if (input.project?.version) expect(markdown).toContain(`${input.copy.facts.version.label}: ${input.project.version}`);
  });

  it.each(studies)('$locale/$id turns the measures into a table, figures from the data', ({ locale, id }) => {
    const input = study(locale, id);
    const markdown = renderCaseStudyMarkdown(site(locale), input);
    for (const row of input.data.measures) expect(markdown).toContain(`| ${row.before} | ${row.after} |`);
    expect(markdown).not.toMatch(EMAIL);
    expect(markdown).not.toMatch(PHONE);
  });

  it('links the repository of a public project and never one of a private project', () => {
    const ariaer = renderCaseStudyMarkdown(site('en'), study('en', 'ariaer'));
    expect(ariaer).toContain('https://github.com/CieriS/aria-er');
    const yourfinance = renderCaseStudyMarkdown(site('en'), study('en', 'yourfinance'));
    expect(yourfinance).not.toContain('github.com');
  });
});
