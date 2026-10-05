import { describe, expect, it } from 'vitest';
import type { Thread } from './portfolio';
import { activeMs, axisOrigin, buildAxis, formatUptime, phaseAt, phaseMarksFit, spansOf, toMs } from './timeline';

const DAY = 86_400_000;

function thread(overrides: Partial<Thread> = {}): Thread {
  return {
    id: 'lane',
    kind: 'work',
    entity: null,
    segments: [{ start: '2024-01-01', end: null }],
    phases: [],
    ...overrides,
  };
}

describe('spansOf', () => {
  it('runs an open segment up to the clock', () => {
    const clock = toMs('2024-01-11');
    expect(spansOf(thread(), clock)).toEqual([{ from: toMs('2024-01-01'), to: clock, open: true }]);
  });

  it('drops segments that have not started yet', () => {
    expect(spansOf(thread(), toMs('2023-06-01'))).toEqual([]);
  });
});

describe('activeMs', () => {
  it('sums the segments and leaves the gap out', () => {
    const gapped = thread({
      segments: [
        { start: '2024-01-01', end: '2024-01-11' },
        { start: '2024-02-01', end: '2024-02-06' },
      ],
    });
    expect(activeMs(spansOf(gapped, toMs('2025-01-01')))).toBe(15 * DAY);
  });
});

describe('phaseAt', () => {
  const gapped = thread({
    segments: [
      { start: '2024-01-01', end: '2024-01-11' },
      { start: '2024-02-01', end: '2024-02-11' },
    ],
    phases: [
      { id: 'a', stack: [] },
      { id: 'b', stack: [] },
      { id: 'c', start: '2024-01-05', stack: [] },
    ],
  });
  const spans = spansOf(gapped, toMs('2025-01-01'));

  it('starts the first phase at the first segment', () => {
    expect(phaseAt(gapped, 0, spans)).toBe(toMs('2024-01-01'));
  });

  it('spreads phases over active time, skipping the gap', () => {
    // One third of 20 active days is ~6.7 days: still inside the first segment.
    expect(phaseAt(gapped, 1, spans)).toBe(toMs('2024-01-01') + (20 * DAY) / 3);
  });

  it('anchors a phase that has its own start', () => {
    expect(phaseAt(gapped, 2, spans)).toBe(toMs('2024-01-05'));
  });

  it('falls back to 0 when nothing has started', () => {
    expect(phaseAt(gapped, 0, [])).toBe(0);
  });
});

describe('phaseMarksFit', () => {
  it('accepts labels that are spread out and clear of the edge', () => {
    expect(phaseMarksFit([10, 40, 70])).toBe(true);
  });

  it('rejects labels that would overlap each other', () => {
    expect(phaseMarksFit([10, 15, 70])).toBe(false);
  });

  it('rejects a last label that would run off the end of the axis', () => {
    expect(phaseMarksFit([10, 95])).toBe(false);
  });

  it('treats the required room as inclusive and configurable', () => {
    expect(phaseMarksFit([0, 12, 88])).toBe(true);
    expect(phaseMarksFit([0, 12, 88], 13)).toBe(false);
  });

  it('has nothing to reject when there are no phases', () => {
    expect(phaseMarksFit([])).toBe(true);
  });
});

describe('formatUptime', () => {
  it('prints days and a zero-padded clock', () => {
    expect(formatUptime(DAY * 3 + 3_723_000, 'd')).toBe('3d 01:02:03');
  });

  it('never goes negative', () => {
    expect(formatUptime(-5_000, 'g')).toBe('0g 00:00:00');
  });
});

describe('axis', () => {
  it('starts at the earliest segment and has a fallback for no threads', () => {
    const later = thread({ segments: [{ start: '2023-05-01', end: null }] });
    expect(axisOrigin([thread(), later])).toBe(toMs('2023-05-01'));
    expect(axisOrigin([])).toBe(Date.UTC(2022, 0, 1));
  });

  it('covers whole years and clamps to 0–100', () => {
    const axis = buildAxis(toMs('2023-05-01'), toMs('2024-07-01'));
    expect(axis.years).toEqual([2023, 2024]);
    // 2023 has 365 of the axis's 731 days, so its tick sits just before the middle.
    expect(axis.ticks[0]).toBe(0);
    expect(axis.ticks[1]).toBeCloseTo((365 / 731) * 100);
    expect(axis.toPct(toMs('2020-01-01'))).toBe(0);
    expect(axis.toPct(toMs('2030-01-01'))).toBe(100);
    expect(axis.nowPct).toBeGreaterThan(50);
  });
});
