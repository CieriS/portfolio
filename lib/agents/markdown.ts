/**
 * Markdown versions of the pages, for agents that fetch a page instead of rendering it (#173).
 * Pure: every renderer gets the validated content and the site origin, and returns text in the
 * language of the page, from the same copy the page shows. No fact is written here.
 *
 * Server only, through `lib/agents/render.ts`; the type imports below carry no runtime code.
 */
import type { CaseStudyCopy, CaseStudyData } from '../caseStudy';
import type { LocaleContent, Project, SharedData, Thread } from '../portfolio';
import { versionWithDate } from '../projects';
import { contactsPath, LOCALE_NAMES, LOCALES, pathFor, projectPath, type CaseStudyId, type Locale, type ViewId } from '../routes';
import { htmlPath, markdownPath, type MarkdownPage } from './paths';

export type Site = { shared: SharedData; content: LocaleContent; locale: Locale; siteUrl: string };

export function absolute(siteUrl: string, path: string): string {
  return new URL(path, `${siteUrl}/`).toString();
}

/** `2021-11-12` → `2021-11`: months are enough, and the format reads the same in every language. */
export function isoMonth(date: string): string {
  return date.slice(0, 7);
}

const blocks = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join('\n\n');
const list = (items: string[]) => items.map((item) => `- ${item}`).join('\n');

/** Title, canonical URL and the same page in the other languages. */
function header(site: Site, page: MarkdownPage, title: string): string {
  const others = LOCALES.filter((locale) => locale !== site.locale).map(
    (locale) => `[${LOCALE_NAMES[locale]}](${absolute(site.siteUrl, markdownPath({ ...page, locale }))})`,
  );
  return blocks(`# ${title}`, `<${absolute(site.siteUrl, htmlPath(page))}>`, others.join(' · '));
}

function footer(site: Site, page: MarkdownPage): string {
  return `Source: <${absolute(site.siteUrl, htmlPath(page))}>`;
}

function hero(site: Site): string {
  const { hero } = site.content;
  return blocks(
    `**${hero.role}** — ${hero.transition}`,
    hero.seeking,
    hero.lead,
    hero.detail,
    `[${hero.cta}](${absolute(site.siteUrl, pathFor(site.locale, 'projects'))})`,
  );
}

function identity(site: Site): string {
  const { identity, ui } = site.content;
  const { shared, siteUrl, locale } = site;
  // The CV is never linked: it is sent on request through the form, and its contact data
  // (CV_EMAIL, CV_PHONE) lives only in the environment.
  const contacts = [
    `[${ui.cv.label}](${absolute(siteUrl, contactsPath(locale))}) — ${ui.cv.handle}. ${ui.cv.note}`,
    ...shared.contacts.map((contact) => `[${contact.label}](${contact.url}) — ${contact.handle}`),
    `[${identity.sponsor}](${shared.sponsor.url}) — ${shared.sponsor.label}`,
  ];
  return blocks(
    `## ${identity.title}`,
    identity.subtitle,
    `## ${identity.principlesTitle}`,
    ...identity.principles.map((principle) => blocks(`### ${principle.title}`, principle.body)),
    `## ${identity.outsideTitle}`,
    identity.outside,
    `## ${identity.contactsTitle}`,
    identity.contactsNote,
    list(contacts),
  );
}

/** "In progress" comes from the data (`end: null`), never from the clock. */
export function isRunning(thread: Pick<Thread, 'segments'>): boolean {
  return thread.segments.some((segment) => segment.end === null);
}

function timeline(site: Site): string {
  const { timeline, ui } = site.content;
  const { labels } = timeline;
  const threads = site.shared.timeline.threads.map((thread) => {
    const copy = timeline.threads[thread.id as keyof typeof timeline.threads];
    const periods = thread.segments
      .map((segment) => `${isoMonth(segment.start)} — ${segment.end ? isoMonth(segment.end) : labels.now}`)
      .join(', ');
    const phases = thread.phases.map((phase) => {
      const text = copy.phases[phase.id as keyof typeof copy.phases] as { title: string; body: string };
      return blocks(
        `### ${text.title}${phase.start ? ` (${isoMonth(phase.start)})` : ''}`,
        text.body,
        `Stack: ${phase.stack.join(', ')}`,
      );
    });
    return blocks(
      `## ${copy.label} — ${copy.role}`,
      list([
        `${copy.entityLabel}${thread.entity ? `: ${thread.entity}` : ''}`,
        `${labels.start}: ${isoMonth(thread.segments[0]?.start ?? '') || ui.shell.unknown}`,
        `${labels.periods}: ${periods}`,
        isRunning(thread) ? labels.running : labels.suspended,
      ]),
      copy.summary,
      ...phases,
    );
  });
  return blocks(`## ${timeline.title}`, timeline.subtitle, ...threads);
}

function project(site: Site, item: Project): string {
  const { projects } = site.content;
  const { labels } = projects;
  const copy = projects.items[item.id as keyof typeof projects.items];
  const version = versionWithDate(item, site.locale);
  const facts = [
    version && `${labels.version}: ${version}`,
    // A private project never gets a repository link, nor the GitHub profile in its place.
    item.source.visibility === 'public' ? `${labels.repo}: <${item.source.url}>` : labels.private,
    projectPath(site.locale, item.id).includes('#')
      ? null
      : `[${labels.caseStudy}](${absolute(site.siteUrl, projectPath(site.locale, item.id))})`,
    `Stack: ${item.stack.join(', ')}`,
  ].filter((fact): fact is string => Boolean(fact));
  return blocks(
    `## ${item.name}`,
    copy.teaser,
    copy.summary,
    list(facts),
    `### ${labels.bridge}`,
    copy.bridge,
    `### ${labels.highlights}`,
    list(copy.highlights),
    `### ${labels.architecture}`,
    list(item.layers.map((layer) => `${copy.layers[layer.id as keyof typeof copy.layers]}: ${layer.tech}`)),
  );
}

function projects(site: Site): string {
  const { projects } = site.content;
  return blocks(`## ${projects.title}`, projects.subtitle, ...site.shared.projects.map((item) => project(site, item)));
}

const VIEW_BODY: Record<ViewId, (site: Site) => string> = { hero, identity, timeline, projects };

/** One view of the single-page site, as Markdown. */
export function renderViewMarkdown(site: Site, view: ViewId): string {
  const page: MarkdownPage = { locale: site.locale, view };
  return `${blocks(header(site, page, site.content.ui.meta.views[view].title), VIEW_BODY[view](site), footer(site, page))}\n`;
}

export type StudyInput = { id: CaseStudyId; data: CaseStudyData; copy: CaseStudyCopy; project: Project | undefined };

/**
 * A case study, section by section. The live charts are drawn in the browser from data the
 * page fetches, so they show no figure in the HTML: here they become their titles, what they
 * show and the link to the published data, never numbers the page does not print.
 */
export function renderCaseStudyMarkdown(site: Site, study: StudyInput): string {
  const { data, copy, project } = study;
  const { siteUrl, locale } = site;
  const page: MarkdownPage = { locale, study: study.id };
  const version = project ? versionWithDate(project, locale) : null;
  const access =
    project?.source.visibility === 'public'
      ? `[${copy.access.cta}](${project.source.url})`
      : `[${copy.access.cta}](${absolute(siteUrl, contactsPath(locale))})`;
  const { measures } = copy;

  return `${blocks(
    header(site, page, copy.meta.title),
    `**${copy.label}** — ${copy.title}`,
    copy.lead,
    list([
      `${copy.facts.started.label}: ${copy.facts.started.value}`,
      ...(version ? [`${copy.facts.version.label}: ${version}`] : []),
      `${copy.facts.team.label}: ${copy.facts.team.value}`,
      `${copy.facts.source.label}: ${copy.facts.source.value}`,
      `Stack: ${data.stack.join(', ')}`,
    ]),
    `## ${copy.problem.title}`,
    ...copy.problem.body,
    `## ${copy.constraints.title}`,
    list(copy.constraints.items),
    `## ${copy.architecture.title}`,
    copy.architecture.body,
    list(data.crates.flat().map((crate) => `\`${crate.name}\`: ${copy.architecture.crates[crate.id]}`)),
    copy.architecture.note,
    `## ${copy.flow.title}`,
    copy.flow.intro,
    data.flow.map((id, index) => `${index + 1}. **${copy.flow.steps[id]?.actor}**: ${copy.flow.steps[id]?.text}`).join('\n'),
    `## ${copy.decisions.title}`,
    ...data.decisions.map((id) => blocks(`### ${copy.decisions.items[id]?.title}`, copy.decisions.items[id]?.body)),
    data.measures.length > 0 &&
      blocks(
        `## ${measures.title}`,
        measures.body,
        [
          `| ${measures.columns.query} | ${measures.columns.before} | ${measures.columns.after} |`,
          '| --- | --- | --- |',
          ...data.measures.map((row) => `| ${measures.rows[row.id]} (\`${row.query}\`) | ${row.before} | ${row.after} |`),
        ].join('\n'),
        measures.note,
      ),
    data.live &&
      copy.live &&
      blocks(
        `## ${copy.live.title}`,
        copy.live.intro,
        list([
          `${copy.live.exceedances.title}: ${copy.live.exceedances.caption}`,
          `${copy.live.trend.title}: ${copy.live.trend.caption}`,
          `[${copy.live.data}](${data.live.page})`,
        ]),
        copy.live.credits,
      ),
    `## ${copy.screens.title}`,
    list(data.screens.map((screen) => copy.screens.items[screen.id]?.caption ?? '')),
    `## ${copy.next.title}`,
    list(copy.next.items),
    `## ${copy.access.title}`,
    copy.access.body,
    access,
    project?.source.visibility === 'public' && copy.access.contact
      ? `[${copy.access.contact}](${absolute(siteUrl, contactsPath(locale))})`
      : null,
    `[${copy.back}](${absolute(siteUrl, pathFor(locale, 'projects'))})`,
    footer(site, page),
  )}\n`;
}
