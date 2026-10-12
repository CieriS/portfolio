import { describe, expect, it } from 'vitest';
import { getPortfolioBundle, type SharedData } from '@/lib/portfolio';
import { cvCopy } from './copy';
import { buildCv, formatSegment, type CvDocument } from './document';
import { cvProfile } from './profile';

const { shared, contents } = getPortfolioBundle();
const source = {
  shared,
  content: contents.en,
  copy: cvCopy('en').pdf,
  profile: cvProfile,
  contact: { email: 'me@example.com', phone: '+39 000 0000000' },
  today: '2026-10-10',
  site: 'https://example.com',
};

const section = (cv: CvDocument, title: string) => {
  const found = cv.sections.find((item) => item.title === title);
  if (!found) throw new Error(`no section titled ${title}`);
  return found;
};

describe('buildCv', () => {
  const cv = buildCv(source);

  it('opens with name, role and the private details before the public profiles', () => {
    expect(cv.name).toBe(shared.name);
    expect(cv.headline).toBe(`${contents.en.hero.role} — ${contents.en.hero.transition}`);
    expect(cv.contact.slice(0, 2)).toEqual(['me@example.com', '+39 000 0000000']);
    expect(cv.contact).toContain('github.com/CieriS');
    expect(cv.contact).toContain('linkedin.com/in/samuelecieri');
  });

  it('lists only the profiles the CV asks for, in its order', () => {
    expect(cv.contact.some((line) => line.includes('instagram'))).toBe(false);
    const onlyGithub = buildCv({ ...source, profile: { ...cvProfile, profiles: ['github', 'missing'] } });
    expect(onlyGithub.contact.slice(2)).toEqual(['Bologna, IT', 'github.com/CieriS']);
  });

  it('leaves out private details that are not configured', () => {
    const anonymous = buildCv({ ...source, contact: { email: null, phone: null } });
    expect(anonymous.contact[0]).toBe(`${shared.address.locality}, ${shared.address.country}`);
  });

  it('splits the timeline into experience and education, from the same data the site shows', () => {
    const [experience, education, projects] = ['Experience', 'Education', 'Projects'].map((title) => section(cv, title));
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
    const projects = section(cv, 'Projects').entries;
    expect(projects.find((entry) => entry.heading === 'aria-er')?.meta).toMatch(
      /^https:\/\/github\.com\/CieriS\/aria-er · v\d+\.\d+\.\d+$/,
    );
    expect(projects.find((entry) => entry.heading === 'yourFinance')?.meta).toMatch(
      new RegExp(`^${cvCopy('en').pdf.privateSource} · v\\d+\\.\\d+\\.\\d+$`),
    );
  });

  it('lists each technology once per entry', () => {
    for (const section of cv.sections) {
      for (const entry of section.entries) expect(new Set(entry.tags).size).toBe(entry.tags.length);
    }
  });

  it('drops empty sections', () => {
    const noProjects: SharedData = { ...shared, projects: [] };
    expect(buildCv({ ...source, shared: noProjects }).sections.map((item) => item.title)).not.toContain('Projects');
    const bare = { ...cvProfile, skills: [], certifications: [], spokenLanguages: [] };
    expect(buildCv({ ...source, profile: bare }).sections.map((item) => item.title)).toEqual([
      'Experience',
      'Education',
      'Projects',
    ]);
  });

  it('dates the footer and names the site without the scheme', () => {
    expect(cv.footer).toBe('Generated on 10/10/2026 from example.com');
  });

  it('follows the locale', () => {
    const italian = buildCv({ ...source, content: contents.it, copy: cvCopy('it').pdf });
    expect(italian.sections.map((item) => item.title)).toEqual([
      'Competenze',
      'Esperienza',
      'Formazione',
      'Certificazioni',
      'Progetti',
      'Lingue',
    ]);
    expect(section(italian, 'Esperienza').entries[0].meta).toContain('oggi');
    expect(section(italian, 'Lingue').lines).toEqual(['Italiano (madrelingua) · Inglese (B2) · Francese (B1)']);
    expect(italian.consent).toContain('2016/679');
  });

  it('opens with the skills, one labelled line per group', () => {
    expect(cv.sections[0].title).toBe('Skills');
    expect(cv.sections[0].lines).toContain('Infrastructure: Docker, Kubernetes, Helm, Rancher, Terraform');
    expect(cv.sections[0].lines).toHaveLength(cvProfile.skills.length);
  });

  it('states certifications with where they were obtained, and spoken languages with their level', () => {
    expect(section(cv, 'Certifications').entries).toEqual([
      { heading: 'Certified ScrumMaster (CSM)', meta: 'Obtained at Tas', body: '', tags: [] },
    ]);
    expect(section(cv, 'Languages').lines).toEqual(['Italian (native) · English (B2) · French (B1)']);
  });

  it('translates course names where the locale has a term and leaves technologies alone', () => {
    const italian = buildCv({ ...source, content: contents.it, copy: cvCopy('it').pdf });
    const [degree, selfStudy] = section(italian, 'Formazione').entries;
    expect(degree.tags).toContain('Basi di dati');
    expect(degree.tags).not.toContain('Databases');
    expect(selfStudy.tags).toContain('Rust');
    expect(section(cv, 'Education').entries[0].tags).toContain('Databases');
  });
});

describe('formatSegment', () => {
  it('formats closed and open segments by month', () => {
    expect(formatSegment({ start: '2021-11-12', end: '2023-01-01' }, 'now')).toBe('11/2021 – 01/2023');
    expect(formatSegment({ start: '2026-02-01', end: null }, 'now')).toBe('02/2026 – now');
  });
});
