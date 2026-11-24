import { describe, expect, it } from 'vitest';
import { CASE_STUDY_IDS, caseStudyPath, LOCALES, pathFor, VIEW_IDS } from '../routes';
import {
  agentRewrites,
  fullTextPath,
  internalMarkdownPath,
  markdownKey,
  markdownPages,
  markdownPath,
  pageFromKey,
} from './paths';
import { readFileSync } from 'node:fs';

describe('agent file paths', () => {
  it('has one Markdown page per view and case study in every locale', () => {
    expect(markdownPages()).toHaveLength(LOCALES.length * (VIEW_IDS.length + CASE_STUDY_IDS.length));
  });

  it('appends .md to the page URL, built from lib/routes.ts', () => {
    expect(markdownPath({ locale: 'en', view: 'hero' })).toBe('/en.md');
    expect(markdownPath({ locale: 'it', view: 'projects' })).toBe(`${pathFor('it', 'projects')}.md`);
    expect(markdownPath({ locale: 'en', study: 'yourfinance' })).toBe(`${caseStudyPath('en', 'yourfinance')}.md`);
  });

  it('serves the English full text at the root and the others under their locale', () => {
    expect(fullTextPath('en')).toBe('/llms-full.txt');
    expect(fullTextPath('it')).toBe('/it/llms-full.txt');
  });

  it('round-trips every page through its key and rejects anything else', () => {
    for (const page of markdownPages()) expect(pageFromKey(markdownKey(page))).toEqual(page);
    for (const key of ['', 'xx-hero', 'en', 'en-nope', 'en-study-nope', 'en-hero-extra', 'en-study']) {
      expect(pageFromKey(key)).toBeNull();
    }
  });

  it('rewrites every public address once, to its internal route', () => {
    const rewrites = agentRewrites();
    const sources = rewrites.map((rule) => rule.source);
    expect(new Set(sources).size).toBe(sources.length);
    expect(rewrites).toContainEqual({
      source: '/en/identity.md',
      destination: internalMarkdownPath({ locale: 'en', view: 'identity' }),
    });
    expect(rewrites).toContainEqual({ source: '/llms-full.txt', destination: '/agents/full/en' });
    // Literal paths only: a pattern character would turn a rule into a different route.
    for (const source of sources) expect(source).toMatch(/^[a-z0-9/.-]+$/);
  });

  it('keeps the agent files out of the locale proxy (#172)', () => {
    // Read from the source: importing proxy.ts would pull next-intl's middleware into Vitest.
    const source = readFileSync(new URL('../../proxy.ts', import.meta.url), 'utf8');
    const pattern = /matcher: '(.+)'/.exec(source)?.[1]?.replaceAll('\\\\', '\\');
    expect(pattern).toBeDefined();
    const matcher = new RegExp(`^${pattern}$`);
    for (const path of ['/llms.txt', '/llms-full.txt', '/it/llms-full.txt', '/en/identity.md', '/agents/md/en-hero']) {
      expect(matcher.test(path), path).toBe(false);
    }
    expect(matcher.test('/en/identity')).toBe(true);
  });
});
