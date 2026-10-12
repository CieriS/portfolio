import { describe, expect, it } from 'vitest';
import {
  CASE_STUDY_IDS,
  caseStudyPath,
  isCaseStudyId,
  LOCALES,
  pathFor,
  projectPath,
  VIEW_IDS,
  VIEW_SLUGS,
  viewFromPath,
  viewFromSlug,
} from './routes';

describe('pathFor', () => {
  it('puts the hero at the locale root and inner views under their slug', () => {
    expect(pathFor('it', 'hero')).toBe('/it');
    expect(pathFor('it', 'projects')).toBe('/it/sistemi');
    expect(pathFor('fr', 'discipline')).toBe('/fr/optimisation');
    expect(pathFor('de', 'timeline')).toBe('/de/ausfuehrung');
  });
});

describe('slugs', () => {
  it('are unique within each locale, so every URL maps back to one view', () => {
    for (const locale of LOCALES) {
      const slugs = VIEW_IDS.map((view) => VIEW_SLUGS[locale][view]);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });

  it('round-trip through pathFor and viewFromPath for every page', () => {
    for (const locale of LOCALES) {
      for (const view of VIEW_IDS) expect(viewFromPath(pathFor(locale, view))).toBe(view);
    }
  });
});

describe('viewFromSlug', () => {
  it('treats a missing slug as the hero', () => {
    expect(viewFromSlug('en', undefined)).toBe('hero');
  });

  it('rejects a slug from another locale', () => {
    expect(viewFromSlug('en', 'sistemi')).toBeNull();
  });
});

describe('viewFromPath', () => {
  it('rejects unknown locales and slugs', () => {
    expect(viewFromPath('/de/systems')).toBeNull();
    expect(viewFromPath('/en/nope')).toBeNull();
  });
});

describe('case studies', () => {
  it('live one level below the projects view of each locale', () => {
    expect(caseStudyPath('it', 'yourfinance')).toBe('/it/sistemi/yourfinance');
    expect(caseStudyPath('de', 'yourfinance')).toBe('/de/systeme/yourfinance');
  });

  it('are recognised by id, and nothing else is', () => {
    for (const id of CASE_STUDY_IDS) expect(isCaseStudyId(id)).toBe(true);
    expect(isCaseStudyId('ariaer')).toBe(false);
    expect(isCaseStudyId(undefined)).toBe(false);
  });

  it('do not shadow a view: the page keeps resolving its own view', () => {
    expect(viewFromPath('/it/sistemi/yourfinance')).toBe('projects');
  });
});

describe('projectPath', () => {
  it('leads to the case study when the project has one', () => {
    expect(projectPath('it', 'yourfinance')).toBe('/it/sistemi/yourfinance');
  });

  it('otherwise names the project as a fragment of the projects view', () => {
    expect(projectPath('en', 'ariaer')).toBe('/en/systems#ariaer');
    expect(projectPath('de', 'ariaer')).toBe('/de/systeme#ariaer');
    // The fragment is not part of the path: the address still resolves to the projects view.
    expect(viewFromPath(new URL(projectPath('fr', 'ariaer'), 'https://example.com').pathname)).toBe('projects');
  });
});
