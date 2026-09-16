'use client';

import { motion, type Variants } from 'framer-motion';
import { useEffect, useRef, type ReactNode } from 'react';
import { EASE_IN_OUT } from './Reveal';

const frame: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.3, delayChildren: 0.05, staggerChildren: 0.06 } },
  exit: { opacity: 0, transition: { duration: 0.4, ease: EASE_IN_OUT, delay: 0.2 } },
};

export function ViewFrame({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLElement>(null);

  /**
   * Views are swapped without navigating, so nothing tells assistive tech that the page
   * changed. Moving focus to the new section makes screen readers announce its label, and
   * it puts the keyboard caret inside the scroll container the user is now looking at.
   * `data-booted` marks the handover from the first-paint CSS intro: on the very first
   * render there is no previous view, so stealing focus would only interrupt the intro.
   */
  useEffect(() => {
    if (document.documentElement.dataset.booted !== undefined) ref.current?.focus();
  }, []);

  return (
    <motion.section
      ref={ref}
      aria-label={label}
      // Focusable so the scrollable region can be reached and scrolled with the keyboard
      // alone (WCAG 2.1.1) in views that hold no interactive elements of their own.
      tabIndex={0}
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
