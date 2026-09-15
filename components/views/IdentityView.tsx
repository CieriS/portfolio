'use client';

import { motion } from 'framer-motion';
import { fade, Line } from '@/components/motion/Reveal';
import { pad } from '@/lib/format';
import { Emphasis, Meta, type ViewProps } from './atoms';

export function IdentityView({ data }: ViewProps) {
  const copy = data.content.identity;
  const label = data.content.ui.nav.identity;
  const { contacts } = data.shared;

  return (
    <div className="px-frame pb-28 pt-10 md:pt-16">
      <div className="grid gap-y-8 md:grid-cols-12 md:gap-x-6">
        <motion.div variants={fade} className="flex gap-[0.5em] md:col-span-3">
          {/* The index is decoration: keep it out of the page's h1. */}
          <Meta as="span">(02)</Meta>
          <Meta as="h1">{label}</Meta>
        </motion.div>
        <div className="md:col-span-9">
          <motion.div variants={fade}>
            <Meta>{copy.kicker}</Meta>
          </motion.div>
          <p className="mt-6 text-[clamp(1.9rem,4.2vw,4.25rem)] leading-[1.05] tracking-[-0.04em] text-balance">
            <Line>
              <Emphasis text={copy.statement} emphasis={copy.statementEmphasis} />
            </Line>
          </p>
        </div>
      </div>

      <div className="mt-24 grid gap-y-10 md:mt-36 md:grid-cols-12 md:gap-x-6">
        <motion.div variants={fade} className="md:col-span-3">
          <Meta as="h2">{copy.principlesTitle}</Meta>
        </motion.div>
        <motion.ol variants={fade} className="grid gap-x-6 gap-y-12 sm:grid-cols-2 md:col-span-9">
          {copy.principles.map((principle, index) => (
            <li key={principle.title} className="border-t border-line pt-5">
              <span className="select-none font-mono text-[11px] tabular-nums text-muted">{pad(index + 1)}</span>
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
                <span className="select-none text-[clamp(1.75rem,4vw,3.75rem)] font-medium leading-none tracking-[-0.04em] transition-transform duration-700 ease-out-expo group-hover:translate-x-3">
                  {contact.label}
                </span>
                <span className="flex items-center gap-5">
                  <span className="hidden font-mono text-[11px] uppercase tracking-[0.14em] text-muted sm:inline">{contact.handle}</span>
                  <span
                    aria-hidden
                    className="grid size-10 select-none place-items-center rounded-full border border-line transition-all duration-500 ease-out-expo group-hover:rotate-45 group-hover:border-ink group-hover:bg-ink group-hover:text-paper"
                  >
                    ↑
                  </span>
                </span>
              </a>
            </li>
          ))}
        </motion.ul>
      </div>
    </div>
  );
}
