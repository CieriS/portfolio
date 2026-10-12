'use client';

import { useEffect } from 'react';
import type { ViewId } from '@/lib/views';
import { useSceneStore } from '@/store/useSceneStore';

/** A case study has no view of its own: it borrows the scene of the view it belongs to. */
export function SceneMode({ mode }: { mode: ViewId }) {
  useEffect(() => {
    useSceneStore.getState().setMode(mode);
  }, [mode]);
  return null;
}
