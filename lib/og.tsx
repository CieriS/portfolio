import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import type { Locale } from '@/i18n/routing';
import { pad } from '@/lib/format';
import { getPortfolioBundle } from '@/lib/portfolio';
import { VIEW_IDS, type ViewId } from '@/lib/views';

const PAPER = '#0b0b0b';
const INK = '#ecebe7';
const MUTED = '#8c8b86';
const LINE = 'rgba(236, 235, 231, 0.14)';

/** 1200×630 share card in the site's visual language, with the legacy brand icon. */
export async function renderOgImage(locale: Locale, view: ViewId): Promise<ImageResponse> {
  const { shared, contents } = getPortfolioBundle();
  const { ui, hero } = contents[locale];
  const icon = await readFile(join(process.cwd(), 'app/icon.png'));
  const iconSrc = `data:image/png;base64,${icon.toString('base64')}`;
  const isHero = view === 'hero';

  return new ImageResponse(
    (
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
          <span style={{ fontSize: 22, color: MUTED, letterSpacing: 4 }}>
            {`(${pad(VIEW_IDS.indexOf(view) + 1)}) ${ui.nav[view].toUpperCase()}`}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: isHero ? 136 : 120, lineHeight: 1, letterSpacing: -5 }}>
            {isHero ? shared.name : ui.nav[view]}
          </span>
          <span style={{ marginTop: 32, fontSize: 32, color: MUTED }}>
            {isHero ? hero.transition : ui.meta.views[view].title}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, borderTop: `1px solid ${LINE}`, paddingTop: 28 }}>
          <span style={{ width: 10, height: 10, borderRadius: 10, background: '#ff5b1f' }} />
          <span style={{ fontSize: 22, color: MUTED, letterSpacing: 3 }}>{ui.shell.role.toUpperCase()}</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
