import { useEffect } from 'react';
import { VIEW_IDS } from '@/lib/views';
import { useViewStoreApi } from '@/store/viewStore';

const SWIPE_MIN_PX = 70;

/** Digits 1–5 jump to a view, ←/→ step through them, horizontal swipes do the same on touch. */
export function useViewNavigation() {
  const store = useViewStoreApi();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // `repeat`: a held arrow key would step once per repeat, and every step pushes a
      // history entry — Safari throws SecurityError past ~100 pushState calls per 30s.
      // `shiftKey`: Shift+Arrow extends a text selection and must not also change view.
      if (event.defaultPrevented || event.repeat) return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
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
      } else {
        return;
      }
      // Claimed: stop the browser from also scrolling or moving the caret on the same key.
      event.preventDefault();
    };

    let startX = 0;
    let startY = 0;
    let tracking = false;

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      tracking = event.touches.length === 1 && touch !== undefined;
      if (!touch) return;
      startX = touch.clientX;
      startY = touch.clientY;
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      // A gesture that grew to multiple fingers is a pinch, not a swipe.
      const touch = event.touches.length === 0 ? event.changedTouches[0] : undefined;
      if (!touch) return;
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
