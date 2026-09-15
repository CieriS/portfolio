import type { ViewId } from '@/lib/views';

export type SceneParams = {
  amplitude: number;
  frequency: number;
  speed: number;
  flow: number;
  pulse: number;
  radius: number;
  force: number;
  presence: number;
  camX: number;
  camY: number;
  camZ: number;
  rotY: number;
};

export const PARAM_KEYS: ReadonlyArray<keyof SceneParams> = [
  'amplitude',
  'frequency',
  'speed',
  'flow',
  'pulse',
  'radius',
  'force',
  'presence',
  'camX',
  'camY',
  'camZ',
  'rotY',
];

// Each view reshapes the same field; `presence` recedes it behind text-heavy views.
export const SCENE_MODES: Record<ViewId, SceneParams> = {
  hero: { amplitude: 0.5, frequency: 0.5, speed: 0.5, flow: 10, pulse: 0.8, radius: 2.4, force: 1.1, presence: 1, camX: 0, camY: 4.6, camZ: 10.5, rotY: 0 },
  identity: { amplitude: 0.25, frequency: 0.35, speed: 0.3, flow: 6, pulse: 0.4, radius: 2, force: 0.7, presence: 0.45, camX: -5, camY: 7, camZ: 8.5, rotY: -0.35 },
  timeline: { amplitude: 0.3, frequency: 0.7, speed: 0.8, flow: 16, pulse: 0.9, radius: 2, force: 0.8, presence: 0.5, camX: 0, camY: 11, camZ: 3.5, rotY: 0 },
  projects: { amplitude: 0.4, frequency: 1, speed: 0.45, flow: 8, pulse: 0.6, radius: 2.6, force: 1, presence: 0.45, camX: 6, camY: 4.2, camZ: 9, rotY: 0.5 },
  discipline: { amplitude: 0.75, frequency: 0.3, speed: 1, flow: 5, pulse: 0.35, radius: 3, force: 1.3, presence: 0.55, camX: 0, camY: 2.4, camZ: 12, rotY: 0 },
};
