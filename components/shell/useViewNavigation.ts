import { useEffect } from 'react';
import { VIEW_IDS } from '@/lib/views';
import { useViewStoreApi } from '@/store/viewStore';

const SWIPE_MIN_PX = 70;

/** Digits 1–5 jump to a view, ←/→ step through them, horizontal swipes do the same on touch. */
export function useViewNavigation() {
  const store = useViewStoreApi();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;

      const { setView, step } = store.getState();
      const digit = Number.parseInt(event.key, 10);
      if (digit >= 1 && digit <= VIEW_IDS.length) {
        setView(VIEW_IDS[digit - 1]);
      } else if (event.key === 'ArrowRight') {
        step(1);
      } else if (event.key === 'ArrowLeft') {
        step(-1);
      }
    };

    let startX = 0;
    let startY = 0;
    let tracking = false;

    const onTouchStart = (event: TouchEvent) => {
      tracking = event.touches.length === 1;
      if (!tracking) return;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (Math.abs(dx) > SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy) * 1.5) {
        store.getState().step(dx < 0 ? 1 : -1);
      }
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [store]);
}
