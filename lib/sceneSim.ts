import { FIELD, wrap, WAVE_PERIOD } from './sceneField';
import {
  groundHit,
  hexToLinear,
  multiply,
  perspective,
  rotationY,
  toRotatedFrame,
  viewMatrix,
  type Mat4,
  type Vec3,
} from './sceneMath';
import { PARAM_KEYS, SCENE_MODES, type SceneParams } from './sceneModes';
import type { ThemeColors } from './theme';
import type { ViewId } from './views';

export const CAMERA = { fov: 40, near: 0.1, far: 80, start: [0, 5.2, 10.5] as Vec3 };

/** Mutable state carried from frame to frame. Never part of React state. */
export type SimState = {
  params: SceneParams;
  camera: Vec3;
  wave: number;
  flow: number;
  heat: number;
  px: number;
  pz: number;
  palette: ThemeColors | null;
  colors: { base: Vec3; dot: Vec3; ink: Vec3 };
};

export type SimPointer = { x: number; y: number; active: boolean; touch: boolean; snap: boolean };

export type SimInput = {
  mode: ViewId;
  palette: ThemeColors;
  pointer: SimPointer;
  /** Seconds since the previous frame. */
  delta: number;
  /** Reduced motion: every value jumps to its target and nothing advances with time. */
  still: boolean;
  /** CSS pixels of the canvas, and the device pixel ratio it is drawn at. */
  width: number;
  height: number;
  dpr: number;
};

/** Everything the shader receives for one frame. */
export type FrameUniforms = {
  uWave: number;
  uFlow: number;
  uHeat: number;
  uPointer: [number, number];
  uRadius: number;
  uAmplitude: number;
  uFrequency: number;
  uForce: number;
  uPulse: number;
  uGlowScale: number;
  uSize: number;
  uScale: number;
  uBase: Vec3;
  uInk: Vec3;
  modelViewMatrix: Mat4;
  projectionMatrix: Mat4;
};

export function createSim(): SimState {
  return {
    params: { ...SCENE_MODES.hero },
    camera: [...CAMERA.start],
    wave: 0,
    flow: 0,
    heat: 0,
    px: 0,
    pz: 0,
    palette: null,
    colors: { base: [0, 0, 0], dot: [0, 0, 0], ink: [0, 0, 0] },
  };
}

/**
 * Advances the field by one frame and returns the shader inputs. Mutates `sim` and clears
 * `pointer.snap` once honoured, as the frame loop on three did.
 */
export function stepSim(sim: SimState, input: SimInput): FrameUniforms {
  const { pointer, still } = input;
  const target = SCENE_MODES[input.mode];
  const dt = Math.min(input.delta, 1 / 20);
  const ease = still ? 1 : 1 - Math.exp(-dt * 2);
  const p = sim.params;

  for (const key of PARAM_KEYS) p[key] += (target[key] - p[key]) * ease;
  if (!still) {
    sim.wave += dt * p.speed;
    sim.flow += dt * p.flow;
  }

  if (input.palette !== sim.palette) {
    sim.colors = {
      base: hexToLinear(input.palette.paper),
      dot: hexToLinear(input.palette.dot),
      ink: hexToLinear(input.palette.ink),
    };
    sim.palette = input.palette;
  }

  // Camera: mode pose + pointer parallax. Not on touch, where the scene would slide under the finger.
  const camEase = still ? 1 : 1 - Math.exp(-dt * 2.5);
  const parallax = pointer.touch ? 0 : 1;
  const cam = sim.camera;
  cam[0] += (p.camX + pointer.x * 0.8 * parallax - cam[0]) * camEase;
  cam[1] += (p.camY + pointer.y * 0.4 * parallax - cam[1]) * camEase;
  cam[2] += (p.camZ - cam[2]) * camEase;
  const aspect = input.width / input.height;

  // Project the pointer onto the field plane, in grid-local space.
  const hit = groundHit(cam, CAMERA.fov, aspect, pointer.x, pointer.y);
  if (hit) {
    const [hx, hz] = toRotatedFrame(hit[0], hit[1], p.rotY);
    // Touch input is sparser and jitterier than a mouse, so it is followed more softly.
    const follow = still || pointer.snap ? 1 : 1 - Math.exp(-dt * (pointer.touch ? 4 : 7));
    sim.px += (hx - sim.px) * follow;
    sim.pz += (hz - sim.pz) * follow;
    pointer.snap = false;
  }
  sim.heat += ((pointer.active && hit ? 1 : 0) - sim.heat) * ease;

  const presence = Math.min(1, p.presence * input.palette.presenceScale);
  const { base, dot, ink } = sim.colors;
  return {
    uWave: wrap(sim.wave, WAVE_PERIOD),
    uFlow: wrap(sim.flow, FIELD.packetSpan),
    uHeat: sim.heat,
    uPointer: [sim.px, sim.pz],
    uRadius: p.radius,
    uAmplitude: p.amplitude,
    uFrequency: p.frequency,
    uForce: p.force,
    uPulse: p.pulse,
    uGlowScale: 0.35 + 0.65 * presence,
    uSize: input.palette.pointSize * input.dpr,
    uScale: input.height * 0.5,
    uBase: [0, 1, 2].map((i) => base[i]! + (dot[i]! - base[i]!) * presence) as Vec3,
    uInk: ink,
    modelViewMatrix: multiply(viewMatrix(cam), rotationY(p.rotY)),
    projectionMatrix: perspective(CAMERA.fov, aspect, CAMERA.near, CAMERA.far),
  };
}
