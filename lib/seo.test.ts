import { afterEach, describe, expect, it, vi } from 'vitest';
import { CASE_STUDY_IDS, caseStudyPath, LOCALES, pathFor, VIEW_IDS } from './routes';
import { buildCaseStudyMetadata, buildViewMetadata, caseStudyAlternates, languageAlternates } from './seo';
import { absoluteUrl } from './site';

/** issue #125: what search engines read, for every locale and page, without a browser. */
const VIEW_PAGES = LOCALES.flatMap((locale) => VIEW_IDS.map((view) => ({ locale, view })));
const STUDY_PAGES = LOCALES.flatMap((locale) => CASE_STUDY_IDS.map((id) => ({ locale, id })));

const OG_LOCALES = ['en_US', 'it_IT', 'fr_FR', 'de_DE', 'es_ES'];

describe('view metadata', () => {
  it.each(VIEW_PAGES)('$locale/$view has its own canonical, every hreflang and is indexable', ({ locale, view }) => {
    const metadata = buildViewMetadata(locale, view);
    expect(metadata.alternates?.canonical).toBe(absoluteUrl(pathFor(locale, view)));
    expect(metadata.alternates?.languages).toEqual(languageAlternates(view));
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(metadata.openGraph).toMatchObject({ url: absoluteUrl(pathFor(locale, view)), type: 'profile' });
    expect(metadata.description).toEqual(expect.any(String));
  });

  it.each(VIEW_PAGES)('$locale/$view names its Open Graph locale and the four others', ({ locale, view }) => {
    const { locale: own, alternateLocale } = buildViewMetadata(locale, view).openGraph as {
      locale: string;
      alternateLocale: string[];
    };
    expect(own).toBe(OG_LOCALES[LOCALES.indexOf(locale)]);
    expect([own, ...alternateLocale].sort()).toEqual([...OG_LOCALES].sort());
  });

  it('gives the hero an absolute title, so the template does not repeat the name', () => {
    expect(buildViewMetadata('en', 'hero').title).toMatchObject({ absolute: expect.any(String) });
    expect(typeof buildViewMetadata('en', 'identity').title).toBe('string');
  });
});

describe('languageAlternates', () => {
  it.each(VIEW_IDS)('%s lists every locale once, each at its own localized path', (view) => {
    const languages = languageAlternates(view);
    for (const locale of LOCALES) expect(languages[locale]).toBe(absoluteUrl(pathFor(locale, view)));
    expect(Object.keys(languages).sort()).toEqual([...LOCALES, 'x-default'].sort());
  });

  it('sends x-default to the detecting root for the hero and to English otherwise', () => {
    expect(languageAlternates('hero')['x-default']).toBe(absoluteUrl('/'));
    expect(languageAlternates('projects')['x-default']).toBe(absoluteUrl(pathFor('en', 'projects')));
  });
});

describe('case study metadata', () => {
  it.each(STUDY_PAGES)('$locale/$id has its canonical, every hreflang and is an article', ({ locale, id }) => {
    const metadata = buildCaseStudyMetadata(locale, id);
    expect(metadata.alternates?.canonical).toBe(absoluteUrl(caseStudyPath(locale, id)));
    const languages = metadata.alternates?.languages as Record<string, string>;
    expect(Object.keys(languages).sort()).toEqual([...LOCALES, 'x-default'].sort());
    for (const other of LOCALES) expect(languages[other]).toBe(absoluteUrl(caseStudyPath(other, id)));
    expect(languages['x-default']).toBe(absoluteUrl(caseStudyPath('en', id)));
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(metadata.openGraph).toMatchObject({ type: 'article', locale: OG_LOCALES[LOCALES.indexOf(locale)] });
  });

  it.each(CASE_STUDY_IDS)('%s alternates match the metadata', (id) => {
    expect(buildCaseStudyMetadata('it', id).alternates?.languages).toEqual(caseStudyAlternates(id));
  });
});

describe('robots outside production', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('turns every page to noindex on a Vercel preview', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.resetModules();
    const seo = await import('./seo');
    expect(seo.buildViewMetadata('en', 'hero').robots).toEqual({ index: false, follow: false });
    expect(seo.buildCaseStudyMetadata('de', 'ariaer').robots).toEqual({ index: false, follow: false });
  });
});
