/**
 * Frame-rate watch for the scene, with the defaults of drei's `PerformanceMonitor` that it
 * replaces: frame rate sampled every 250 ms; after ten samples, if more than three quarters
 * sit below the lower bound the scene should get cheaper, if more than three quarters reach
 * the upper bound it may get richer again. The bounds follow the fastest rate seen, so a
 * 120 Hz screen is not judged by a 60 Hz yardstick.
 */
export type FpsVerdict = 'decline' | 'incline' | null;

const SAMPLE_MS = 250;
const SAMPLES = 10;
const THRESHOLD = 0.75;

export function createFpsMonitor() {
  let frames: number[] = [];
  let samples: number[] = [];
  let refreshRate = 0;

  /** Feed one frame's timestamp (ms); returns a verdict when a full round of samples is in. */
  return function tick(now: number): FpsVerdict {
    frames.push(now);
    const elapsed = now - frames[0]!;
    if (elapsed < SAMPLE_MS) return null;

    const fps = Math.round((frames.length / elapsed) * 1000);
    frames = [];
    refreshRate = Math.max(refreshRate, fps);
    samples.push(fps);
    if (samples.length < SAMPLES) return null;

    const [lower, upper] = refreshRate > 100 ? [60, 100] : [40, 60];
    const high = samples.filter((value) => value >= upper).length;
    const low = samples.filter((value) => value < lower).length;
    samples = [];
    if (high > SAMPLES * THRESHOLD) return 'incline';
    if (low > SAMPLES * THRESHOLD) return 'decline';
    return null;
  };
}
