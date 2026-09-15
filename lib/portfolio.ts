import raw from '@/data/portfolio.json';
import type { Locale } from '@/i18n/routing';

export type Contact = { id: string; label: string; handle: string; url: string };
export type Phase = { id: string; stack: string[] };
export type Thread = { id: string; start: string | null; end: string | null; phases: Phase[] };
export type ProjectLayer = { id: string; tech: string };
export type Project = { id: string; name: string; repo: string | null; stack: string[]; layers: ProjectLayer[] };
export type Session = { id: string; focus: string; patterns: string[] };

export type SharedData = {
  name: string;
  handle: string;
  contacts: Contact[];
  timeline: {
    threadA: Thread & { organization: string | null };
    threadB: Thread & { institution: string | null };
  };
  projects: Project[];
  discipline: {
    biological: { heightCm: number | null; weightKg: number | null; daysPerWeek: number; sessions: Session[] };
    acoustic: { formats: string[]; pipeline: string[] };
  };
};

export type LocaleContent = (typeof raw.locales)['en'];
export type UiMessages = LocaleContent['ui'];
export type PortfolioView = { locale: Locale; shared: SharedData; content: LocaleContent };
export type PortfolioBundle = { shared: SharedData; contents: Record<Locale, LocaleContent> };

// Typed assignments: a missing or renamed key in the JSON (or an IT/EN shape drift) fails the build.
const shared: SharedData = raw.shared;
const contents: Record<Locale, LocaleContent> = raw.locales;

/** Both locales ship to the client so the language swap needs no navigation. */
export function getPortfolioBundle(): PortfolioBundle {
  return { shared, contents };
}

export function getUiMessages(locale: Locale): UiMessages {
  return contents[locale].ui;
}
