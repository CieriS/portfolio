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
import { RoundIcon } from '@/components/ui/RoundIcon';

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
      {/* The title says what the view holds, principles and contacts (#139), so this view opens
          like the others with one plain heading. */}
      <SectionHead index={2} label={label} title={copy.title} emphasis={copy.titleEmphasis} subtitle={copy.subtitle} />

      <div className="mt-section grid gap-y-10 md:grid-cols-12 md:gap-x-6">
        <motion.div variants={fade} className="md:col-span-3">
          <Meta as="h2">{copy.principlesTitle}</Meta>
        </motion.div>
        <motion.ol variants={fade} className="grid gap-x-6 gap-y-12 sm:grid-cols-2 md:col-span-9">
          {copy.principles.map((principle, index) => (
            <li key={principle.title} className="border-t border-line pt-5">
              <span className="font-mono text-label text-muted tabular-nums select-none">{pad(index + 1)}</span>
              <h3 className="mt-4 text-lg font-medium tracking-snug">{principle.title}</h3>
              <p className="mt-2 max-w-sm text-body leading-relaxed text-muted">{principle.body}</p>
            </li>
          ))}
        </motion.ol>
      </div>

      {/* What the removed fifth view said, in one line (issue #50). */}
      <div className="mt-section grid gap-y-4 md:grid-cols-12 md:gap-x-6">
        <motion.div variants={fade} className="md:col-span-3">
          <Meta as="h2">{copy.outsideTitle}</Meta>
        </motion.div>
        <motion.p variants={fade} className="max-w-xl text-body leading-relaxed text-muted md:col-span-9">
          {copy.outside}
        </motion.p>
      </div>

      <div id={CONTACTS_FRAGMENT} tabIndex={-1} className="mt-section grid scroll-mt-10 gap-y-8 md:grid-cols-12 md:gap-x-6">
        <motion.div variants={fade} className="md:col-span-3">
          <Meta as="h2">{copy.contactsTitle}</Meta>
          {/* The role sought sits with the contacts too: it is where a recruiter acts on it (#104). */}
          <p data-seeking className="mt-3 max-w-[28ch] text-body leading-snug">
            {data.content.hero.seeking}
          </p>
          <p className="mt-3 max-w-[28ch] text-sm text-muted">{copy.contactsNote}</p>
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
        <RoundIcon className={`${ROW_ICON} group-hover:rotate-45`}>↑</RoundIcon>
      </a>
    </li>
  );
}
