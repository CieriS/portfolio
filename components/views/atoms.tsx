'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { fade, Line } from '@/components/motion/Reveal';
import { cn } from '@/lib/cn';
import { pad } from '@/lib/format';
import type { PortfolioView } from '@/lib/portfolio';

export type ViewProps = { data: PortfolioView };

type MetaProps = { children: ReactNode; className?: string; as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' };

/** Small mono label. `as` keeps the visual style while carrying heading semantics where needed. */
export function Meta({ children, className, as: Tag = 'p' }: MetaProps) {
  return (
    <Tag className={cn('select-none font-mono text-[11px] uppercase tracking-[0.14em] text-muted', className)}>{children}</Tag>
  );
}

/** Renders `emphasis` (first occurrence inside `text`) in the italic display serif. */
export function Emphasis({ text, emphasis }: { text: string; emphasis?: string }) {
  const at = emphasis ? text.indexOf(emphasis) : -1;
  if (!emphasis || at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <em className="font-serif text-[1.08em] font-normal italic tracking-[-0.01em]">{emphasis}</em>
      {text.slice(at + emphasis.length)}
    </>
  );
}

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
        <h1 className="select-none text-[clamp(2.5rem,6.4vw,6.75rem)] font-medium leading-[0.95] tracking-[-0.045em] text-balance hyphens-auto">
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
