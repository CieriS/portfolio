import { pick } from '@/lib/format';
import type { LocaleContent, Segment, SharedData, Thread } from '@/lib/portfolio';
import type { CvCopy } from './copy';
import { fill } from './copy';
import type { CvProfile } from './profile';

/**
 * The CV as plain data, built from the same content the site renders: whatever the site
 * says on the day of the download is what the PDF says, with no second copy to keep in sync.
 * Rendering it to PDF is a separate step (`pdf.ts`), so this part stays pure and testable.
 */
export type CvEntry = { heading: string; meta: string; body: string; tags: string[] };
/** `entries` for dated items, `lines` for what reads better as a compact list (skills, languages). */
export type CvSection = { title: string; entries: CvEntry[]; lines: string[] };
export type CvDocument = {
  name: string;
  headline: string;
  /** Private details first (from the environment), then the public profiles. */
  contact: string[];
  summary: string;
  sections: CvSection[];
  /** Data-processing consent, expected on a CV in Italy. */
  consent: string;
  footer: string;
};

export type CvSource = {
  shared: SharedData;
  content: LocaleContent;
  copy: CvCopy['pdf'];
  profile: CvProfile;
  contact: { email: string | null; phone: string | null };
  /** ISO date of the download, printed in the footer. */
  today: string;
  site: string;
};

export function buildCv({ shared, content, copy, profile, contact, today, site }: CvSource): CvDocument {
  const threads = shared.timeline.threads;
  const entries = (title: string, list: CvEntry[]): CvSection => ({ title, entries: list, lines: [] });
  const lines = (title: string, list: string[]): CvSection => ({ title, entries: [], lines: list });
  return {
    name: shared.name,
    headline: `${content.hero.role} — ${content.hero.transition}`,
    contact: [
      contact.email,
      contact.phone,
      `${shared.address.locality}, ${shared.address.country}`,
      ...profile.profiles
        .map((id) => shared.contacts.find((link) => link.id === id))
        .filter((link) => link !== undefined)
        .map((link) => link.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')),
    ].filter((line): line is string => Boolean(line)),
    summary: content.hero.detail,
    sections: [
      lines(
        copy.skills,
        profile.skills.map((group) => `${pick(copy.skillGroups, group.id) ?? group.id}: ${group.items.join(', ')}`),
      ),
      entries(
        copy.experience,
        threads.filter((t) => t.kind === 'work').map((t) => threadEntry(t, content, copy)),
      ),
      entries(
        copy.education,
        threads.filter((t) => t.kind === 'education').map((t) => threadEntry(t, content, copy)),
      ),
      entries(
        copy.certifications,
        profile.certifications.map((item) => ({
          heading: item.name,
          meta: fill(copy.obtainedAt, { entity: item.entity }),
          body: '',
          tags: [],
        })),
      ),
      entries(
        copy.projects,
        shared.projects.map((project) => ({
          heading: project.name,
          meta: project.source.visibility === 'public' ? project.source.url : copy.privateSource,
          body: pick(content.projects.items, project.id)?.summary ?? '',
          tags: project.stack,
        })),
      ),
      lines(copy.languages, [
        profile.spokenLanguages
          .map(({ code, level }) => `${pick(copy.languageNames, code) ?? code} (${level === 'native' ? copy.native : level})`)
          .join(' · '),
      ]),
    ].filter((section) => section.entries.length > 0 || section.lines.some(Boolean)),
    consent: copy.consent,
    footer: fill(copy.generated, { date: formatDay(today), site: site.replace(/^https?:\/\//, '') }),
  };
}

function threadEntry(thread: Thread, content: LocaleContent, copy: CvCopy['pdf']): CvEntry {
  const threadCopy = pick(content.timeline.threads, thread.id);
  const entity = thread.entity ?? threadCopy?.entityLabel ?? '';
  return {
    heading: threadCopy?.role ?? thread.id,
    meta: [entity, thread.segments.map((segment) => formatSegment(segment, copy.present)).join(', ')].filter(Boolean).join(' · '),
    body: threadCopy?.summary ?? '',
    // Course names are translated where the locale has a term; technology names stay as they are.
    tags: [...new Set(thread.phases.flatMap((phase) => phase.stack))].map((tag) => pick<string>(copy.terms, tag) ?? tag),
  };
}

/** `2022-02-23 → open` → `02/2022 – present`. */
export function formatSegment(segment: Segment, present: string): string {
  return `${formatMonth(segment.start)} – ${segment.end === null ? present : formatMonth(segment.end)}`;
}

function formatMonth(iso: string): string {
  const [year, month] = iso.split('-');
  return `${month}/${year}`;
}

function formatDay(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}
