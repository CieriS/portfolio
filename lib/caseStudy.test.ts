import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  CaseStudySchema,
  findCaseStudyIssues,
  getCaseStudy,
  MAX_DESCRIPTION,
  type CaseStudyCopyUnderCheck,
  type CaseStudyData,
} from './caseStudy';
import { CASE_STUDY_IMAGES } from './caseStudyImages';
import { getPortfolioBundle } from './portfolio';
import { CASE_STUDY_IDS, LOCALES } from './routes';

const data: CaseStudyData = {
  project: 'demo',
  stack: ['Rust'],
  crates: [[{ id: 'api', name: 'demo-api' }], [{ id: 'domain', name: 'demo-domain' }]],
  flow: ['client'],
  decisions: ['integrity'],
  measures: [{ id: 'query', query: 'q', before: '2 ms', after: '1 ms' }],
  screens: [{ id: 'home', device: 'desktop' }],
};

const text: CaseStudyCopyUnderCheck = {
  meta: { description: 'Short enough.' },
  title: 'A plain title',
  titleEmphasis: 'plain',
  architecture: { crates: { api: 'HTTP', domain: 'Rules' } },
  flow: { steps: { client: {} } },
  decisions: { items: { integrity: {} } },
  measures: { rows: { query: 'A query' } },
  screens: { items: { home: { alt: 'The home screen' } } },
};

const everywhere = (copy: CaseStudyCopyUnderCheck) => Object.fromEntries(LOCALES.map((locale) => [locale, copy]));

describe('findCaseStudyIssues', () => {
  it('accepts copy that covers every id of the structure in every language', () => {
    expect(findCaseStudyIssues(data, everywhere(text))).toEqual([]);
  });

  it('reports a language with no copy', () => {
    const withoutGerman = Object.fromEntries(LOCALES.filter((locale) => locale !== 'de').map((locale) => [locale, text]));
    expect(findCaseStudyIssues(data, withoutGerman)).toEqual(['de: no copy']);
  });

  it('reports every id left without copy, with its path', () => {
    const broken = {
      ...text,
      architecture: { crates: { api: 'HTTP' } },
      flow: { steps: {} },
      decisions: { items: {} },
      measures: { rows: {} },
      screens: { items: {} },
    };
    expect(findCaseStudyIssues(data, { ...everywhere(text), it: broken })).toEqual([
      'it.architecture.crates has no entry for "domain"',
      'it.flow.steps has no entry for "client"',
      'it.decisions.items has no entry for "integrity"',
      'it.measures.rows has no entry for "query"',
      'it.screens.items has no entry for "home"',
    ]);
  });

  it('reports an emphasis that is not in the title, an empty alt and an overlong description', () => {
    const broken = {
      ...text,
      titleEmphasis: 'missing',
      meta: { description: 'x'.repeat(MAX_DESCRIPTION + 1) },
      screens: { items: { home: { alt: '  ' } } },
    };
    expect(findCaseStudyIssues(data, { ...everywhere(text), fr: broken })).toEqual([
      'fr.screens.items.home has an empty alt',
      'fr.titleEmphasis does not occur in the title',
      `fr.meta.description is longer than ${MAX_DESCRIPTION} characters`,
    ]);
  });
});

describe('live results copy', () => {
  it('is required in every language when the structure declares a source', () => {
    const live = {
      ...data,
      live: { source: 'https://example.github.io/data/v1/', page: 'https://example.github.io/', municipality: 'BOLOGNA' },
    };
    expect(findCaseStudyIssues(live, { ...everywhere({ ...text, live: {} }), es: text })).toEqual(['es.live is missing']);
    expect(findCaseStudyIssues(data, everywhere(text))).toEqual([]);
  });
});

describe('CaseStudySchema', () => {
  it('rejects an unknown device and an empty dependency row', () => {
    expect(CaseStudySchema.safeParse({ ...data, screens: [{ id: 'home', device: 'watch' }] }).success).toBe(false);
    expect(CaseStudySchema.safeParse({ ...data, crates: [[]] }).success).toBe(false);
    expect(CaseStudySchema.safeParse(data).success).toBe(true);
  });
});

describe.each(CASE_STUDY_IDS)('case study %s', (id) => {
  const study = getCaseStudy(id);

  it('describes a project of the portfolio', () => {
    expect(getPortfolioBundle().shared.projects.map((project) => project.id)).toContain(study.data.project);
  });

  it('has an image for every screen, and the file is in the repository', () => {
    for (const screen of study.data.screens) expect(Object.keys(CASE_STUDY_IMAGES[id]), screen.id).toContain(screen.id);
    const files = readdirSync(fileURLToPath(new URL(`../data/case-studies/${id}/`, import.meta.url)));
    expect(files.filter((file) => file.endsWith('.webp'))).toHaveLength(study.data.screens.length);
  });

  it('names no repository: the page links to it only from the project data', () => {
    expect(JSON.stringify(study)).not.toMatch(/github\.com|your-finance/);
  });

  it.each(LOCALES)('states its facts and its next steps in %s', (locale) => {
    const copy = study.copy[locale];
    expect(Object.keys(copy.facts)).toEqual(Object.keys(study.copy.en.facts));
    expect(copy.next.items.length).toBe(study.copy.en.next.items.length);
    expect(copy.constraints.items.length).toBe(study.copy.en.constraints.items.length);
  });
});
