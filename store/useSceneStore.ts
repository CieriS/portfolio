import { create } from 'zustand';
import { THEME, type ThemeColors } from '@/lib/theme';
import type { ViewId } from '@/lib/views';

/**
 * Normalized device coordinates (-1..1). Mutated in place, never via `set`.
 * `touch` marks finger input; `snap` asks the next frame to jump to the pointer instead of easing.
 */
export type ScenePointer = { x: number; y: number; active: boolean; touch: boolean; snap: boolean };
/** The scene paints with the active theme's colours; `lib/theme.ts` is their single source. */
export type ScenePalette = ThemeColors;

type SceneState = {
  pointer: ScenePointer;
  mode: ViewId;
  palette: ScenePalette;
  setMode: (mode: ViewId) => void;
  setPalette: (palette: ScenePalette) => void;
};

export const useSceneStore = create<SceneState>()((set, get) => ({
  pointer: { x: 0, y: 0, active: false, touch: false, snap: false },
  mode: 'hero',
  palette: THEME.dark,
  setMode: (mode) => {
    if (get().mode !== mode) set({ mode });
  },
  setPalette: (palette) => {
    if (get().palette !== palette) set({ palette });
  },
}));

// Transient write path: the canvas reads these inside useFrame via getState(),
// so pointer motion never notifies subscribers and never re-renders React.
export function writePointer(x: number, y: number, touch: boolean) {
  const pointer = useSceneStore.getState().pointer;
  pointer.x = x;
  pointer.y = y;
  pointer.active = true;
  pointer.touch = touch;
}

export function snapPointer() {
  useSceneStore.getState().pointer.snap = true;
}

export function releasePointer() {
  useSceneStore.getState().pointer.active = false;
}
