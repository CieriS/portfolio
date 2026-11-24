'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { pad } from '@/lib/format';
import { VIEW_IDS } from '@/lib/views';
import { useViewStore } from '@/store/viewStore';
import { ViewLink } from './ViewLink';

export function NavBar() {
  const active = useViewStore((state) => state.active);
  const t = useTranslations('nav');
  const plain = useTranslations('navPlain');
  const shell = useTranslations('shell');

  return (
    // `data-view-keys`: the digit shortcuts act only while focus is in here (#121).
    <nav aria-label={shell('nav')} data-view-keys className="select-none">
      <ul className="flex items-center gap-3 min-[400px]:gap-4 md:gap-8">
        {VIEW_IDS.map((id, index) => {
          const isActive = id === active;
          return (
            <li key={id}>
              <ViewLink
                view={id}
                aria-current={isActive ? 'page' : undefined}
                className="group relative flex min-h-11 items-center gap-1.5 text-small select-none md:gap-2"
              >
                {/* The name comes from the content, so what is read matches what is shown: the
                    index is decoration. Every link is read as "system name · plain word". */}
                <span
                  aria-hidden
                  className={cn(
                    'font-mono text-label tabular-nums transition-colors duration-300',
                    isActive ? 'text-ink' : 'text-muted group-hover:text-ink',
                  )}
                >
                  {pad(index + 1)}
                </span>
                {/* From `md` every entry shows its system name; on phones it is only read out. */}
                <span
                  className={cn(
                    'transition-colors duration-300 max-md:sr-only',
                    isActive ? 'text-ink' : 'text-muted group-hover:text-ink',
                  )}
                >
                  {t(id)}
                </span>{' '}
                {/* The plain word says what the view holds. On phones every entry shows it, so no
                    entry is a bare number (#95); from `md` it sits next to the active view only. */}
                <span
                  data-plain
                  className={cn(
                    'whitespace-nowrap transition-colors duration-300',
                    isActive ? 'text-ink md:font-mono md:text-label md:text-muted' : 'text-muted group-hover:text-ink md:sr-only',
                  )}
                >
                  <span className="max-md:sr-only">· </span>
                  {plain(id)}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-0 bottom-2 h-px bg-ink"
                    transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                  />
                )}
              </ViewLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
