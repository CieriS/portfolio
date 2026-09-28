import { pad } from '@/lib/format';
import type { Thread } from '@/lib/portfolio';

/** Pure time arithmetic behind the timeline view: no React, no clock of its own. */

export function toMs(iso: string): number {
  return Date.parse(`${iso}T00:00:00Z`);
}

/** A segment resolved against the clock: an open one runs up to now. */
export type Span = { from: number; to: number; open: boolean };

export function spansOf(thread: Thread, clock: number): Span[] {
  return thread.segments
    .map((segment) => ({
      from: toMs(segment.start),
      to: segment.end === null ? clock : toMs(segment.end),
      open: segment.end === null,
    }))
    .filter((span) => span.to > span.from);
}

/** Time the thread actually ran, gaps excluded. */
export function activeMs(spans: Span[]): number {
  return spans.reduce((total, span) => total + (span.to - span.from), 0);
}

/**
 * Where a phase sits on the axis. A phase with its own `start` is anchored to that date;
 * without one it is spread evenly over *active* time, so an interruption pushes the later
 * phases past the gap instead of stranding a label in the middle of it.
 */
export function phaseAt(thread: Thread, index: number, spans: Span[]): number {
  const phase = thread.phases[index];
  if (phase.start) return toMs(phase.start);
  if (spans.length === 0) return 0;

  let offset = (index / thread.phases.length) * activeMs(spans);
  for (const span of spans) {
    const duration = span.to - span.from;
    if (offset <= duration) return span.from + offset;
    offset -= duration;
  }
  return spans[spans.length - 1].to;
}

export function formatUptime(ms: number, days: string): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86_400);
  const h = Math.floor((total % 86_400) / 3_600);
  const m = Math.floor((total % 3_600) / 60);
  return `${d}${days} ${pad(h)}:${pad(m)}:${pad(total % 60)}`;
}

/** Earliest known start across threads; a fixed date keeps an empty timeline renderable. */
export function axisOrigin(threads: Thread[]): number {
  const starts = threads.flatMap((thread) => thread.segments.map((segment) => toMs(segment.start)));
  return starts.length > 0 ? Math.min(...starts) : Date.UTC(2022, 0, 1);
}

export type Axis = { years: number[]; ticks: number[]; nowPct: number; toPct: (ms: number) => number };

/** Whole years from the origin's year to the end of the clock's year, as percentages clamped to 0–100. */
export function buildAxis(origin: number, clock: number): Axis {
  const firstYear = new Date(origin).getUTCFullYear();
  const lastYear = new Date(clock).getUTCFullYear();
  const axisStart = Date.UTC(firstYear, 0, 1);
  const axisEnd = Date.UTC(lastYear + 1, 0, 1);
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i);
  const toPct = (ms: number) => Math.min(100, Math.max(0, ((ms - axisStart) / (axisEnd - axisStart)) * 100));
  return { years, ticks: years.map((year) => toPct(Date.UTC(year, 0, 1))), nowPct: toPct(clock), toPct };
}
