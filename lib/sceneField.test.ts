import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { FIELD_FRAGMENT, FIELD_VERTEX } from '@/components/scene/fieldShader';
import { buildFieldAttributes, FIELD, FIELD_POINTS, WAVE_PERIOD, WAVE_RATES, wrap } from './sceneField';

describe('buildFieldAttributes', () => {
  const { position, cell } = buildFieldAttributes();

  it('lays every point flat on a grid centred on the origin', () => {
    expect(position.length).toBe(FIELD_POINTS * 3);
    expect(cell.length).toBe(FIELD_POINTS * 2);
    let sumX = 0;
    let sumZ = 0;
    for (let i = 0; i < FIELD_POINTS; i++) {
      sumX += position[i * 3];
      expect(position[i * 3 + 1]).toBe(0);
      sumZ += position[i * 3 + 2];
    }
    expect(sumX).toBeCloseTo(0, 3);
    expect(sumZ).toBeCloseTo(0, 3);
  });

  it("spaces neighbours by the gap and records each point's column and row", () => {
    expect(position[3] - position[0]).toBeCloseTo(FIELD.gap, 6);
    expect(position[FIELD.cols * 3 + 2] - position[2]).toBeCloseTo(FIELD.gap, 6);
    const last = FIELD_POINTS - 1;
    expect([cell[0], cell[1]]).toEqual([0, 0]);
    expect([cell[last * 2], cell[last * 2 + 1]]).toEqual([FIELD.cols - 1, FIELD.rows - 1]);
    expect([cell[FIELD.cols * 2], cell[FIELD.cols * 2 + 1]]).toEqual([0, 1]);
  });
});

describe('wrap', () => {
  it('brings any value into the period, negative ones included', () => {
    expect(wrap(5, 4)).toBe(1);
    expect(wrap(-1, 4)).toBe(3);
    expect(wrap(8, 4)).toBe(0);
  });

  it('leaves every wave term unchanged, even after hours of running', () => {
    for (const phase of [0.3, 77.7, 12_345.678, 86_400 * 0.8]) {
      for (const rate of WAVE_RATES) {
        const wrapped = wrap(phase, WAVE_PERIOD);
        expect(wrapped).toBeLessThan(WAVE_PERIOD);
        expect(Math.sin(wrapped * rate)).toBeCloseTo(Math.sin(phase * rate), 6);
        expect(Math.cos(wrapped * rate)).toBeCloseTo(Math.cos(phase * rate), 6);
      }
    }
  });

  it('leaves the position of every packet unchanged', () => {
    for (const flow of [0, 47.9, 48, 1234.5, 57_600]) {
      for (let lane = 0; lane * FIELD.laneEvery < FIELD.rows; lane++) {
        const behind = (value: number) => wrap(value + lane * 17.3 - 10, FIELD.packetSpan);
        expect(behind(wrap(flow, FIELD.packetSpan))).toBeCloseTo(behind(flow), 6);
      }
    }
  });
});

describe('field shader', () => {
  it('multiplies the wave phase only by the rates the wrap period is built for', () => {
    const rates = [...FIELD_VERTEX.matchAll(/uWave \* (\d+(?:\.\d+)?)/g)].map((match) => Number(match[1]));
    expect(rates.length).toBeGreaterThan(0);
    expect([...new Set(rates)].sort()).toEqual([...WAVE_RATES].sort());
    // No use of the phase escapes the scan above.
    expect(FIELD_VERTEX.match(/uWave/g)?.length).toBe(rates.length + 1);
  });

  it('receives the grid constants from the same module as the geometry', () => {
    expect(FIELD_VERTEX).toContain(`const float COLS = ${FIELD.cols}.0;`);
    expect(FIELD_VERTEX).toContain(`const float LANE_EVERY = ${FIELD.laneEvery}.0;`);
    expect(FIELD_VERTEX).toContain(`const float PACKET_SPAN = ${FIELD.packetSpan}.0;`);
    expect(FIELD_VERTEX).toContain(`const float PACKET_TAIL = ${FIELD.packetTail}.0;`);
  });

  it('keeps tone mapping and the output colour space of the built-in materials', () => {
    expect(FIELD_FRAGMENT).toContain('#include <tonemapping_fragment>');
    expect(FIELD_FRAGMENT).toContain('#include <colorspace_fragment>');
  });
});

describe('DataGrid', () => {
  const source = readFileSync(fileURLToPath(new URL('../components/scene/DataGrid.tsx', import.meta.url)), 'utf8');

  it('does no per-point work on the CPU: no buffer is rewritten or re-uploaded', () => {
    expect(source).not.toContain('needsUpdate');
    expect(source).not.toContain('DynamicDrawUsage');
    expect(source).not.toMatch(/for \(let (r|c|i|row|col) = 0/);
  });
});
