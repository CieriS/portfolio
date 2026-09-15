'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useMounted } from '@/lib/hooks';

const ORDER = ['system', 'light', 'dark'] as const;
type ThemeChoice = (typeof ORDER)[number];

// Icon fill encodes the choice: empty = light, half = auto, full = dark.
const FILL: Record<ThemeChoice, number> = { light: 0, system: 0.5, dark: 1 };

function isThemeChoice(value: string | undefined): value is ThemeChoice {
  return ORDER.includes(value as ThemeChoice);
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const t = useTranslations('theme');

  const current: ThemeChoice = mounted && isThemeChoice(theme) ? theme : 'system';
  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`${t('label')}: ${t(current)}`}
      className="group flex items-center gap-2.5 py-2 text-[13px]"
    >
      <span aria-hidden className="relative size-3.5 overflow-hidden rounded-full border border-ink">
        <span
          className="absolute inset-0 origin-right bg-ink transition-transform duration-500 ease-out-expo"
          style={{ transform: `scaleX(${FILL[current]})` }}
        />
      </span>
      <span className="min-w-[3.25rem] text-left text-muted transition-colors duration-300 group-hover:text-ink">
        {mounted ? t(current) : ' '}
      </span>
    </button>
  );
}
