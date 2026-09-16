'use client';

import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';
import { DARK_PALETTE, LIGHT_PALETTE, releasePointer, snapPointer, useSceneStore, writePointer } from '@/store/useSceneStore';
import { SceneErrorBoundary } from './SceneErrorBoundary';

const DataField = dynamic(() => import('./DataField'), { ssr: false });

export function SceneLayer() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    useSceneStore.getState().setPalette(resolvedTheme === 'light' ? LIGHT_PALETTE : DARK_PALETTE);
  }, [resolvedTheme]);

  useEffect(() => {
    const write = (clientX: number, clientY: number, touch: boolean) => {
      writePointer((clientX / window.innerWidth) * 2 - 1, -((clientY / window.innerHeight) * 2 - 1), touch);
    };

    // Fingers are tracked through touch events: the browser cancels touch pointer events
    // as soon as a gesture turns into a scroll, which would freeze the field mid-drag.
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') write(event.clientX, event.clientY, false);
    };
    const onLeave = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') releasePointer();
    };
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) write(touch.clientX, touch.clientY, true);
    };
    const onTouchStart = (event: TouchEvent) => {
      onTouchMove(event);
      // First contact: land under the finger instead of sweeping in from the last lift point.
      if (event.touches.length === 1) snapPointer();
    };
    const onTouchEnd = (event: TouchEvent) => {
      if (event.touches.length === 0) releasePointer();
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', releasePointer);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', releasePointer);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 select-none">
      <SceneErrorBoundary>
        <DataField />
      </SceneErrorBoundary>
    </div>
  );
}
