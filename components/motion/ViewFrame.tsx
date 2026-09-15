'use client';

import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { EASE_IN_OUT } from './Reveal';

const frame: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.3, delayChildren: 0.05, staggerChildren: 0.06 } },
  exit: { opacity: 0, transition: { duration: 0.4, ease: EASE_IN_OUT, delay: 0.2 } },
};

export function ViewFrame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <motion.section
      aria-label={label}
      variants={frame}
      initial="enter"
      animate="center"
      exit="exit"
      className="no-scrollbar fade-edges absolute inset-0 overflow-y-auto overscroll-y-contain"
    >
      {children}
    </motion.section>
  );
}
