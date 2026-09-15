'use client';

import { motion } from 'framer-motion';
import { fade, introStyle, Line } from '@/components/motion/Reveal';
import { ViewLink } from '@/components/shell/ViewLink';
import { Meta, type ViewProps } from './atoms';

export function HeroView({ data }: ViewProps) {
  const copy = data.content.hero;
  const [first, ...rest] = data.shared.name.split(' ');

  return (
    <div className="flex min-h-full flex-col px-frame pb-8 pt-6 md:pb-10">
      <div className="flex flex-1 items-end">
        <h1 className="select-none text-[clamp(4rem,15.5vw,17rem)] font-medium leading-[0.84] tracking-[-0.06em]">
          <Line intro={0}>{first}</Line>
          {/* Keeps "Samuele Cieri" as two words in the extracted text; invisible between block lines. */}{' '}
          <Line intro={1}>
            <em className="font-serif text-[1.06em] font-normal italic tracking-[-0.025em]">{rest.join(' ')}</em>
          </Line>
        </h1>
      </div>

      <div className="mt-10 grid gap-8 border-t border-line pt-6 md:mt-14 md:grid-cols-12 md:gap-x-6">
        <motion.div variants={fade} className="intro-fade md:col-span-3" style={introStyle(2)}>
          <Meta className="max-w-[26ch]">{copy.hint}</Meta>
        </motion.div>
        <motion.p variants={fade} className="intro-fade text-[15px] leading-snug md:col-span-3" style={introStyle(3)}>
          {copy.role}
          <br />
          <span className="text-muted">{copy.transition}</span>
        </motion.p>
        <motion.p
          variants={fade}
          className="intro-fade max-w-md text-[15px] leading-relaxed text-muted md:col-span-4"
          style={introStyle(4)}
        >
          {copy.lead}
        </motion.p>
        <motion.div variants={fade} className="intro-fade md:col-span-2 md:justify-self-end" style={introStyle(5)}>
          <ViewLink view="identity" className="group inline-flex select-none items-center gap-4 text-[15px]">
            <span className="link-underline">{copy.cta}</span>
            <span
              aria-hidden
              className="grid size-10 place-items-center rounded-full border border-line transition-colors duration-500 group-hover:border-ink group-hover:bg-ink group-hover:text-paper"
            >
              →
            </span>
          </ViewLink>
        </motion.div>
      </div>
    </div>
  );
}
