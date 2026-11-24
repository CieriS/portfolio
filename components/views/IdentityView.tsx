'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { fade } from '@/components/motion/Reveal';
import { pad } from '@/lib/format';
import { fragmentId } from '@/lib/projects';
import { CONTACTS_FRAGMENT } from '@/lib/views';
import { Meta, SectionHead, type ViewProps } from './atoms';
import { ROW, ROW_DETAIL, ROW_ICON, ROW_LABEL } from './contactRow';
import { CvRequest } from './CvRequest';

export function IdentityView({ data }: ViewProps) {
  const copy = data.content.identity;
  const label = data.content.ui.nav.identity;
  const { contacts, sponsor } = data.shared;

  // Arriving by `#contacts` (the home page, the case studies): bring the contact list into view
  // and put the keyboard inside it. Deferred by a task, so it comes after the view frame has
  // taken focus for the view change, as in the projects view.
  useEffect(() => {
    if (fragmentId(window.location.hash) !== CONTACTS_FRAGMENT) return;
    const timer = setTimeout(() => {
      const section = document.getElementById(CONTACTS_FRAGMENT);
      section?.scrollIntoView({ block: 'start' });
      section?.focus({ preventScroll: true });
    });
    return () => clearTimeout(timer);
  }, []);

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

      {/* What the removed fifth view said, in one line (issue #50). */}
      <div className="mt-24 grid gap-y-4 md:mt-36 md:grid-cols-12 md:gap-x-6">
        <motion.div variants={fade} className="md:col-span-3">
          <Meta as="h2">{copy.outsideTitle}</Meta>
        </motion.div>
        <motion.p variants={fade} className="max-w-xl text-[15px] leading-relaxed text-muted md:col-span-9">
          {copy.outside}
        </motion.p>
      </div>

      <div id={CONTACTS_FRAGMENT} tabIndex={-1} className="mt-24 grid scroll-mt-10 gap-y-8 md:mt-36 md:grid-cols-12 md:gap-x-6">
        <motion.div variants={fade} className="md:col-span-3">
          <Meta as="h2">{copy.contactsTitle}</Meta>
          <p className="mt-3 max-w-[24ch] text-sm text-muted">{copy.contactsNote}</p>
        </motion.div>
        {/* What a recruiter wants most comes first: the CV, then LinkedIn (#133). */}
        <motion.ul variants={fade} className="border-b border-line md:col-span-9">
          <CvRequest data={data} />
          {contacts.map((contact) => (
            <LinkRow
              key={contact.id}
              href={contact.url}
              label={contact.label}
              detail={contact.handle}
              rel="noopener noreferrer me"
            />
          ))}
          <LinkRow href={sponsor.url} label={copy.sponsor} detail={sponsor.label} rel="noopener noreferrer" />
        </motion.ul>
      </div>
    </div>
  );
}

/** One large outbound link: the name, a short detail (under it on phones) and the arrow. */
function LinkRow({ href, label, detail, rel }: { href: string; label: string; detail: string; rel: string }) {
  return (
    <li className="border-t border-line">
      <a href={href} target="_blank" rel={rel} className={ROW}>
        <span className={ROW_LABEL}>{label}</span> <span className={ROW_DETAIL}>{detail}</span>
        <span
          aria-hidden
          className={`${ROW_ICON} grid size-10 place-items-center rounded-full border border-line transition-all duration-500 ease-out-expo select-none group-hover:rotate-45 group-hover:border-ink group-hover:bg-ink group-hover:text-paper`}
        >
          ↑
        </span>
      </a>
    </li>
  );
}
