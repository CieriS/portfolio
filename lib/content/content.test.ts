import { describe, expect, it } from 'vitest';
import de from '@/data/locales/de.json';
import en from '@/data/locales/en.json';
import es from '@/data/locales/es.json';
import fr from '@/data/locales/fr.json';
import it_ from '@/data/locales/it.json';
import errors from '@/data/errors.json';
import rawShared from '@/data/shared.json';
import { ProjectSourceSchema, SegmentSchema, SharedSchema, ThreadSchema, type SharedData } from './schema';
import { findContentIssues, findEmphasisIssues, type CopyUnderCheck } from './validate';

describe('the real content', () => {
  it('parses and passes every cross-check', () => {
    const shared = SharedSchema.parse(rawShared);
    expect(findContentIssues(shared, { en, it: it_, fr, de, es })).toEqual([]);
  });
});

describe('schema', () => {
  it('rejects an unknown thread kind', () => {
    const result = ThreadSchema.safeParse({
      id: 'x',
      kind: 'hobby',
      entity: null,
      segments: [{ start: '2024-01-01', end: null }],
      phases: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects impossible dates and segments that end before they start', () => {
    expect(SegmentSchema.safeParse({ start: '2024-02-31', end: null }).success).toBe(false);
    expect(SegmentSchema.safeParse({ start: '2024-03-01', end: '2024-02-01' }).success).toBe(false);
  });

  it('requires a url on public sources only', () => {
    expect(ProjectSourceSchema.safeParse({ visibility: 'public' }).success).toBe(false);
    expect(ProjectSourceSchema.safeParse({ visibility: 'public', url: 'https://github.com/x/y' }).success).toBe(true);
    expect(ProjectSourceSchema.safeParse({ visibility: 'private' }).success).toBe(true);
    expect(ProjectSourceSchema.safeParse({ visibility: 'secret' }).success).toBe(false);
  });

  it('requires an address with a two-letter country code, and non-empty alternate names', () => {
    const { address, alternateNames } = SharedSchema.shape;
    expect(address.safeParse({ locality: 'Bologna', country: 'IT' }).success).toBe(true);
    expect(address.safeParse({ locality: 'Bologna', country: 'Italy' }).success).toBe(false);
    expect(address.safeParse({ locality: 'Bologna', country: 'it' }).success).toBe(false);
    expect(address.safeParse({ locality: '', country: 'IT' }).success).toBe(false);
    expect(address.safeParse({ country: 'IT' }).success).toBe(false);
    expect(alternateNames.safeParse([]).success).toBe(true);
    expect(alternateNames.safeParse(['']).success).toBe(false);
  });

  it('issue #49: accepts a certification only with a verification URL and an expiry after its issue date', () => {
    const { certifications } = SharedSchema.shape;
    const csm = {
      id: 'csm',
      name: 'Certified ScrumMaster (CSM)',
      issuer: 'Scrum Alliance',
      entity: 'Tas',
      issued: '2025-11-05',
      expires: '2027-11-05',
      url: 'https://example.com/badge',
    };
    expect(certifications.safeParse([csm]).success).toBe(true);
    expect(certifications.safeParse([{ ...csm, expires: '2025-11-05' }]).success).toBe(false);
    expect(certifications.safeParse([{ ...csm, issued: '2025-11-31' }]).success).toBe(false);
    expect(certifications.safeParse([{ ...csm, url: 'not a url' }]).success).toBe(false);
    expect(certifications.safeParse([{ ...csm, issuer: '' }]).success).toBe(false);
  });
});

describe('findContentIssues', () => {
  const shared = {
    timeline: { threads: [{ id: 'work', phases: [{ id: 'one' }] }] },
    projects: [{ id: 'app', layers: [{ id: 'api' }] }],
  } as unknown as SharedData;

  const copy = (overrides: Partial<CopyUnderCheck> = {}): CopyUnderCheck => ({
    ui: { locale: { en: 'EN', it: 'IT' } },
    timeline: { threads: { work: { phases: { one: {} } } } },
    projects: { items: { app: { layers: { api: 'API' } } } },
    ...overrides,
  });

  it('accepts complete copy', () => {
    expect(findContentIssues(shared, { en: copy(), it: copy() })).toEqual([]);
  });

  it('reports every missing key with its path', () => {
    const broken = copy({
      ui: { locale: { en: 'EN' } },
      timeline: { threads: { work: { phases: {} } } },
      projects: { items: { app: { layers: {} } } },
    });
    expect(findContentIssues(shared, { en: copy(), it: broken })).toEqual([
      'it.ui.locale has no label for "it"',
      'it.timeline.threads.work.phases has no copy for "one"',
      'it.projects.items.app.layers has no copy for "api"',
    ]);
  });

  it('reports a thread or project with no copy at all', () => {
    const empty = copy({ timeline: { threads: {} }, projects: { items: {} } });
    expect(findContentIssues(shared, { en: empty, it: copy() })).toEqual([
      'en.timeline.threads has no copy for thread "work"',
      'en.projects.items has no copy for project "app"',
    ]);
  });
});

describe('findEmphasisIssues', () => {
  it('passes when the emphasis occurs in its sibling text, at any depth', () => {
    expect(findEmphasisIssues({ a: { title: 'Deliberate work', titleEmphasis: 'Deliberate' } }, 'en')).toEqual([]);
  });

  it('flags an emphasis that the text does not contain', () => {
    expect(findEmphasisIssues({ hero: { title: 'Systems', titleEmphasis: 'Data' } }, 'it')).toEqual([
      'it.hero.titleEmphasis "Data" does not occur in it.hero.title',
    ]);
  });
});

describe('facts the home repeats by hand', () => {
  // The home paragraph and the project summaries restate, per language, facts that live in the
  // timeline and in the projects themselves. Two of them drifted once; these keep them honest.
  const copies = { en, it: it_, fr, de, es };
  const today = { en: 'today', it: 'oggi', fr: "aujourd'hui", de: 'heute', es: 'hoy' };
  const stale = { en: 'exploration', it: 'esplorazione', fr: 'exploration', de: 'exploration', es: 'exploración' };

  it.each(Object.keys(copies) as Array<keyof typeof copies>)('%s: Angular is the present, not "since 2022"', (locale) => {
    const sentence = copies[locale].hero.detail.split('. ')[0];
    expect(sentence).toContain('2022');
    // The work at Tas began on a proprietary framework: Angular is where it is going now.
    expect(sentence).toMatch(new RegExp(`${today[locale]}[^,.]*Angular`));
  });

  it.each(Object.keys(copies) as Array<keyof typeof copies>)('%s: aria-er is not described as still exploring', (locale) => {
    const summary = copies[locale].projects.items.ariaer.summary;
    expect(summary.toLowerCase()).not.toContain(stale[locale]);
    expect(summary).toContain('Docker');
    expect(summary).toContain('Google Cloud');
  });

  it.each(Object.keys(copies) as Array<keyof typeof copies>)(
    '%s: each teaser is a short line, not the summary again',
    (locale) => {
      for (const item of Object.values(copies[locale].projects.items)) {
        // At most two lines of a 375 px row (#96), so the clamp never cuts a word.
        expect(item.teaser.length, item.teaser).toBeLessThanOrEqual(80);
        expect(item.summary).not.toContain(item.teaser);
      }
    },
  );
});

describe('plain words, no forced metaphors (#103, #104, #106, #138)', () => {
  const copies = { en, it: it_, fr, de, es };
  type Locale = keyof typeof copies;
  const locales = Object.keys(copies) as Locale[];
  // Words of the old operating-system voice, per language: none may come back in these strings.
  const metaphors: Record<Locale, RegExp> = {
    en: /process|thread|uptime|unit of computation|bridge|running|index\b/i,
    it: /process|thread|uptime|unità di calcolo|ponte|ponti|esecuzione|indice/i,
    fr: /processus|thread|uptime|unité de calcul|passerelle|index\b/i,
    de: /prozess|thread|uptime|recheneinheit|brücke|index\b/i,
    es: /proceso|hilo|tiempo activo|unidad de cálculo|puente|índice/i,
  };
  const plain = (locale: Locale) => {
    const copy = copies[locale];
    return [
      copy.hero.hint,
      copy.timeline.title,
      copy.timeline.subtitle,
      copy.timeline.labels.uptime,
      copy.projects.subtitle,
      copy.projects.labels.bridge,
      copy.ui.notFound.title,
      copy.ui.notFound.body,
      copy.ui.notFound.cta,
      errors[locale].title,
      errors[locale].body,
      errors[locale].cta,
    ];
  };

  it.each(locales)('%s: the strings rewritten in plain words keep no metaphor', (locale) => {
    for (const text of plain(locale)) expect(text, text).not.toMatch(metaphors[locale]);
  });

  it.each(locales)('%s: the timeline says university paused, not that nothing blocked', (locale) => {
    // The academic lane was suspended for work: "none blocks the others" was false.
    expect(copies[locale].timeline.subtitle).toMatch(/2023/);
    expect(copies[locale].timeline.subtitle).toMatch(/2024/);
  });

  it.each(locales)('%s: the header and the home title present Data Engineering as the direction, not a role', (locale) => {
    const { shell, meta } = copies[locale].ui;
    for (const text of [shell.role, meta.views.hero.title]) {
      expect(text).not.toMatch(/—\s*(Data Engineering|ingeniería de datos)$/);
      expect(text).not.toMatch(/(&| e | y | and )\s*(Data Engineering|ingeniería de datos)$/);
    }
  });

  it.each(locales)('%s: the role sought is stated, full remote', (locale) => {
    const seeking = copies[locale].hero.seeking;
    expect(seeking).toContain('Data Engineer');
    expect(seeking.toLowerCase()).toMatch(/remote|remoto|télétravail/);
  });

  it('English writes "frontend" as one word and no Oxford comma before the last item', () => {
    const text = JSON.stringify(en);
    expect(text).not.toMatch(/front-end/i);
    expect(en.hero.lead).not.toContain(', and ');
  });
});

describe('identity principles backed by evidence (#105, #139)', () => {
  const copies = { en, it: it_, fr, de, es };
  type Locale = keyof typeof copies;
  const absolute: Record<Locale, RegExp> = {
    en: /\b(never|always|removed)\b/i,
    it: /\b(mai|sempre|rimosso)\b/i,
    fr: /\b(jamais|toujours|supprimé)\b/i,
    de: /\b(nie|immer|entfernt)\b/i,
    es: /\b(nunca|siempre|elimina)\b/i,
  };

  it.each(Object.keys(copies) as Locale[])('%s: every principle names the project where it is applied', (locale) => {
    const { identity } = copies[locale];
    for (const principle of identity.principles) expect(principle.body, principle.body).toMatch(/yourFinance|aria-er/);
    for (const text of [identity.subtitle, ...identity.principles.map((p) => p.body)]) {
      expect(text, text).not.toMatch(absolute[locale]);
    }
    // The nesting limit had no fact behind it: it must not come back without one.
    expect(JSON.stringify(identity.principles)).not.toMatch(/nesting|annidamento|imbrication|verschachtelung|anidación/i);
  });

  it.each(Object.keys(copies) as Locale[])(
    '%s: Rust is described by memory safety, not "deterministic performance"',
    (locale) => {
      expect(copies[locale].timeline.threads.independent.phases.systems.body).not.toMatch(/determinis|predecible/i);
    },
  );
});
