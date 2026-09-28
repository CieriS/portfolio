import { describe, expect, it } from 'vitest';
import en from '@/data/locales/en.json';
import fr from '@/data/locales/fr.json';
import it_ from '@/data/locales/it.json';
import rawShared from '@/data/shared.json';
import { ProjectSourceSchema, SegmentSchema, SharedSchema, ThreadSchema, type SharedData } from './schema';
import { findContentIssues, findEmphasisIssues, type CopyUnderCheck } from './validate';

describe('the real content', () => {
  it('parses and passes every cross-check', () => {
    const shared = SharedSchema.parse(rawShared);
    expect(findContentIssues(shared, { en, it: it_, fr })).toEqual([]);
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
