import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * The round bordered icon next to links and controls (arrows, +, ↓). No client-side code, so
 * server pages can use it too. `roundIcon` gives the classes for an element that is itself the
 * control (the shell's previous/next buttons); `RoundIcon` is the decorative span inside a link.
 */
export type RoundIconOptions = {
  /** `sm` (36 px) in the shell footer, `md` (40 px) everywhere else. */
  size?: 'sm' | 'md';
  /** Filled with ink: an open panel. */
  active?: boolean;
  /**
   * What hovering does while inactive: `fill` inverts the icon, `border` only darkens the ring.
   * `group` reacts to the hover of the enclosing `.group` (a link or a row), `self` to its own.
   */
  hover?: 'fill' | 'border';
  trigger?: 'group' | 'self';
};

const HOVER = {
  group: { fill: 'group-hover:border-ink group-hover:bg-ink group-hover:text-paper', border: 'group-hover:border-ink' },
  self: { fill: 'hover:border-ink hover:bg-ink hover:text-paper', border: 'hover:border-ink' },
} as const;

export function roundIcon({ size = 'md', active = false, hover = 'fill', trigger = 'group' }: RoundIconOptions = {}): string {
  return cn(
    'grid place-items-center rounded-full border transition-all duration-500 ease-out-expo select-none',
    size === 'sm' ? 'size-9' : 'size-10',
    active ? 'border-ink bg-ink text-paper' : `border-line ${HOVER[trigger][hover]}`,
  );
}

type RoundIconProps = RoundIconOptions & { children: ReactNode; className?: string };

/** Decorative: the link or button around it carries the accessible name. */
export function RoundIcon({ children, className, ...options }: RoundIconProps) {
  return (
    <span aria-hidden className={cn(roundIcon(options), className)}>
      {children}
    </span>
  );
}
