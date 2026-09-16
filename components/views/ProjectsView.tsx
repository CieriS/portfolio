'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { EASE_OUT, fade } from '@/components/motion/Reveal';
import { cn } from '@/lib/cn';
import { pad, pick } from '@/lib/format';
import type { PortfolioView, Project } from '@/lib/portfolio';
import { Meta, SectionHead, type ViewProps } from './atoms';

type ProjectsCopy = PortfolioView['content']['projects'];

export function ProjectsView({ data }: ViewProps) {
  const copy = data.content.projects;
  const { projects, contacts } = data.shared;
  const profileUrl = contacts.find((contact) => contact.id === 'github')?.url ?? null;
  const [openId, setOpenId] = useState<string | null>(projects[0]?.id ?? null);

  return (
    <div className="px-frame pb-28 pt-10 md:pt-16">
      <SectionHead
        index={4}
        label={data.content.ui.nav.projects}
        title={copy.title}
        emphasis={copy.titleEmphasis}
        subtitle={copy.subtitle}
      />

      <motion.ul variants={fade} className="group/list mt-20 border-b border-line md:mt-32">
        {projects.map((project, index) => (
          <ProjectRow
            key={project.id}
            project={project}
            index={index}
            copy={copy}
            profileUrl={profileUrl}
            open={openId === project.id}
            onToggle={() => setOpenId(openId === project.id ? null : project.id)}
          />
        ))}
      </motion.ul>
    </div>
  );
}

type ProjectRowProps = {
  project: Project;
  index: number;
  copy: ProjectsCopy;
  profileUrl: string | null;
  open: boolean;
  onToggle: () => void;
};

function ProjectRow({ project, index, copy, profileUrl, open, onToggle }: ProjectRowProps) {
  const item = pick(copy.items, project.id);
  const href = project.repo ?? profileUrl;
  const panelId = `project-${project.id}`;

  return (
    <li className="border-t border-line transition-opacity duration-500 md:group-hover/list:opacity-40 md:hover:opacity-100!">
      <h2>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="group grid w-full grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-x-4 py-6 text-left md:grid-cols-12 md:gap-x-6 md:py-9"
        >
          <span className="font-mono text-[11px] tabular-nums text-muted md:col-span-3">{pad(index + 1)}</span>
          <span className="text-[clamp(2.25rem,5.6vw,5.5rem)] font-medium leading-[0.95] tracking-[-0.045em] transition-transform duration-700 ease-out-expo group-hover:translate-x-3 md:col-span-6">
            {project.name}
          </span>
          <span className="hidden text-right font-mono text-[11px] uppercase tracking-[0.14em] text-muted md:col-span-2 md:block">
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

      {/* The id lives on a wrapper that is always rendered: the panel itself is unmounted
          when collapsed, which would leave the button's aria-controls pointing at nothing. */}
      <div id={panelId}>
        <AnimatePresence initial={false}>
          {open && item && (
            <motion.div
              key="panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.8, ease: EASE_OUT }}
              className="overflow-hidden"
            >
              <div className="grid gap-12 pb-12 md:grid-cols-12 md:gap-x-6 md:pb-16">
                <p className="text-lg leading-relaxed md:col-span-4 md:col-start-4 md:text-xl md:leading-snug md:tracking-[-0.01em]">
                  {item.summary}
                </p>

                <div className="md:col-span-2 md:col-start-8">
                  <Meta as="h3">{copy.labels.architecture}</Meta>
                  <ol className="relative mt-5 space-y-5 before:absolute before:bottom-2 before:left-[3px] before:top-2 before:w-px before:bg-line">
                    {project.layers.map((layer) => (
                      <li key={layer.id} className="relative pl-6">
                        <span aria-hidden className="absolute left-0 top-[0.45em] size-[7px] rounded-full border border-ink bg-paper" />
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
                  {href && (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link inline-flex select-none items-center gap-3 self-start text-[15px]"
                    >
                      <span className="link-underline group-hover/link:bg-[length:100%_1px]">
                        {project.repo ? copy.labels.repo : copy.labels.profile}
                      </span>
                      <span aria-hidden>↗</span>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </li>
  );
}
