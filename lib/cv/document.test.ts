import { describe, expect, it } from 'vitest';
import { getPortfolioBundle, type SharedData } from '@/lib/portfolio';
import { cvCopy } from './copy';
import { buildCv, formatSegment } from './document';

const { shared, contents } = getPortfolioBundle();
const source = {
  shared,
  content: contents.en,
  copy: cvCopy('en').pdf,
  contact: { email: 'me@example.com', phone: '+39 000 0000000' },
  today: '2026-10-10',
  site: 'https://example.com',
};

describe('buildCv', () => {
  const cv = buildCv(source);

  it('opens with name, role and the private details before the public profiles', () => {
    expect(cv.name).toBe(shared.name);
    expect(cv.headline).toBe(`${contents.en.hero.role} — ${contents.en.hero.transition}`);
    expect(cv.contact.slice(0, 2)).toEqual(['me@example.com', '+39 000 0000000']);
    expect(cv.contact).toContain('github.com/CieriS');
  });

  it('leaves out private details that are not configured', () => {
    const anonymous = buildCv({ ...source, contact: { email: null, phone: null } });
    expect(anonymous.contact[0]).toBe(`${shared.address.locality}, ${shared.address.country}`);
  });

  it('splits the timeline into experience and education, from the same data the site shows', () => {
    const [experience, education, projects] = cv.sections;
    expect(experience.title).toBe('Experience');
    expect(experience.entries.map((entry) => entry.heading)).toEqual(['Software Developer']);
    expect(experience.entries[0].meta).toBe('Tas · 02/2022 – present');
    expect(experience.entries[0].tags).toContain('Angular');

    expect(education.entries.map((entry) => entry.heading)).toEqual(['Computer Engineering', 'Data Engineering']);
    // Interrupted thread: both runs are listed; a thread without an entity shows its label.
    expect(education.entries[0].meta).toBe('Università di Bologna · 11/2021 – 01/2023, 11/2024 – present');
    expect(education.entries[1].meta).toMatch(/^Self-directed study · /);

    expect(projects.entries.map((entry) => entry.heading)).toEqual(shared.projects.map((project) => project.name));
  });

  it('links public projects and labels private ones', () => {
    const projects = cv.sections[2].entries;
    expect(projects.find((entry) => entry.heading === 'aria-er')?.meta).toBe('https://github.com/CieriS/aria-er');
    expect(projects.find((entry) => entry.heading === 'yourFinance')?.meta).toBe(cvCopy('en').pdf.privateSource);
  });

  it('lists each technology once per entry', () => {
    for (const section of cv.sections) {
      for (const entry of section.entries) expect(new Set(entry.tags).size).toBe(entry.tags.length);
    }
  });

  it('drops empty sections', () => {
    const noProjects: SharedData = { ...shared, projects: [] };
    expect(buildCv({ ...source, shared: noProjects }).sections.map((section) => section.title)).toEqual([
      'Experience',
      'Education',
    ]);
  });

  it('dates the footer and names the site without the scheme', () => {
    expect(cv.footer).toBe('Generated on 10/10/2026 from example.com');
  });

  it('follows the locale', () => {
    const italian = buildCv({ ...source, content: contents.it, copy: cvCopy('it').pdf });
    expect(italian.sections.map((section) => section.title)).toEqual(['Esperienza', 'Formazione', 'Progetti']);
    expect(italian.sections[0].entries[0].meta).toContain('oggi');
  });
});

describe('formatSegment', () => {
  it('formats closed and open segments by month', () => {
    expect(formatSegment({ start: '2021-11-12', end: '2023-01-01' }, 'now')).toBe('11/2021 – 01/2023');
    expect(formatSegment({ start: '2026-02-01', end: null }, 'now')).toBe('02/2026 – now');
  });
});
