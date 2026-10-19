import { describe, expect, it } from 'vitest';
import { FIELD, WAVE_PERIOD } from './sceneField';
import { SCENE_MODES } from './sceneModes';
import { CAMERA, createSim, stepSim, type SimInput } from './sceneSim';
import { THEME } from './theme';

const input = (over: Partial<SimInput> = {}): SimInput => ({
  mode: 'hero',
  palette: THEME.dark,
  pointer: { x: 0, y: 0, active: false, touch: false, snap: false },
  delta: 1 / 60,
  still: false,
  width: 1280,
  height: 800,
  dpr: 2,
  ...over,
});

describe('stepSim', () => {
  it('starts from the hero pose with the camera where the canvas used to place it', () => {
    const sim = createSim();
    expect(sim.params).toEqual(SCENE_MODES.hero);
    expect(sim.camera).toEqual(CAMERA.start);
  });

  it('eases towards a new mode instead of jumping', () => {
    const sim = createSim();
    stepSim(sim, input({ mode: 'timeline' }));
    const { camY } = sim.params;
    expect(camY).toBeGreaterThan(SCENE_MODES.hero.camY);
    expect(camY).toBeLessThan(SCENE_MODES.timeline.camY);
  });

  it('jumps straight to the target and freezes time with reduced motion', () => {
    const sim = createSim();
    const u = stepSim(sim, input({ mode: 'timeline', still: true, delta: 5 }));
    expect(sim.params).toEqual(SCENE_MODES.timeline);
    expect(sim.camera).toEqual([SCENE_MODES.timeline.camX, SCENE_MODES.timeline.camY, SCENE_MODES.timeline.camZ]);
    expect(u.uWave).toBe(0);
    expect(u.uFlow).toBe(0);
  });

  it('caps a long pause between frames at 1/20 s', () => {
    const sim = createSim();
    stepSim(sim, input({ delta: 3 }));
    expect(sim.wave).toBeCloseTo((1 / 20) * SCENE_MODES.hero.speed, 9);
  });

  it('hands the shader wrapped phases', () => {
    const sim = createSim();
    sim.wave = WAVE_PERIOD + 1;
    sim.flow = FIELD.packetSpan * 3 + 2;
    const u = stepSim(sim, input({ delta: 0 }));
    expect(u.uWave).toBeCloseTo(1, 6);
    expect(u.uFlow).toBeCloseTo(2, 6);
  });

  it('warms up under an active pointer and cools down when it leaves', () => {
    const sim = createSim();
    const pointer = { x: 0, y: -0.2, active: true, touch: false, snap: false };
    for (let i = 0; i < 120; i++) stepSim(sim, input({ pointer }));
    expect(sim.heat).toBeGreaterThan(0.8);
    pointer.active = false;
    for (let i = 0; i < 120; i++) stepSim(sim, input({ pointer }));
    expect(sim.heat).toBeLessThan(0.2);
  });

  it('lands under a finger at once on snap, then clears the request', () => {
    const sim = createSim();
    const pointer = { x: 0.4, y: -0.3, active: true, touch: true, snap: true };
    stepSim(sim, input({ pointer }));
    expect(pointer.snap).toBe(false);
    const landed = [sim.px, sim.pz];
    stepSim(sim, input({ pointer, delta: 0 }));
    expect([sim.px, sim.pz]).toEqual(landed);
  });

  it('applies the pointer parallax to the camera for a mouse but not for a finger', () => {
    const mouse = createSim();
    const finger = createSim();
    stepSim(mouse, input({ pointer: { x: 1, y: 0, active: true, touch: false, snap: false }, still: true }));
    stepSim(finger, input({ pointer: { x: 1, y: 0, active: true, touch: true, snap: false }, still: true }));
    expect(mouse.camera[0]).toBeCloseTo(SCENE_MODES.hero.camX + 0.8, 6);
    expect(finger.camera[0]).toBeCloseTo(SCENE_MODES.hero.camX, 6);
  });

  it('dims the field towards the paper colour as presence drops, and scales points by dpr and height', () => {
    const sim = createSim();
    const hero = stepSim(sim, input({ still: true }));
    const identity = stepSim(sim, input({ mode: 'identity', still: true }));
    const { paper } = { paper: sim.colors.base };
    const distance = (c: number[]) => Math.abs(c[0]! - paper[0]!);
    expect(distance(identity.uBase)).toBeLessThan(distance(hero.uBase));
    expect(hero.uBase).toEqual(sim.colors.dot);
    expect(hero.uSize).toBeCloseTo(THEME.dark.pointSize * 2, 9);
    expect(hero.uScale).toBe(400);
  });

  it('recomputes the colours only when the palette changes', () => {
    const sim = createSim();
    stepSim(sim, input());
    const colors = sim.colors;
    stepSim(sim, input());
    expect(sim.colors).toBe(colors);
    stepSim(sim, input({ palette: THEME.light }));
    expect(sim.colors).not.toBe(colors);
  });
});
