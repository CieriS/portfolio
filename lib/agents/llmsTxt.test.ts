import { describe, expect, it } from 'vitest';
import { getPortfolioBundle } from '../portfolio';
import { CASE_STUDY_IDS, caseStudyPath, LOCALES, pathFor, VIEW_IDS } from '../routes';
import { buildLlmsTxt } from './llmsTxt';
import { fullTextPath } from './paths';

const { shared, contents } = getPortfolioBundle();
const SITE_URL = 'https://example.test';
const text = buildLlmsTxt(shared, contents.en, SITE_URL);
const links = [...text.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((match) => match[1]!);

describe('buildLlmsTxt', () => {
  it('starts with the name, with exactly one H1 and one blockquote', () => {
    expect(text.startsWith(`# ${shared.name}\n`)).toBe(true);
    expect(text.match(/^# /gm)).toHaveLength(1);
    expect(text.match(/^> /gm)).toHaveLength(1);
    expect(text).toContain(contents.en.hero.seeking);
  });

  it('links every view and every case study with an absolute URL on the site', () => {
    for (const view of VIEW_IDS) expect(links).toContain(`${SITE_URL}${pathFor('en', view)}`);
    for (const id of CASE_STUDY_IDS) expect(links).toContain(`${SITE_URL}${caseStudyPath('en', id)}`);
  });

  it('links only routes of lib/routes.ts or the agent files, never a hand-written path', () => {
    const known = new Set([
      ...LOCALES.flatMap((locale) => [
        ...VIEW_IDS.map((view) => pathFor(locale, view)),
        ...CASE_STUDY_IDS.map((id) => caseStudyPath(locale, id)),
        fullTextPath(locale),
      ]),
      `${pathFor('en', 'identity')}#contacts`,
    ]);
    for (const link of links.filter((url) => url.startsWith(SITE_URL))) {
      expect(known, link).toContain(link.slice(SITE_URL.length));
    }
  });

  it('gives a private project no repository link', () => {
    const priv = {
      ...shared,
      projects: shared.projects.map((project) => ({ ...project, source: { visibility: 'private' as const } })),
    };
    const output = buildLlmsTxt({ ...priv, contacts: [] }, contents.en, SITE_URL);
    expect(output).not.toContain('github.com');
    expect(output).toContain(contents.en.projects.labels.private);
  });

  it('carries no e-mail address or phone number', () => {
    expect(text).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/);
    expect(text).not.toMatch(/\+?\d[\d ()-]{7,}\d/);
  });

  it('follows a project summary edit at the next build', () => {
    const edited = structuredClone(contents.en);
    edited.projects.items.ariaer.teaser = 'Edited teaser.';
    expect(buildLlmsTxt(shared, edited, SITE_URL)).toContain('Edited teaser.');
  });

  it('stays short', () => {
    expect(new TextEncoder().encode(text).length).toBeLessThan(3 * 1024);
  });
});
