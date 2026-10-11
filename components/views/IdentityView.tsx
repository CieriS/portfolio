'use client';

import { motion } from 'framer-motion';
import { fade } from '@/components/motion/Reveal';
import { pad } from '@/lib/format';
import { Meta, SectionHead, type ViewProps } from './atoms';
import { CvRequest } from './CvRequest';

export function IdentityView({ data }: ViewProps) {
  const copy = data.content.identity;
  const label = data.content.ui.nav.identity;
  const { contacts } = data.shared;

  return (
    <div className="px-frame pt-10 pb-28 md:pt-16">
      {/* The title is the statement's own first sentence, so this view opens like the others
          without a generic heading in front of the manifesto. */}
      <SectionHead index={2} label={label} title={copy.title} emphasis={copy.titleEmphasis} subtitle={copy.subtitle} />

      <div className="mt-24 grid gap-y-10 md:mt-36 md:grid-cols-12 md:gap-x-6">
        <motion.div variants={fade} className="md:col-span-3">
          <Meta as="h2">{copy.principlesTitle}</Meta>
        </motion.div>
        <motion.ol variants={fade} className="grid gap-x-6 gap-y-12 sm:grid-cols-2 md:col-span-9">
          {copy.principles.map((principle, index) => (
            <li key={principle.title} className="border-t border-line pt-5">
              <span className="font-mono text-[11px] text-muted tabular-nums select-none">{pad(index + 1)}</span>
              <h3 className="mt-4 text-lg font-medium tracking-[-0.015em]">{principle.title}</h3>
              <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-muted">{principle.body}</p>
            </li>
          ))}
        </motion.ol>
      </div>

      <div className="mt-24 grid gap-y-8 md:mt-36 md:grid-cols-12 md:gap-x-6">
        <motion.div variants={fade} className="md:col-span-3">
          <Meta as="h2">{copy.contactsTitle}</Meta>
          <p className="mt-3 max-w-[24ch] text-sm text-muted">{copy.contactsNote}</p>
        </motion.div>
        <motion.ul variants={fade} className="border-b border-line md:col-span-9">
          {contacts.map((contact) => (
            <li key={contact.id} className="border-t border-line">
              <a
                href={contact.url}
                target="_blank"
                rel="noopener noreferrer me"
                className="group flex items-center justify-between gap-6 py-5 md:py-7"
              >
                <span className="text-[clamp(1.75rem,4vw,3.75rem)] leading-none font-medium tracking-[-0.04em] transition-transform duration-700 ease-out-expo select-none group-hover:translate-x-3">
                  {contact.label}
                </span>
                <span className="flex items-center gap-5">
                  <span className="hidden font-mono text-[11px] tracking-[0.14em] text-muted uppercase sm:inline">
                    {contact.handle}
                  </span>
                  <span
                    aria-hidden
                    className="grid size-10 place-items-center rounded-full border border-line transition-all duration-500 ease-out-expo select-none group-hover:rotate-45 group-hover:border-ink group-hover:bg-ink group-hover:text-paper"
                  >
                    ↑
                  </span>
                </span>
              </a>
            </li>
          ))}
          <CvRequest data={data} />
        </motion.ul>
      </div>
    </div>
  );
}
