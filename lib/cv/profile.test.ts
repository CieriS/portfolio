import { describe, expect, it } from 'vitest';
import { getPortfolioBundle } from '@/lib/portfolio';
import { LOCALES } from '@/lib/routes';
import { cvCopy } from './copy';
import { cvProfile } from './profile';

const { shared } = getPortfolioBundle();
const skills = cvProfile.skills.flatMap((group) => group.items);

describe('cvProfile', () => {
  it('lists only profiles the site knows', () => {
    const known = shared.contacts.map((link) => link.id);
    for (const id of cvProfile.profiles) expect(known, id).toContain(id);
  });

  it('names each skill once', () => {
    expect(new Set(skills).size).toBe(skills.length);
  });

  it('covers every technology of the work experience and of the projects', () => {
    const used = [
      ...shared.timeline.threads
        .filter((thread) => thread.kind === 'work')
        .flatMap((thread) => thread.phases.flatMap((phase) => phase.stack)),
      ...shared.projects.flatMap((project) => project.stack),
    ];
    for (const technology of used) expect(skills, technology).toContain(technology);
  });

  it('gives each language a level: native or a CEFR band', () => {
    for (const { level } of cvProfile.spokenLanguages) expect(level).toMatch(/^(native|[ABC][12])$/);
  });
});

describe.each(LOCALES)('CV profile labels in %s', (locale) => {
  const { pdf } = cvCopy(locale);

  it('labels every skill group and every spoken language', () => {
    for (const group of cvProfile.skills) expect(Object.keys(pdf.skillGroups), group.id).toContain(group.id);
    for (const { code } of cvProfile.spokenLanguages) expect(Object.keys(pdf.languageNames), code).toContain(code);
  });

  it('names where a certification was obtained', () => {
    expect(pdf.obtainedAt).toContain('{entity}');
  });

  it.skipIf(locale === 'en')('translates every university course', () => {
    const courses = shared.timeline.threads
      .filter((thread) => thread.id === 'academic')
      .flatMap((thread) => thread.phases.flatMap((phase) => phase.stack));
    expect(courses.length).toBeGreaterThan(0);
    for (const course of courses) expect(Object.keys(pdf.terms), course).toContain(course);
  });
});
