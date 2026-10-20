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
    <nav aria-label={shell('nav')} className="select-none">
      <ul className="flex items-center gap-3 min-[400px]:gap-4 md:gap-8">
        {VIEW_IDS.map((id, index) => {
          const isActive = id === active;
          return (
            <li key={id}>
              <ViewLink
                view={id}
                aria-current={isActive ? 'page' : undefined}
                className="group relative flex items-baseline gap-2 py-2 text-[13px] select-none"
              >
                {/* The name comes from the content, so what is read matches what is shown: the
                    index is decoration, the everyday word is there for every link. */}
                <span
                  aria-hidden
                  className={cn(
                    'font-mono text-[11px] tabular-nums transition-colors duration-300',
                    isActive ? 'text-ink' : 'text-muted group-hover:text-ink',
                  )}
                >
                  {pad(index + 1)}
                </span>
                {/* On small screens only the active label is shown next to its index. */}
                <span
                  className={cn(
                    'transition-colors duration-300',
                    isActive ? 'text-ink' : 'sr-only text-muted group-hover:text-ink md:not-sr-only',
                  )}
                >
                  {t(id)}
                </span>
                {/* The view names are a naming system; the plain word says what the view holds.
                    Shown next to the active view only, read out for every link. */}{' '}
                <span className={isActive ? 'font-mono text-[11px] whitespace-nowrap text-muted' : 'sr-only'}>· {plain(id)}</span>
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-0 bottom-0.5 h-px bg-ink"
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
