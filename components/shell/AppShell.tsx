'use client';

import { AnimatePresence, MotionConfig } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { introStyle } from '@/components/motion/Reveal';
import { ViewFrame } from '@/components/motion/ViewFrame';
import { DisciplineView } from '@/components/views/DisciplineView';
import { HeroView } from '@/components/views/HeroView';
import { IdentityView } from '@/components/views/IdentityView';
import { ProjectsView } from '@/components/views/ProjectsView';
import { TimelineView } from '@/components/views/TimelineView';
import type { Locale } from '@/i18n/routing';
import { pad } from '@/lib/format';
import type { PortfolioView } from '@/lib/portfolio';
import { VIEW_IDS, type ViewId } from '@/lib/views';
import { useViewStore } from '@/store/viewStore';
import { LocaleSwitch } from './LocaleSwitch';
import { NavBar } from './NavBar';
import { ThemeToggle } from './ThemeToggle';
import { useViewNavigation } from './useViewNavigation';
import { useViewUrlSync } from './useViewUrlSync';
import { ViewLink } from './ViewLink';

const RENDER: Record<ViewId, (data: PortfolioView) => ReactNode> = {
  hero: (data) => <HeroView data={data} />,
  identity: (data) => <IdentityView data={data} />,
  timeline: (data) => <TimelineView data={data} />,
  projects: (data) => <ProjectsView data={data} />,
  discipline: (data) => <DisciplineView data={data} />,
};

type AppShellProps = { data: PortfolioView; locale: Locale; onLocaleChange: (locale: Locale) => void };

export function AppShell({ data, locale, onLocaleChange }: AppShellProps) {
  // Only view changes re-render the shell; pointer/scene state is transient.
  const active = useViewStore((state) => state.active);
  const step = useViewStore((state) => state.step);
  const shell = useTranslations('shell');
  const nav = useTranslations('nav');
  useViewNavigation();
  useViewUrlSync(locale, data.content.ui.meta);

  const index = VIEW_IDS.indexOf(active);

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative z-10 flex h-dvh flex-col">
        <header className="intro-fade flex select-none items-center justify-between gap-6 px-frame pb-3 pt-4 md:pt-6" style={introStyle(0)}>
          <ViewLink view="hero" className="select-none whitespace-nowrap text-[15px] font-medium tracking-[-0.01em]">
            <span className="link-underline">{data.shared.name}</span>
          </ViewLink>
          <p className="hidden font-mono text-[11px] uppercase tracking-[0.14em] text-muted lg:block">{shell('role')}</p>
          <div className="flex items-center gap-6">
            <LocaleSwitch locale={locale} onChange={onLocaleChange} />
            <ThemeToggle />
          </div>
        </header>

        <main className="relative min-h-0 flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <ViewFrame key={`${active}:${locale}`} label={nav(active)}>
              {RENDER[active](data)}
            </ViewFrame>
          </AnimatePresence>
        </main>

        <footer className="intro-fade flex select-none items-center justify-between gap-6 px-frame pb-4 pt-3 md:pb-6" style={introStyle(1)}>
          <NavBar />
          <div className="hidden items-center gap-4 md:flex">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label={shell('prev')}
              className="grid size-9 place-items-center rounded-full border border-line transition-colors duration-500 hover:border-ink hover:bg-ink hover:text-paper"
            >
              ←
            </button>
            <p className="font-mono text-[11px] tabular-nums text-muted">
              <span className="text-ink">{pad(index + 1)}</span> / {pad(VIEW_IDS.length)}
            </p>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label={shell('next')}
              className="grid size-9 place-items-center rounded-full border border-line transition-colors duration-500 hover:border-ink hover:bg-ink hover:text-paper"
            >
              →
            </button>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
