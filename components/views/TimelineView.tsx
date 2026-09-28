'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { EASE_OUT, fade } from '@/components/motion/Reveal';
import { cn } from '@/lib/cn';
import { formatDate, pad, pick } from '@/lib/format';
import { useNow } from '@/lib/hooks';
import type { PortfolioView, Thread } from '@/lib/portfolio';
import { activeMs, axisOrigin, buildAxis, formatUptime, phaseAt, spansOf } from '@/lib/timeline';
import { Meta, Pulse, SectionHead, type ViewProps } from './atoms';

const GROW = { duration: 1.8, ease: EASE_OUT, delay: 0.3 } as const;
/** Each further segment starts drawing once the previous one is done, so a gap reads as a pause. */
const SEGMENT_STAGGER = 0.5;

type TimelineCopy = PortfolioView['content']['timeline'];
type ThreadCopy = TimelineCopy['threads'][keyof TimelineCopy['threads']];

/** Isolated so the per-second tick re-renders only this node. */
function Uptime({ thread, days, fallback }: { thread: Thread | undefined; days: string; fallback: string }) {
  const now = useNow(1_000);
  if (!thread || now === null) return <>{fallback}</>;
  return <>{formatUptime(activeMs(spansOf(thread, now)), days)}</>;
}

export function TimelineView({ data }: ViewProps) {
  const copy = data.content.timeline;
  const { threads } = data.shared.timeline;
  const unknown = data.content.ui.shell.unknown;
  const now = useNow(60_000);

  // Shared clock: the axis spans from the earliest known start to the end of the current year.
  const origin = axisOrigin(threads);
  const clock = now ?? origin;
  const { years, ticks, nowPct, toPct } = buildAxis(origin, clock);

  // The headline uptime tracks the professional thread; any work thread will do as the site grows.
  const primary = threads.find((thread) => thread.kind === 'work') ?? threads[0];
  const primaryCopy = primary ? pick(copy.threads, primary.id) : undefined;

  // One column per thread on desktop, stacked on mobile. Driven by a CSS variable so the
  // number of threads is a data concern rather than a hardcoded Tailwind class.
  const columns = { '--threads': `repeat(${Math.max(1, threads.length)}, minmax(0, 1fr))` } as React.CSSProperties;

  return (
    <div className="px-frame pb-28 pt-10 md:pt-16">
      <SectionHead
        index={3}
        label={data.content.ui.nav.timeline}
        title={copy.title}
        emphasis={copy.titleEmphasis}
        subtitle={copy.subtitle}
        aside={
          <motion.div variants={fade} className="select-none md:text-right">
            <Meta>
              {copy.labels.uptime} — {primaryCopy?.label ?? primary?.id}
            </Meta>
            <p className="mt-3 text-3xl font-light tabular-nums tracking-[-0.03em] md:text-5xl">
              <Uptime thread={primary} days={copy.labels.days} fallback={unknown} />
            </p>
          </motion.div>
        }
      />

      {/* Scheduler: every thread on one shared time axis, advancing in lockstep. Purely visual chrome. */}
      <motion.div variants={fade} className="mt-20 select-none md:mt-32 md:grid md:grid-cols-12 md:gap-x-6">
        <div className="md:col-span-9 md:col-start-4">
          <div className="relative mb-5 h-4 font-mono text-[11px] tabular-nums text-muted">
            {years.map((year, i) => (
              <span
                key={year}
                className={cn('absolute top-0', nowPct > ticks[i] && nowPct - ticks[i] < 20 && 'max-md:opacity-0')}
                style={{ left: `${ticks[i]}%` }}
              >
                {year}
              </span>
            ))}
            <span className="absolute top-0 -translate-x-full pr-3 text-ink" style={{ left: `${nowPct}%` }}>
              {copy.labels.now}
            </span>
          </div>
          {threads.map((thread, i) => (
            <Lane key={thread.id} thread={thread} index={i} labels={copy.labels} copy={pick(copy.threads, thread.id)} unknown={unknown} ticks={ticks} clock={clock} toPct={toPct} />
          ))}
        </div>
      </motion.div>

      <div className="mt-20 md:mt-28 md:grid md:grid-cols-12 md:gap-x-6">
        <div className="grid gap-16 md:col-span-9 md:col-start-4 md:gap-x-6 md:grid-cols-[var(--threads)]" style={columns}>
          {threads.map((thread, i) => (
            <motion.div key={thread.id} variants={fade}>
              <ThreadDetail thread={thread} index={i} copy={pick(copy.threads, thread.id)} labels={copy.labels} unknown={unknown} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Threads are labelled A, B, C… by position, so a new one needs no identifier of its own. */
function threadCode(index: number): string {
  return String.fromCharCode(65 + index);
}

type LaneProps = {
  thread: Thread;
  index: number;
  copy: ThreadCopy | undefined;
  labels: TimelineCopy['labels'];
  unknown: string;
  ticks: number[];
  clock: number;
  toPct: (ms: number) => number;
};

function Lane({ thread, index, copy, labels, unknown, ticks, clock, toPct }: LaneProps) {
  // `MotionConfig reducedMotion="user"` only suppresses transform and layout animations.
  // The lane grows via clipPath and moves its head via `left`, so neither is covered.
  const reduce = useReducedMotion();
  const spans = spansOf(thread, clock);
  // Read from the data, not from the clock: before hydration `useNow` is null and every
  // open segment collapses, which would render a running thread as suspended on the server.
  const running = thread.segments.some((segment) => segment.end === null);
  const first = thread.segments[0];

  return (
    <div className="border-t border-line pb-10 pt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <p className="flex items-baseline gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            {labels.thread} {threadCode(index)}
          </span>
          <span className="text-[15px]">{copy?.label ?? thread.id}</span>
        </p>
        <div className="flex items-center gap-5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          <span>
            {labels.start} {formatDate(first?.start ?? null, unknown)}
          </span>
          <span className="flex items-center gap-2">
            {running && <Pulse />}
            {running ? labels.running : labels.suspended}
          </span>
        </div>
      </div>

      <div className="relative mt-8 h-3">
        <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-line" />
        {ticks.map((tick) => (
          <span key={tick} aria-hidden className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-line" style={{ left: `${tick}%` }} />
        ))}

        {spans.map((span, i) => {
          const left = toPct(span.from);
          const width = Math.max(0, toPct(span.to) - left);
          const grow = reduce ? { duration: 0 } : { ...GROW, delay: GROW.delay + i * SEGMENT_STAGGER };

          return (
            <div key={span.from} className="absolute inset-y-0" style={{ left: `${left}%`, width: `${width}%` }}>
              <motion.div
                aria-hidden
                className="absolute inset-0 overflow-hidden"
                initial={{ clipPath: 'inset(0% 100% 0% 0%)' }}
                animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
                transition={grow}
              >
                <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-ink" />
                {/* A suspended process moves no data: only the running segment carries the packet. */}
                {span.open && (
                  <span className="packet-travel absolute inset-0 motion-reduce:hidden">
                    <span className="absolute right-0 top-1/2 h-[3px] w-10 -translate-y-1/2 rounded-full bg-ink" />
                  </span>
                )}
              </motion.div>

              {/* Every boundary is marked: a hollow dot where the thread starts, stops and
                  starts again, the live head only where it is still running. That way an
                  interruption is bounded on both sides instead of just fading out. */}
              {span.open ? (
                <motion.span
                  aria-hidden
                  className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2"
                  initial={{ left: '0%' }}
                  animate={{ left: '100%' }}
                  transition={grow}
                >
                  <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60 motion-reduce:hidden" />
                  <span className="absolute inset-0 rounded-full bg-accent" />
                </motion.span>
              ) : (
                <span aria-hidden className="absolute right-0 top-1/2 size-2 -translate-y-1/2 translate-x-1/2 rounded-full border border-ink bg-paper" />
              )}

              <span aria-hidden className="absolute left-0 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink bg-paper" />
            </div>
          );
        })}
      </div>

      <div className="relative mt-5 hidden h-4 md:block">
        {thread.phases.map((phase, i) => (
          <span
            key={phase.id}
            className="absolute top-0 whitespace-nowrap border-l border-line pl-2 font-mono text-[11px] text-muted"
            style={{ left: `${toPct(phaseAt(thread, i, spans))}%` }}
          >
            {pad(i + 1)} {pick(copy?.phases ?? {}, phase.id)?.title ?? phase.id}
          </span>
        ))}
      </div>
    </div>
  );
}

type ThreadDetailProps = {
  thread: Thread;
  index: number;
  copy: ThreadCopy | undefined;
  labels: TimelineCopy['labels'];
  unknown: string;
};

function ThreadDetail({ thread, index, copy, labels, unknown }: ThreadDetailProps) {
  // An interruption is a fact about the record, not just a shape on the axis: spell the
  // periods out in text so they survive for screen readers and for anyone skimming.
  const periods = thread.segments
    .map((segment) => `${formatDate(segment.start, unknown)} — ${segment.end ? formatDate(segment.end, unknown) : labels.now}`)
    .join(' · ');

  return (
    <article>
      <Meta as="h2">
        {labels.thread} {threadCode(index)} — {copy?.label ?? thread.id}
      </Meta>
      <h3 className="mt-5 text-2xl font-medium tracking-[-0.025em] md:text-3xl">{copy?.role ?? thread.id}</h3>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        {copy?.entityLabel}: {thread.entity ?? unknown}
      </p>
      {thread.segments.length > 1 && (
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          {labels.periods}: {periods}
        </p>
      )}
      <p className="mt-6 text-[15px] leading-relaxed text-muted">{copy?.summary}</p>

      <ol className="mt-10">
        {thread.phases.map((phase, i) => {
          const phaseCopy = pick(copy?.phases ?? {}, phase.id);
          return (
            <li key={phase.id} className="grid grid-cols-[2.5rem_minmax(0,1fr)] border-t border-line py-5">
              <span className="select-none font-mono text-[11px] tabular-nums text-muted">{pad(i + 1)}</span>
              <div>
                <h4 className="text-[15px] font-normal">{phaseCopy?.title ?? phase.id}</h4>
                {phaseCopy && <p className="mt-1 text-sm leading-relaxed text-muted">{phaseCopy.body}</p>}
                <p className="mt-3 font-mono text-[11px] tracking-[0.04em] text-muted">{phase.stack.join(' · ')}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </article>
  );
}
