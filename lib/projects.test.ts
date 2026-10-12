import { describe, expect, it } from 'vitest';
import { getCaseStudy } from './caseStudy';
import { ProjectSchema } from './content/schema';
import { getPortfolioBundle } from './portfolio';
import { releaseUrl, versionLabel } from './projects';
import { CASE_STUDY_IDS, LOCALES } from './routes';

const open = { visibility: 'public' as const, url: 'https://example.com/me/tool' };

describe('versionLabel', () => {
  it('prefixes the version, and says nothing when there is none', () => {
    expect(versionLabel({ version: '0.9.0' })).toBe('v0.9.0');
    expect(versionLabel({})).toBeNull();
  });
});

describe('releaseUrl', () => {
  it('points at the tag of a public repository, with or without a trailing slash', () => {
    expect(releaseUrl({ source: open, version: '1.2.3' })).toBe('https://example.com/me/tool/releases/tag/v1.2.3');
    expect(releaseUrl({ source: { ...open, url: `${open.url}/` }, version: '1.2.3' })).toBe(
      'https://example.com/me/tool/releases/tag/v1.2.3',
    );
  });

  it('gives no address for a private project or for an unreleased one', () => {
    expect(releaseUrl({ source: { visibility: 'private' }, version: '1.2.3' })).toBeNull();
    expect(releaseUrl({ source: open })).toBeNull();
  });
});

describe('project versions', () => {
  const base = { id: 'x', name: 'X', source: open, stack: ['Rust'], layers: [{ id: 'a', tech: 'Rust' }] };

  it('are optional and must be MAJOR.MINOR.PATCH, without the leading v', () => {
    expect(ProjectSchema.safeParse(base).success).toBe(true);
    expect(ProjectSchema.safeParse({ ...base, version: '0.9.0' }).success).toBe(true);
    for (const version of ['v0.9.0', '0.9', '1.0.0-beta', '']) {
      expect(ProjectSchema.safeParse({ ...base, version }).success, version).toBe(false);
    }
  });

  it.each(CASE_STUDY_IDS)('the case study of %s states the same version as the project', (id) => {
    const { data, copy } = getCaseStudy(id);
    const project = getPortfolioBundle().shared.projects.find((item) => item.id === data.project);
    expect(project?.version).toBeDefined();
    for (const locale of LOCALES) expect(copy[locale].facts.version.value, locale).toContain(project?.version);
  });
});

describe('aria-er', () => {
  const { shared, contents } = getPortfolioBundle();
  const project = shared.projects.find((item) => item.id === 'ariaer');
  // How each language says that the Google Cloud run has not happened yet.
  const pending = { en: 'still to do', it: 'ancora da fare', fr: 'reste à faire', de: 'steht noch aus' };

  it('declares a released version and links it to the tag in its own repository', () => {
    expect(project?.source.visibility).toBe('public');
    expect(project?.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(project && releaseUrl(project)).toBe(`https://github.com/CieriS/aria-er/releases/tag/v${project?.version}`);
  });

  it.each(LOCALES)('%s: the entry and the version tell the same story about the cloud run', (locale) => {
    // 1.0.0 is the version that has run on Google Cloud: before it the entry says the run is
    // pending, from it on that sentence has to go. Bumping the number alone fails here.
    const released = Number(project?.version?.split('.')[0]) >= 1;
    const summary = contents[locale].projects.items.ariaer.summary;
    expect(summary.includes(pending[locale]), summary).toBe(!released);
  });
});
