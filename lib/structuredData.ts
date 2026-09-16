import { routing, type Locale } from '@/i18n/routing';
import { pick } from '@/lib/format';
import { getPortfolioBundle } from '@/lib/portfolio';
import { absoluteUrl } from '@/lib/site';
import { pathFor, type ViewId } from '@/lib/views';

type Node = Record<string, unknown>;

/** schema.org graph: WebSite + Person + ProfilePage, with breadcrumbs and project source code where relevant. */
export function buildJsonLd(locale: Locale, view: ViewId): Node {
  const { shared, contents } = getPortfolioBundle();
  const content = contents[locale];
  const meta = content.ui.meta;
  const siteUrl = absoluteUrl('/');
  const homeUrl = absoluteUrl(pathFor(locale, 'hero'));
  const pageUrl = absoluteUrl(pathFor(locale, view));
  const personId = `${siteUrl}#person`;
  const websiteId = `${siteUrl}#website`;

  // Facts that already live in `shared`, surfaced to search engines rather than restated here.
  const { organization } = shared.timeline.threadA;
  const { institution } = shared.timeline.threadB;

  const knowsAbout = [
    ...new Set([
      ...shared.timeline.threadA.phases.flatMap((phase) => phase.stack),
      ...shared.projects.flatMap((project) => project.stack),
      'Data Engineering',
    ]),
  ];

  const graph: Node[] = [
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: siteUrl,
      name: meta.siteName,
      inLanguage: [...routing.locales],
      publisher: { '@id': personId },
    },
    {
      '@type': 'Person',
      '@id': personId,
      name: shared.name,
      url: homeUrl,
      image: absoluteUrl('/icon.png'),
      jobTitle: content.hero.role,
      description: meta.description,
      knowsAbout,
      knowsLanguage: [...routing.locales],
      ...(organization ? { worksFor: { '@type': 'Organization', name: organization } } : {}),
      ...(institution ? { alumniOf: { '@type': 'CollegeOrUniversity', name: institution } } : {}),
      sameAs: shared.contacts.map((contact) => contact.url),
    },
    {
      '@type': 'ProfilePage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: meta.views[view].title,
      description: meta.views[view].description,
      inLanguage: locale,
      isPartOf: { '@id': websiteId },
      mainEntity: { '@id': personId },
      ...(view === 'hero' ? {} : { breadcrumb: { '@id': `${pageUrl}#breadcrumb` } }),
    },
  ];

  if (view !== 'hero') {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: shared.name, item: homeUrl },
        { '@type': 'ListItem', position: 2, name: content.ui.nav[view], item: pageUrl },
      ],
    });
  }

  if (view === 'projects') {
    graph.push({
      '@type': 'ItemList',
      '@id': `${pageUrl}#projects`,
      itemListElement: shared.projects.map((project, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'SoftwareSourceCode',
          name: project.name,
          description: pick(content.projects.items, project.id)?.summary,
          programmingLanguage: project.stack,
          author: { '@id': personId },
          ...(project.repo ? { codeRepository: project.repo } : {}),
        },
      })),
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}
