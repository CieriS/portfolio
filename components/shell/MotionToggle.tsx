'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { isPausedValue, MOTION_STORAGE_KEY, PAUSED } from '@/lib/motionPreference';
import { useSceneStore } from '@/store/useSceneStore';

/** Reads and writes storage defensively: private modes and blocked storage throw. */
function readStored(): string | null {
  try {
    return window.localStorage.getItem(MOTION_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStored(paused: boolean) {
  try {
    if (paused) window.localStorage.setItem(MOTION_STORAGE_KEY, PAUSED);
    else window.localStorage.removeItem(MOTION_STORAGE_KEY);
  } catch {
    // Not remembered, but the pause still holds for this visit.
  }
}

/**
 * Pauses the scene and the decorative loops (#142, WCAG 2.2.2) for a visitor without the
 * reduced-motion setting. A toggle button: the name stays, `aria-pressed` carries the state.
 */
export function MotionToggle() {
  const paused = useSceneStore((state) => state.paused);
  const setPaused = useSceneStore((state) => state.setPaused);
  const t = useTranslations('motion');

  useEffect(() => {
    setPaused(isPausedValue(readStored()));
  }, [setPaused]);

  useEffect(() => {
    const root = document.documentElement;
    if (paused) root.dataset.motion = PAUSED;
    else delete root.dataset.motion;
  }, [paused]);

  return (
    <button
      type="button"
      data-motion-toggle
      aria-pressed={paused}
      aria-label={t('pause')}
      onClick={() => {
        setPaused(!paused);
        writeStored(!paused);
      }}
      className="flex size-11 items-center justify-center text-muted transition-colors duration-300 hover:text-ink aria-pressed:text-ink"
    >
      {/* Two bars while moving (what a press does), a play triangle while paused. */}
      <svg aria-hidden viewBox="0 0 14 14" className="size-3.5" fill="currentColor">
        {paused ? <path d="M3 1.5v11l9.5-5.5z" /> : <path d="M2.5 1.5h3v11h-3zM8.5 1.5h3v11h-3z" />}
      </svg>
    </button>
  );
}
