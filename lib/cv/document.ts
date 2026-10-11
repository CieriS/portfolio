import { pick } from '@/lib/format';
import type { LocaleContent, Segment, SharedData, Thread } from '@/lib/portfolio';
import type { CvCopy } from './copy';
import { fill } from './copy';

/**
 * The CV as plain data, built from the same content the site renders: whatever the site
 * says on the day of the download is what the PDF says, with no second copy to keep in sync.
 * Rendering it to PDF is a separate step (`pdf.ts`), so this part stays pure and testable.
 */
export type CvEntry = { heading: string; meta: string; body: string; tags: string[] };
export type CvSection = { title: string; entries: CvEntry[] };
export type CvDocument = {
  name: string;
  headline: string;
  /** Private details first (from the environment), then the public profiles. */
  contact: string[];
  summary: string;
  sections: CvSection[];
  footer: string;
};

export type CvSource = {
  shared: SharedData;
  content: LocaleContent;
  copy: CvCopy['pdf'];
  contact: { email: string | null; phone: string | null };
  /** ISO date of the download, printed in the footer. */
  today: string;
  site: string;
};

export function buildCv({ shared, content, copy, contact, today, site }: CvSource): CvDocument {
  const threads = shared.timeline.threads;
  return {
    name: shared.name,
    headline: `${content.hero.role} — ${content.hero.transition}`,
    contact: [
      contact.email,
      contact.phone,
      `${shared.address.locality}, ${shared.address.country}`,
      ...shared.contacts.map((link) => link.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')),
    ].filter((line): line is string => Boolean(line)),
    summary: content.hero.detail,
    sections: [
      { title: copy.experience, entries: threads.filter((t) => t.kind === 'work').map((t) => threadEntry(t, content, copy)) },
      { title: copy.education, entries: threads.filter((t) => t.kind === 'education').map((t) => threadEntry(t, content, copy)) },
      {
        title: copy.projects,
        entries: shared.projects.map((project) => ({
          heading: project.name,
          meta: project.source.visibility === 'public' ? project.source.url : copy.privateSource,
          body: pick(content.projects.items, project.id)?.summary ?? '',
          tags: project.stack,
        })),
      },
    ].filter((section) => section.entries.length > 0),
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
    tags: [...new Set(thread.phases.flatMap((phase) => phase.stack))],
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
