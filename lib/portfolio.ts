import rawData from '@/data/portfolio.json';
import type { Locale } from '@/i18n/routing';

export type Contact = { id: string; label: string; handle: string; url: string };

/** One run of a thread. `end: null` means it is still running. */
export type Segment = { start: string; end: string | null };

/** `start` is optional: without it the phase is spread over the thread's active time. */
export type Phase = { id: string; start?: string; stack: string[] };

export const THREAD_KINDS = ['work', 'education'] as const;
export type ThreadKind = (typeof THREAD_KINDS)[number];

/** A thread runs over one or more segments, so an interruption is part of the model. */
export type Thread = {
  id: string;
  kind: ThreadKind;
  entity: string | null;
  segments: Segment[];
  phases: Phase[];
};
export type ProjectLayer = { id: string; tech: string };

export const SOURCE_VISIBILITIES = ['public', 'private'] as const;
export type SourceVisibility = (typeof SOURCE_VISIBILITIES)[number];

/** Where a project's code lives: a public repository, or private code shown on request. */
export type ProjectSource = { visibility: 'public'; url: string } | { visibility: 'private' };

export type Project = { id: string; name: string; source: ProjectSource; stack: string[]; layers: ProjectLayer[] };
export type Session = { id: string; focus: string; patterns: string[] };

export type SharedData = {
  name: string;
  handle: string;
  contacts: Contact[];
  timeline: { threads: Thread[] };
  projects: Project[];
  discipline: {
    biological: { heightCm: number | null; weightKg: number | null; daysPerWeek: number; sessions: Session[] };
    acoustic: { formats: string[]; pipeline: string[] };
  };
};

export type LocaleContent = (typeof rawData.locales)['en'];
export type UiMessages = LocaleContent['ui'];
export type PortfolioView = { locale: Locale; shared: SharedData; content: LocaleContent };
export type PortfolioBundle = { shared: SharedData; contents: Record<Locale, LocaleContent> };

/**
 * JSON widens every string, so `kind` arrives as `string` and cannot satisfy the union on
 * its own. Narrowing it here keeps the rest of the app on the literal type, and a typo in
 * the data file throws while the pages are being prerendered — that is, it fails the build.
 */
function asThread(raw: (typeof rawData)['shared']['timeline']['threads'][number]): Thread {
  const kind = THREAD_KINDS.find((candidate) => candidate === raw.kind);
  if (!kind) {
    throw new Error(`Unknown thread kind "${raw.kind}" on thread "${raw.id}". Expected: ${THREAD_KINDS.join(', ')}.`);
  }
  return { ...raw, kind };
}

type RawProject = (typeof rawData)['shared']['projects'][number];

/**
 * Same narrowing as threads, for the source union: a public project without a `url`, or an
 * unknown visibility, fails the build instead of rendering a link to nowhere.
 */
function asProject(raw: RawProject): Project {
  const source: { visibility: string; url?: string } = raw.source;
  const visibility = SOURCE_VISIBILITIES.find((candidate) => candidate === source.visibility);
  if (!visibility) {
    throw new Error(
      `Unknown source visibility "${source.visibility}" on project "${raw.id}". Expected: ${SOURCE_VISIBILITIES.join(', ')}.`,
    );
  }
  if (visibility === 'private') return { ...raw, source: { visibility } };
  if (!source.url) throw new Error(`Public project "${raw.id}" needs a source url.`);
  return { ...raw, source: { visibility, url: source.url } };
}

// Typed assignments: a missing or renamed key in the JSON (or an IT/EN shape drift) fails the build.
const shared: SharedData = {
  ...rawData.shared,
  timeline: { threads: rawData.shared.timeline.threads.map(asThread) },
  projects: rawData.shared.projects.map(asProject),
};
const contents: Record<Locale, LocaleContent> = rawData.locales;

/** Both locales ship to the client so the language swap needs no navigation. */
export function getPortfolioBundle(): PortfolioBundle {
  return { shared, contents };
}

export function getUiMessages(locale: Locale): UiMessages {
  return contents[locale].ui;
}
