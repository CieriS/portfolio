import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Text primitives with no client-side code, so server-rendered pages (the case studies) can
 * use them without pulling the animation library into their bundle. `views/atoms.tsx`
 * re-exports them for the views.
 */
type MetaProps = { children: ReactNode; className?: string; as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'dt' };

/** Small mono label. `as` keeps the visual style while carrying heading semantics where needed. */
export function Meta({ children, className, as: Tag = 'p' }: MetaProps) {
  return <Tag className={cn('font-mono text-label tracking-label text-muted uppercase', className)}>{children}</Tag>;
}

/** Renders `emphasis` (first occurrence inside `text`) in the italic display serif. */
export function Emphasis({ text, emphasis }: { text: string; emphasis?: string }) {
  const at = emphasis ? text.indexOf(emphasis) : -1;
  if (!emphasis || at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <em className="font-serif text-emphasis font-normal tracking-snug italic">{emphasis}</em>
      {text.slice(at + emphasis.length)}
    </>
  );
}

/** The display size of a page's single `h1`, shared by the views and the case studies. */
export const DISPLAY_TITLE = 'text-title font-medium text-balance hyphens-auto select-none';
