'use client';

import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { SCROLL_TRACK, scrollThumb, type ScrollThumb } from '@/lib/scroll';
import { EASE_IN_OUT } from './Reveal';

const frame: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.3, delayChildren: 0.05, staggerChildren: 0.06 } },
  exit: { opacity: 0, transition: { duration: 0.4, ease: EASE_IN_OUT, delay: 0.2 } },
};

export function ViewFrame({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLElement>(null);
  const [stage, setStage] = useState(0);
  const [thumb, setThumb] = useState<ScrollThumb | null>(null);
  const { scrollYProgress } = useScroll({ container: ref });
  const thumbY = useTransform(scrollYProgress, (progress) => progress * (thumb?.travel ?? 0));

  // Scrollbars are hidden, so a view taller than the stage needs another sign that it goes on.
  // Measured rather than assumed: the same view fits on a tall screen and overflows a short one.
  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    const measure = () => {
      setStage(section.clientHeight);
      setThumb(scrollThumb(section.clientHeight, section.scrollHeight));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(section);
    for (const child of section.children) observer.observe(child);
    measure();
    return () => observer.disconnect();
  }, []);

  /**
   * Views are swapped without navigating, so nothing tells assistive tech that the page
   * changed. Moving focus to the new section makes screen readers announce its label, and
   * it puts the keyboard caret inside the scroll container the user is now looking at.
   * `data-booted` marks the handover from the first-paint CSS intro: on the very first
   * render there is no previous view, so stealing focus would only interrupt the intro.
   * A control marked `data-keep-focus` (the language menu) keeps it: the same view simply
   * re-renders in another language, and the keyboard user stays where they were.
   */
  useEffect(() => {
    if (document.documentElement.dataset.booted === undefined) return;
    if (document.activeElement?.closest('[data-keep-focus]')) return;
    ref.current?.focus();
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
      className="absolute inset-0 no-scrollbar overflow-y-auto overscroll-y-contain fade-edges"
    >
      {thumb && (
        // Zero-height sticky anchor: the indicator stays put while the content scrolls under it.
        <div aria-hidden data-scroll-indicator className="pointer-events-none sticky top-0 z-10 h-0">
          <div className="absolute right-1.5 flex items-center md:right-3" style={{ top: 0, height: stage }}>
            <div className="relative w-px bg-line" style={{ height: SCROLL_TRACK }}>
              <motion.div className="absolute inset-x-0 top-0 bg-ink" style={{ height: thumb.size, y: thumbY }} />
            </div>
          </div>
        </div>
      )}
      {children}
    </motion.section>
  );
}
