'use client';

import { motion } from 'framer-motion';
import { fade, introStyle, Line } from '@/components/motion/Reveal';
import { ProjectLink } from '@/components/shell/ProjectLink';
import { ViewLink } from '@/components/shell/ViewLink';
import { splitByNames } from '@/lib/projects';
import { CONTACTS_FRAGMENT } from '@/lib/views';
import { Meta, type ViewProps } from './atoms';
import { RoundIcon } from '@/components/ui/RoundIcon';

export function HeroView({ data }: ViewProps) {
  const copy = data.content.hero;
  const contact = data.content.identity.contactsTitle;
  const [first, ...rest] = data.shared.name.split(' ');

  return (
    <div className="flex min-h-full flex-col px-frame pt-6 pb-8 md:pb-10">
      <div className="flex flex-1 items-end">
        <h1 className="text-display font-medium select-none">
          <Line intro={0}>{first}</Line>
          {/* Keeps "Samuele Cieri" as two words in the extracted text; invisible between block lines. */}{' '}
          <Line intro={1}>
            <em className="font-serif text-emphasis font-normal tracking-snug italic">{rest.join(' ')}</em>
          </Line>
        </h1>
      </div>

      <div className="mt-10 grid gap-8 border-t border-line pt-6 md:mt-14 md:grid-cols-12 md:gap-x-6">
        {/* The hint speaks of a cursor: a touch screen has none (#95). */}
        <motion.div variants={fade} className="intro-fade md:col-span-3 [@media(hover:none)]:hidden" style={introStyle(2)}>
          <Meta className="max-w-[26ch]">{copy.hint}</Meta>
        </motion.div>
        {/* The two ways on sit right under the role, before the paragraph: on a phone they are on
            the first screen, and the reading order is the order of the keyboard (#131, #132). */}
        <motion.div variants={fade} className="intro-fade space-y-6 md:col-span-3" style={introStyle(3)}>
          <p className="text-body leading-snug">
            {copy.role}
            <br />
            <span className="text-muted">{copy.transition}</span>
          </p>
          {/* The first question of a recruiter, answered next to the role (#104). */}
          <p data-seeking className="text-body leading-snug">
            {copy.seeking}
          </p>
          <p className="flex flex-wrap items-center gap-x-8 gap-y-2 select-none">
            <ViewLink view="projects" data-cta="projects" className="group inline-flex min-h-11 items-center gap-4 text-body">
              <span className="link-underline">{copy.cta}</span>
              <RoundIcon>→</RoundIcon>
            </ViewLink>
            <ViewLink
              view="identity"
              fragment={CONTACTS_FRAGMENT}
              data-cta="contacts"
              className="inline-flex min-h-11 items-center text-body text-muted transition-colors hover:text-ink"
            >
              <span className="link-underline">{contact}</span>
            </ViewLink>
          </p>
        </motion.div>
        {/* The lead keeps the voice; the detail names employer, studies, stack and projects, so the
            page that ranks for the name also says in plain text what the others elaborate. */}
        <motion.div
          variants={fade}
          className="intro-fade max-w-md space-y-3 text-body leading-relaxed text-muted md:col-span-5 md:col-start-8"
          style={introStyle(4)}
        >
          <p>{copy.lead}</p>
          <p>
            {/* Each project named here leads straight to it: the evidence is one click from the home. */}
            {splitByNames(copy.detail, data.shared.projects).map((segment) =>
              segment.id ? (
                <ProjectLink
                  key={segment.id}
                  project={segment.id}
                  className="text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
                >
                  {segment.text}
                </ProjectLink>
              ) : (
                segment.text
              ),
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
