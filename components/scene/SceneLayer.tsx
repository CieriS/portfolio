'use client';

import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';
import { DARK_PALETTE, LIGHT_PALETTE, releasePointer, useSceneStore, writePointer } from '@/store/useSceneStore';

const DataField = dynamic(() => import('./DataField'), { ssr: false });

export function SceneLayer() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    useSceneStore.getState().setPalette(resolvedTheme === 'light' ? LIGHT_PALETTE : DARK_PALETTE);
  }, [resolvedTheme]);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      writePointer((event.clientX / window.innerWidth) * 2 - 1, -((event.clientY / window.innerHeight) * 2 - 1));
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', releasePointer);
    window.addEventListener('blur', releasePointer);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', releasePointer);
      window.removeEventListener('blur', releasePointer);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 select-none">
      <DataField />
    </div>
  );
}
