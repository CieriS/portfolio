import Image from 'next/image';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import { ThemeToggle } from '@/components/shell/ThemeToggle';
import { DISPLAY_TITLE, Emphasis, Meta } from '@/components/ui/text';
import { routing, type Locale } from '@/i18n/routing';
import { getCaseStudy } from '@/lib/caseStudy';
import { CASE_STUDY_IMAGES } from '@/lib/caseStudyImages';
import { cn } from '@/lib/cn';
import { pad, pick } from '@/lib/format';
import { getPortfolioBundle } from '@/lib/portfolio';
import { buildCaseStudyJsonLd } from '@/lib/structuredData';
import { caseStudyPath, pathFor, VIEW_IDS, type CaseStudyId } from '@/lib/views';
import { SceneMode } from './SceneMode';

const LINK = 'group/link inline-flex items-center gap-3 text-[15px]';
const UNDERLINE = 'link-underline group-hover/link:bg-[length:100%_1px]';

/**
 * A project told at length: problem, constraints, architecture, decisions, measures,
 * screenshots. Rendered on the server from `data/case-studies/<id>.json`, so the whole text
 * is in the prerendered HTML and the page ships almost no script of its own. It is a document
 * with real links, not a sixth view: leaving it is a navigation.
 */
export function CaseStudyPage({ locale, id }: { locale: Locale; id: CaseStudyId }) {
  const { shared, contents } = getPortfolioBundle();
  const { ui } = contents[locale];
  const { data, copy } = getCaseStudy(id);
  const text = copy[locale];
  const images = CASE_STUDY_IMAGES[id];
  const name = shared.projects.find((project) => project.id === data.project)?.name ?? data.project;
  const projectsPath = pathFor(locale, 'projects');
  const json = JSON.stringify(buildCaseStudyJsonLd(locale, id)).replace(/</g, '\\u003c');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
      <SceneMode mode="projects" />
      <div className="relative z-10 flex h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-[var(--frame)] focus:z-20 focus:rounded-full focus:border focus:border-ink focus:bg-paper focus:px-4 focus:py-2 focus:text-[13px]"
        >
          {ui.shell.skip}
        </a>
        <header className="relative z-20 flex items-center justify-between gap-6 px-frame pt-4 pb-3 select-none md:pt-6">
          <div className="flex min-w-0 items-center gap-6">
            <a
              href={pathFor(locale, 'hero')}
              className="group/link hidden text-[15px] font-medium tracking-[-0.01em] whitespace-nowrap sm:block"
            >
              <span className={UNDERLINE}>{shared.name}</span>
            </a>
            {/* The header stays put while the page scrolls: the way back is always on screen. */}
            <a href={projectsPath} data-back className="group/link flex items-center gap-2 text-[15px] whitespace-nowrap">
              <span aria-hidden>←</span>
              <span className={UNDERLINE}>
                <span className="sm:hidden">{ui.nav.projects}</span>
                <span className="hidden sm:inline">{text.back}</span>
              </span>
            </a>
          </div>
          <div className="flex items-center gap-6">
            <nav aria-label={ui.locale.label}>
              <ul className="flex gap-3 font-mono text-[11px] tracking-[0.14em] uppercase">
                {routing.locales.map((other) => (
                  <li key={other}>
                    <a
                      href={caseStudyPath(other, id)}
                      hrefLang={other}
                      aria-current={other === locale ? 'page' : undefined}
                      className={cn('py-2 transition-colors hover:text-ink', other === locale ? 'text-ink' : 'text-muted')}
                    >
                      {ui.locale[other]}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <NextIntlClientProvider locale={locale} messages={{ theme: ui.theme }} timeZone="UTC">
              <ThemeToggle />
            </NextIntlClientProvider>
          </div>
        </header>

        {/* Focusable, like the views: the page scrolls inside this element, not in the document. */}
        <main id="main" tabIndex={0} className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain fade-edges">
          <article className="px-frame pt-10 pb-28 md:pt-16">
            <header className="grid gap-y-8 md:grid-cols-12 md:gap-x-6">
              <Meta className="md:col-span-3">
                <a href={projectsPath} className="group/link">
                  <span className={UNDERLINE}>
                    ({pad(VIEW_IDS.indexOf('projects') + 1)}) {ui.nav.projects}
                  </span>
                </a>{' '}
                / {text.label}
              </Meta>
              <div className="md:col-span-9">
                <h1 className={DISPLAY_TITLE}>{name}</h1>
                <p className="mt-8 max-w-3xl text-[clamp(1.5rem,3vw,2.5rem)] leading-[1.1] font-medium tracking-[-0.03em] text-balance">
                  <Emphasis text={text.title} emphasis={text.titleEmphasis} />
                </p>
                <p className="mt-8 max-w-xl text-[15px] leading-relaxed text-muted">{text.lead}</p>
              </div>
            </header>

            <Section>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-5 md:col-span-9 md:col-start-4 md:grid-cols-4">
                {Object.entries(text.facts).map(([key, fact]) => (
                  <div key={key}>
                    <Meta as="dt">{fact.label}</Meta>
                    <dd className="mt-3 text-[15px]">{fact.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase md:col-span-9 md:col-start-4">
                {data.stack.join(' · ')}
              </p>
            </Section>

            <Section title={text.problem.title}>
              <Prose>
                {text.problem.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </Prose>
            </Section>

            <Section title={text.constraints.title}>
              <ul className="space-y-4 md:col-span-9">
                {text.constraints.items.map((item) => (
                  <li key={item} className="flex max-w-2xl gap-3 text-[15px] leading-relaxed">
                    <span aria-hidden className="font-mono text-muted">
                      —
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title={text.architecture.title}>
              <div className="md:col-span-9">
                <Prose>
                  <p>{text.architecture.body}</p>
                </Prose>
                <ol className="mt-10 space-y-2">
                  {data.crates.map((row, index) => (
                    <li key={row[0].id}>
                      {index > 0 && (
                        <p aria-hidden className="py-1 text-center font-mono text-[11px] text-muted select-none">
                          ↓
                        </p>
                      )}
                      <div className={cn('grid gap-2', row.length > 1 && 'sm:grid-cols-2')}>
                        {row.map((crate) => (
                          <div key={crate.id} className="border border-line bg-paper p-5">
                            <p className="font-mono text-[13px]">{crate.name}</p>
                            <p className="mt-2 text-sm leading-relaxed text-muted">{pick(text.architecture.crates, crate.id)}</p>
                          </div>
                        ))}
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="mt-6 max-w-2xl text-sm text-muted">{text.architecture.note}</p>
              </div>
            </Section>

            <Section title={text.flow.title}>
              <div className="md:col-span-9">
                <p className="text-[15px] text-muted">{text.flow.intro}</p>
                <ol className="mt-6 border-b border-line">
                  {data.flow.map((step, index) => {
                    const item = pick(text.flow.steps, step);
                    return (
                      <li
                        key={step}
                        className="grid gap-x-6 gap-y-2 border-t border-line py-5 sm:grid-cols-[2.5rem_8rem_minmax(0,1fr)]"
                      >
                        <span className="font-mono text-[11px] text-muted tabular-nums select-none">{pad(index + 1)}</span>
                        <Meta as="span">{item?.actor}</Meta>
                        <p className="max-w-2xl text-[15px] leading-relaxed">{item?.text}</p>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </Section>

            <Section title={text.decisions.title}>
              <ol className="grid gap-x-6 gap-y-12 sm:grid-cols-2 md:col-span-9">
                {data.decisions.map((decision, index) => {
                  const item = pick(text.decisions.items, decision);
                  return (
                    <li key={decision} className="border-t border-line pt-5">
                      <span className="font-mono text-[11px] text-muted tabular-nums select-none">{pad(index + 1)}</span>
                      <h3 className="mt-4 text-lg font-medium tracking-[-0.015em]">{item?.title}</h3>
                      <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted">{item?.body}</p>
                    </li>
                  );
                })}
              </ol>
            </Section>

            {data.measures.length > 0 && (
              <Section title={text.measures.title}>
                <div className="md:col-span-9">
                  <Prose>
                    <p>{text.measures.body}</p>
                  </Prose>
                  <table className="mt-10 w-full max-w-2xl text-left text-[15px]">
                    <caption className="caption-bottom pt-4 text-left text-sm text-muted">{text.measures.note}</caption>
                    <thead>
                      <tr className="border-b border-line">
                        {[text.measures.columns.query, text.measures.columns.before, text.measures.columns.after].map(
                          (column, index) => (
                            <th key={column} scope="col" className={cn('py-3 font-normal', index > 0 && 'pl-6 text-right')}>
                              <Meta as="span">{column}</Meta>
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {data.measures.map((measure) => (
                        <tr key={measure.id} className="border-b border-line">
                          <th scope="row" className="py-4 pr-6 font-normal">
                            {pick(text.measures.rows, measure.id)}
                            <span className="mt-1 block font-mono text-[11px] text-muted">{measure.query}</span>
                          </th>
                          <td className="py-4 pl-6 text-right whitespace-nowrap text-muted tabular-nums">{measure.before}</td>
                          <td className="py-4 pl-6 text-right font-medium whitespace-nowrap tabular-nums">{measure.after}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}

            <Section title={text.screens.title}>
              <div className="space-y-12 md:col-span-9">
                {data.screens.map((screen) => {
                  const item = pick(text.screens.items, screen.id);
                  const image = images[screen.id];
                  if (!item || !image) return null;
                  return (
                    <figure key={screen.id} className={cn(screen.device === 'phone' && 'max-w-[18rem]')}>
                      <Image
                        src={image}
                        alt={item.alt}
                        sizes={screen.device === 'phone' ? '18rem' : '(min-width: 768px) 72vw, 100vw'}
                        className="h-auto w-full border border-line"
                      />
                      <figcaption className="mt-3 text-sm text-muted">{item.caption}</figcaption>
                    </figure>
                  );
                })}
              </div>
            </Section>

            <Section title={text.next.title}>
              <ul className="space-y-4 md:col-span-9">
                {text.next.items.map((item) => (
                  <li key={item} className="flex max-w-2xl gap-3 text-[15px] leading-relaxed">
                    <span aria-hidden className="font-mono text-muted">
                      —
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title={text.access.title}>
              <div className="md:col-span-9">
                <Prose>
                  <p>{text.access.body}</p>
                </Prose>
                <p className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
                  <a href={pathFor(locale, 'identity')} className={LINK} data-source="private">
                    <span className={UNDERLINE}>{text.access.cta}</span>
                    <span aria-hidden>→</span>
                  </a>
                  <a href={projectsPath} className={LINK}>
                    <span aria-hidden>←</span>
                    <span className={UNDERLINE}>{text.back}</span>
                  </a>
                </p>
              </div>
            </Section>
          </article>
        </main>
      </div>
    </>
  );
}

/** One block of the page: its title in the left column, like the sections of the views. */
function Section({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="mt-20 grid gap-y-8 md:mt-28 md:grid-cols-12 md:gap-x-6">
      {title && (
        <div className="md:col-span-3">
          <Meta as="h2">{title}</Meta>
        </div>
      )}
      {children}
    </section>
  );
}

function Prose({ children }: { children: ReactNode }) {
  return <div className="max-w-2xl space-y-5 text-lg leading-relaxed md:col-span-9 md:text-xl md:leading-snug">{children}</div>;
}
