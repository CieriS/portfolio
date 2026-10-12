/**
 * Geometry and constants of the point field behind every view. Framework-free: the grid is
 * built once and uploaded once, and everything that moves is computed on the GPU by
 * `components/scene/fieldShader.ts` from a handful of numbers updated each frame.
 */
export const FIELD = {
  cols: 96,
  rows: 56,
  gap: 0.26,
  /** Every Nth row carries travelling data packets. */
  laneEvery: 5,
  packetSpan: 48,
  packetTail: 12,
} as const;

export const FIELD_POINTS = FIELD.cols * FIELD.rows;

/**
 * The wave phase enters the shader through `sin` and `cos` at the rates below, all multiples
 * of 0.05, so the picture repeats exactly every 2π / 0.05. Wrapping the phase there keeps it
 * small: a 32-bit float on the GPU loses the fine steps of a phase that only ever grows.
 */
export const WAVE_RATES = [1, 0.7, 0.45, 4] as const;
export const WAVE_PERIOD = (2 * Math.PI) / 0.05;

/** `value` brought into `[0, period)`, also for negative values. */
export function wrap(value: number, period: number): number {
  return ((value % period) + period) % period;
}

/** Static attributes: the resting position of each point (y = 0) and its column and row. */
export function buildFieldAttributes(): { position: Float32Array; cell: Float32Array } {
  const position = new Float32Array(FIELD_POINTS * 3);
  const cell = new Float32Array(FIELD_POINTS * 2);
  for (let row = 0; row < FIELD.rows; row++) {
    for (let col = 0; col < FIELD.cols; col++) {
      const i = row * FIELD.cols + col;
      position[i * 3] = (col - (FIELD.cols - 1) / 2) * FIELD.gap;
      position[i * 3 + 2] = (row - (FIELD.rows - 1) / 2) * FIELD.gap;
      cell[i * 2] = col;
      cell[i * 2 + 1] = row;
    }
  }
  return { position, cell };
}
