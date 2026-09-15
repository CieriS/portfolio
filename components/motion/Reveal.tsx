'use client';

import { motion, type Variants } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

/** Masked line: slides up from beneath its own baseline. */
export const lineVariants: Variants = {
  enter: { y: '105%' },
  center: { y: '0%', transition: { duration: 1.1, ease: EASE_OUT } },
  exit: { y: '-105%', transition: { duration: 0.5, ease: EASE_IN_OUT } },
};

export const fade: Variants = {
  enter: { opacity: 0, y: 14 },
  center: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE_OUT } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.35, ease: EASE_IN_OUT } },
};

/** Stagger index consumed by the first-paint CSS intro (`.intro-line`, `.intro-fade`). */
export function introStyle(index: number): CSSProperties {
  return { '--i': index } as CSSProperties;
}

type LineProps = { children: ReactNode; className?: string; intro?: number };

export function Line({ children, className, intro }: LineProps) {
  const hasIntro = intro !== undefined;
  return (
    <span className={cn('-mb-[0.12em] block overflow-hidden pb-[0.12em] pr-[0.06em]', className)}>
      <motion.span
        variants={lineVariants}
        className={cn('block', hasIntro && 'intro-line')}
        style={hasIntro ? introStyle(intro) : undefined}
      >
        {children}
      </motion.span>
    </span>
  );
}
