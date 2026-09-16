'use client';

import { routing } from '@/i18n/routing';
import { getPortfolioBundle } from '@/lib/portfolio';

/**
 * Last resort: this replaces the root layout, so it has to ship its own <html> and <body>
 * and cannot rely on the theme, the fonts or the locale from the URL. Deliberately plain,
 * with inline styles, so it still renders when the stylesheet is the thing that failed.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const copy = getPortfolioBundle().contents[routing.defaultLocale].ui.error;

  return (
    <html lang={routing.defaultLocale}>
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '1.5rem',
          padding: '2rem',
          background: '#0b0b0b',
          color: '#ecebe7',
          font: '15px/1.5 ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 'clamp(2.5rem, 8vw, 5rem)', lineHeight: 0.95, letterSpacing: '-0.04em' }}>
          {copy.title}
        </h1>
        <p style={{ margin: 0, maxWidth: '28rem', color: '#8c8b86' }}>{copy.body}</p>
        <button
          type="button"
          onClick={reset}
          style={{
            alignSelf: 'flex-start',
            padding: '0.6rem 1.2rem',
            border: '1px solid rgba(236, 235, 231, 0.3)',
            borderRadius: '999px',
            background: 'transparent',
            color: 'inherit',
            font: 'inherit',
            cursor: 'pointer',
          }}
        >
          {copy.cta}
        </button>
      </body>
    </html>
  );
}
