import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { routing, type Locale } from '@/i18n/routing';
import { getCaseStudy } from '@/lib/caseStudy';
import { pad } from '@/lib/format';
import { getPortfolioBundle } from '@/lib/portfolio';
import { THEME } from '@/lib/theme';
import { VIEW_IDS, type CaseStudyId, type ViewId } from '@/lib/views';

/**
 * Alt text shared by both opengraph-image routes. `alt` is a static export of Next's file
 * convention, so it cannot vary per generated param: it reads the default locale and the
 * other languages get the same string — as they already did when it was hardcoded twice.
 */
export const OG_ALT = getPortfolioBundle().contents[routing.defaultLocale].ui.meta.views.hero.title;

// Share cards are always drawn in the dark theme.
const { paper: PAPER, ink: INK } = THEME.dark;
const MUTED = '#8c8b86';
const LINE = 'rgba(236, 235, 231, 0.14)';

type Card = { locale: Locale; label: string; title: string; titleSize: number; subtitle: string };

/** 1200×630 share card in the site's visual language, with the legacy brand icon. */
export async function renderOgImage(locale: Locale, view: ViewId): Promise<ImageResponse> {
  const { shared, contents } = getPortfolioBundle();
  const { ui, hero } = contents[locale];
  const isHero = view === 'hero';
  return renderCard({
    locale,
    label: `(${pad(VIEW_IDS.indexOf(view) + 1)}) ${ui.nav[view].toUpperCase()}`,
    title: isHero ? shared.name : ui.nav[view],
    titleSize: isHero ? 136 : 120,
    subtitle: isHero ? hero.transition : ui.meta.views[view].title,
  });
}

/** The same card for a case study: the project name, under the label of the projects view. */
export async function renderCaseStudyOgImage(locale: Locale, id: CaseStudyId): Promise<ImageResponse> {
  const { shared, contents } = getPortfolioBundle();
  const { data, copy } = getCaseStudy(id);
  return renderCard({
    locale,
    label: `${contents[locale].ui.nav.projects} / ${copy[locale].label}`.toUpperCase(),
    title: shared.projects.find((project) => project.id === data.project)?.name ?? data.project,
    titleSize: 120,
    subtitle: copy[locale].title,
  });
}

async function renderCard({ locale, label, title, titleSize, subtitle }: Card): Promise<ImageResponse> {
  const { shared, contents } = getPortfolioBundle();
  const { ui } = contents[locale];
  const icon = await readFile(join(process.cwd(), 'app/icon.png'));
  const iconSrc = `data:image/png;base64,${icon.toString('base64')}`;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        background: PAPER,
        color: INK,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain <img> only */}
          <img src={iconSrc} width={56} height={56} alt="" />
          <span style={{ fontSize: 28 }}>{shared.name}</span>
        </div>
        <span style={{ fontSize: 22, color: MUTED, letterSpacing: 4 }}>{label}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: titleSize, lineHeight: 1, letterSpacing: -5 }}>{title}</span>
        <span style={{ marginTop: 32, fontSize: 32, color: MUTED }}>{subtitle}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, borderTop: `1px solid ${LINE}`, paddingTop: 28 }}>
        <span style={{ width: 10, height: 10, borderRadius: 10, background: '#ff5b1f' }} />
        <span style={{ fontSize: 22, color: MUTED, letterSpacing: 3 }}>{ui.shell.role.toUpperCase()}</span>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
