import { describe, expect, it } from 'vitest';
import { LOCALES, pathFor, VIEW_IDS, VIEW_SLUGS, viewFromPath, viewFromSlug } from './routes';

describe('pathFor', () => {
  it('puts the hero at the locale root and inner views under their slug', () => {
    expect(pathFor('it', 'hero')).toBe('/it');
    expect(pathFor('it', 'projects')).toBe('/it/sistemi');
    expect(pathFor('fr', 'discipline')).toBe('/fr/optimisation');
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
