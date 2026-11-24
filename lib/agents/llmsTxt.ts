/**
 * `/llms.txt` (https://llmstxt.org/): the entry point for agents, in English (#172). An H1,
 * a one-paragraph summary, then sections of links with a short description each. Pure: every
 * fact comes from `data/` through the arguments, every path from `lib/routes.ts`.
 */
import type { LocaleContent, SharedData } from '../portfolio';
import { contactsPath, DEFAULT_LOCALE, LOCALE_NAMES, LOCALES, pathFor, projectPath, VIEW_IDS } from '../routes';
import { absolute } from './markdown';
import { fullTextPath, markdownPath } from './paths';

const line = (title: string, url: string, description?: string) => `- [${title}](${url})${description ? `: ${description}` : ''}`;

export function buildLlmsTxt(shared: SharedData, content: LocaleContent, siteUrl: string): string {
  const locale = DEFAULT_LOCALE;
  const url = (path: string) => absolute(siteUrl, path);
  const { meta, cv } = content.ui;
  const languages = new Intl.DisplayNames([locale], { type: 'language' });
  const spoken = shared.knowsLanguage.map((code) => languages.of(code) ?? code).join(', ');

  const pages = VIEW_IDS.map((view) =>
    line(
      meta.views[view].title,
      url(pathFor(locale, view)),
      `${meta.views[view].description} Markdown: ${url(markdownPath({ locale, view }))}`,
    ),
  );
  const projects = shared.projects.map((project) => {
    const copy = content.projects.items[project.id as keyof typeof content.projects.items];
    // Repository only for public code: yourFinance is private, and the GitHub profile is not its source.
    const code = project.source.visibility === 'public' ? ` Code: ${project.source.url}` : ` ${content.projects.labels.private}.`;
    return line(project.name, url(projectPath(locale, project.id)), `${copy.teaser}${code}`);
  });
  const contacts = [
    ...shared.contacts.map((contact) => line(contact.label, contact.url, contact.handle)),
    // The CV is never linked: it is sent on request through the form on the identity page.
    line(cv.label, url(contactsPath(locale)), `${cv.handle}. ${cv.note}`),
  ];
  const others = LOCALES.filter((other) => other !== locale).map((other) =>
    line(LOCALE_NAMES[other], url(pathFor(other, 'hero')), `everything in one file: ${url(fullTextPath(other))}`),
  );

  return (
    [
      `# ${shared.name}`,
      `> ${meta.description} ${content.hero.seeking} Speaks ${spoken}.`,
      '## Pages',
      pages.join('\n'),
      '## Projects',
      projects.join('\n'),
      '## Contact',
      contacts.join('\n'),
      '## Other languages',
      others.join('\n'),
      '## Optional',
      [
        line('The whole site in one file', url(fullTextPath(locale)), 'every page and case study as Markdown'),
        `- Markdown version of any page: its URL plus \`.md\`, e.g. ${url(markdownPath({ locale, view: 'identity' }))}`,
      ].join('\n'),
    ].join('\n\n') + '\n'
  );
}
