'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { fade, Line } from '@/components/motion/Reveal';
import { DISPLAY_TITLE, Emphasis, Meta } from '@/components/ui/text';
import { pad } from '@/lib/format';
import type { PortfolioView } from '@/lib/portfolio';

export { Emphasis, Meta };
export type ViewProps = { data: PortfolioView };

export function Pulse() {
  return (
    <span aria-hidden className="relative flex size-1.5">
      <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-75 motion-reduce:hidden" />
      <span className="relative size-1.5 rounded-full bg-accent" />
    </span>
  );
}

type SectionHeadProps = {
  index: number;
  label: string;
  title: string;
  emphasis?: string;
  subtitle?: string;
  aside?: ReactNode;
};

/** Page header of a view: its title is the single `h1` of the view's URL. */
export function SectionHead({ index, label, title, emphasis, subtitle, aside }: SectionHeadProps) {
  return (
    <header className="grid gap-y-8 md:grid-cols-12 md:gap-x-6">
      <motion.div variants={fade} className="md:col-span-3">
        <Meta>
          ({pad(index)}) {label}
        </Meta>
      </motion.div>
      <div className="md:col-span-9">
        <h1 className={DISPLAY_TITLE}>
          <Line>
            <Emphasis text={title} emphasis={emphasis} />
          </Line>
        </h1>
        {(subtitle || aside) && (
          <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            {subtitle && (
              <motion.p variants={fade} className="max-w-md text-[15px] leading-relaxed text-muted">
                {subtitle}
              </motion.p>
            )}
            {aside}
          </div>
        )}
      </div>
    </header>
  );
}
