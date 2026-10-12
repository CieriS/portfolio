'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { EASE_OUT, fade } from '@/components/motion/Reveal';
import { ViewLink } from '@/components/shell/ViewLink';
import { cn } from '@/lib/cn';
import { pad, pick } from '@/lib/format';
import type { PortfolioView, Project } from '@/lib/portfolio';
import { releaseUrl, versionLabel } from '@/lib/projects';
import { caseStudyPath, isCaseStudyId, type Locale } from '@/lib/routes';
import { Meta, SectionHead, type ViewProps } from './atoms';

type ProjectsCopy = PortfolioView['content']['projects'];

export function ProjectsView({ data }: ViewProps) {
  const copy = data.content.projects;
  const { projects } = data.shared;
  // Every project starts collapsed: the list reads as an index, and a panel opens on request.
  // The one exception is an address that names a project (`/systems#ariaer`, as the home links
  // do): that panel starts open, until the visitor opens or closes one by hand.
  const fragment = useSyncExternalStore(subscribeToHash, readHash, () => '');
  const [chosen, setChosen] = useState<string | null | undefined>(undefined);
  const named = projects.some((project) => project.id === fragment) ? fragment : null;
  const openId = chosen === undefined ? named : chosen;

  // Arriving by such an address: bring the project into view and hand it the keyboard. Deferred
  // by a task, so it comes after the view frame has taken focus for the view change.
  useEffect(() => {
    const id = readHash();
    const timer = setTimeout(() => {
      const row = id ? document.getElementById(id) : null;
      row?.scrollIntoView({ block: 'start' });
      row?.querySelector('button')?.focus({ preventScroll: true });
    });
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="px-frame pt-10 pb-28 md:pt-16">
      <SectionHead
        index={4}
        label={data.content.ui.nav.projects}
        title={copy.title}
        emphasis={copy.titleEmphasis}
        subtitle={copy.subtitle}
      />

      <motion.ul variants={fade} className="mt-20 border-b border-line md:mt-32">
        {projects.map((project, index) => (
          <ProjectRow
            key={project.id}
            project={project}
            index={index}
            locale={data.locale}
            copy={copy}
            open={openId === project.id}
            onToggle={() => setChosen(openId === project.id ? null : project.id)}
          />
        ))}
      </motion.ul>
    </div>
  );
}

const readHash = () => decodeURIComponent(window.location.hash.slice(1));

function subscribeToHash(notify: () => void) {
  window.addEventListener('hashchange', notify);
  return () => window.removeEventListener('hashchange', notify);
}

type ProjectRowProps = {
  project: Project;
  index: number;
  locale: Locale;
  copy: ProjectsCopy;
  open: boolean;
  onToggle: () => void;
};

function ProjectRow({ project, index, locale, copy, open, onToggle }: ProjectRowProps) {
  const item = pick(copy.items, project.id);
  const panelId = `project-${project.id}`;

  return (
    <li id={project.id} className="border-t border-line">
      <h2>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="group grid w-full grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-x-4 py-6 text-left md:grid-cols-12 md:gap-x-6 md:py-9"
        >
          <span className="font-mono text-[11px] text-muted tabular-nums md:col-span-3">{pad(index + 1)}</span>
          <span className="text-[clamp(2.25rem,5.6vw,5.5rem)] leading-[0.95] font-medium tracking-[-0.045em] transition-transform duration-700 ease-out-expo group-hover:translate-x-3 md:col-span-6">
            {project.name}
          </span>
          <span className="hidden text-right font-mono text-[11px] tracking-[0.14em] text-muted uppercase md:col-span-2 md:block">
            {project.stack.join(' · ')}
          </span>
          <span
            aria-hidden
            className={cn(
              'grid size-10 place-items-center justify-self-end rounded-full border border-line text-lg font-light transition-all duration-500 ease-out-expo md:col-span-1',
              open ? 'rotate-45 border-ink bg-ink text-paper' : 'group-hover:border-ink',
            )}
          >
            +
          </span>
        </button>
      </h2>

      {/* Collapsed panels stay mounted, so every project's copy and repository link is in the
          prerendered HTML for crawlers; `inert` keeps them away from focus and assistive tech. */}
      {item && (
        <motion.div
          id={panelId}
          inert={!open}
          initial={false}
          animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
          className="overflow-hidden"
        >
          <div className="grid gap-12 pb-12 md:grid-cols-12 md:gap-x-6 md:pb-16">
            <div className="md:col-span-4 md:col-start-4">
              <p className="text-lg leading-relaxed md:text-xl md:leading-snug md:tracking-[-0.01em]">{item.summary}</p>
              <Meta as="h3" className="mt-10">
                {copy.labels.highlights}
              </Meta>
              <ul className="mt-5 space-y-3 text-[15px] leading-snug text-muted">
                {item.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-3">
                    <span aria-hidden className="font-mono text-ink">
                      —
                    </span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2 md:col-start-8">
              <Meta as="h3">{copy.labels.architecture}</Meta>
              <ol className="relative mt-5 space-y-5 before:absolute before:top-2 before:bottom-2 before:left-[3px] before:w-px before:bg-line">
                {project.layers.map((layer) => (
                  <li key={layer.id} className="relative pl-6">
                    <span
                      aria-hidden
                      className="absolute top-[0.45em] left-0 size-[7px] rounded-full border border-ink bg-paper"
                    />
                    <p className="text-[15px] leading-tight">{layer.tech}</p>
                    <p className="mt-1 text-sm text-muted">{pick(item.layers, layer.id) ?? layer.id}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex flex-col gap-8 md:col-span-3 md:col-start-10">
              <div>
                <Meta as="h3">{copy.labels.bridge}</Meta>
                <p className="mt-5 text-[15px] leading-relaxed text-muted">{item.bridge}</p>
              </div>
              <Version project={project} label={copy.labels.version} />
              <SourceLink project={project} copy={copy} />
              {/* A page of its own, outside the view carousel: a plain link, so it navigates. */}
              {isCaseStudyId(project.id) && (
                <a href={caseStudyPath(locale, project.id)} className={LINK_CLASS} data-case-study>
                  <span className="link-underline group-hover/link:bg-[length:100%_1px]">{copy.labels.caseStudy}</span>
                  <span aria-hidden>→</span>
                </a>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </li>
  );
}

/** The released version: a link to its tag for public code, plain text for private code. */
function Version({ project, label }: { project: Project; label: string }) {
  const version = versionLabel(project);
  if (!version) return null;
  const release = releaseUrl(project);

  return (
    <div data-version>
      <Meta as="h3">{label}</Meta>
      <p className="mt-5 text-[15px] tabular-nums">
        {release ? (
          <a href={release} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
            <span className="link-underline group-hover/link:bg-[length:100%_1px]">{version}</span>
            <span aria-hidden>↗</span>
          </a>
        ) : (
          version
        )}
      </p>
    </div>
  );
}

const LINK_CLASS = 'group/link inline-flex select-none items-center gap-3 self-start text-[15px]';

/** Public code links out to its repository; private code points to the contacts, where access can be asked for. */
function SourceLink({ project, copy }: { project: Project; copy: ProjectsCopy }) {
  const text = project.source.visibility === 'public' ? copy.labels.repo : copy.labels.private;
  const label = <span className="link-underline group-hover/link:bg-[length:100%_1px]">{text}</span>;

  if (project.source.visibility === 'public') {
    return (
      <a href={project.source.url} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
        {label}
        <span aria-hidden>↗</span>
      </a>
    );
  }

  return (
    <ViewLink view="identity" className={LINK_CLASS} data-source="private">
      {label}
      <span aria-hidden>→</span>
    </ViewLink>
  );
}
