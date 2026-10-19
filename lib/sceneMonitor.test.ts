import { describe, expect, it } from 'vitest';
import { createFpsMonitor, type FpsVerdict } from './sceneMonitor';

/** Feeds `seconds` of frames at `fps` and returns every verdict given. */
function run(monitor: ReturnType<typeof createFpsMonitor>, fps: number, seconds: number, start = 0) {
  const verdicts: FpsVerdict[] = [];
  const step = 1000 / fps;
  let now = start;
  for (; now < start + seconds * 1000; now += step) {
    const verdict = monitor(now);
    if (verdict) verdicts.push(verdict);
  }
  return { verdicts, end: now };
}

describe('createFpsMonitor', () => {
  it('stays quiet until a full round of ten 250 ms samples is in', () => {
    expect(run(createFpsMonitor(), 20, 2).verdicts).toEqual([]);
  });

  it('asks for a cheaper scene when the frame rate stays low', () => {
    expect(run(createFpsMonitor(), 20, 3).verdicts).toEqual(['decline']);
  });

  it('allows a richer scene again when it stays at the screen rate', () => {
    expect(run(createFpsMonitor(), 60, 3).verdicts).toEqual(['incline']);
  });

  it('says nothing between the bounds', () => {
    expect(run(createFpsMonitor(), 50, 6).verdicts).toEqual([]);
  });

  it('judges a 120 Hz screen against higher bounds once it has seen that rate', () => {
    const monitor = createFpsMonitor();
    const fast = run(monitor, 120, 3);
    expect(fast.verdicts).toEqual(['incline']);
    // 55 fps is fine on a 60 Hz screen but a drop on a 120 Hz one.
    expect(run(monitor, 55, 3, fast.end).verdicts).toEqual(['decline']);
  });
});
