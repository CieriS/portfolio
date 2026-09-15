'use client';

import { motion } from 'framer-motion';
import { EASE_OUT, fade } from '@/components/motion/Reveal';
import { cn } from '@/lib/cn';
import { formatDate, pad, pick } from '@/lib/format';
import { useNow } from '@/lib/hooks';
import type { PortfolioView, Thread } from '@/lib/portfolio';
import { Meta, Pulse, SectionHead, type ViewProps } from './atoms';

const GROW = { duration: 1.8, ease: EASE_OUT, delay: 0.3 } as const;
const PACKET = { duration: 3.2, repeat: Infinity, ease: 'linear', delay: 2.1 } as const;

type TimelineCopy = PortfolioView['content']['timeline'];

type LaneModel = {
  code: 'A' | 'B';
  thread: Thread;
  copy: TimelineCopy['threadA'] | TimelineCopy['threadB'];
  meta: { label: string; value: string | null };
};

function toMs(iso: string): number {
  return Date.parse(`${iso}T00:00:00Z`);
}

function formatUptime(ms: number, days: string): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86_400);
  const h = Math.floor((total % 86_400) / 3_600);
  const m = Math.floor((total % 3_600) / 60);
  return `${d}${days} ${pad(h)}:${pad(m)}:${pad(total % 60)}`;
}

/** Isolated so the per-second tick re-renders only this node. */
function Uptime({ start, days, fallback }: { start: string | null; days: string; fallback: string }) {
  const now = useNow(1_000);
  return <>{start && now !== null ? formatUptime(now - toMs(start), days) : fallback}</>;
}

export function TimelineView({ data }: ViewProps) {
  const copy = data.content.timeline;
  const { threadA, threadB } = data.shared.timeline;
  const unknown = data.content.ui.shell.unknown;
  const now = useNow(60_000);

  // Shared clock: the axis spans from the earliest known start to the end of the current year.
  const starts = [threadA.start, threadB.start].flatMap((start) => (start ? [toMs(start)] : []));
  const origin = starts.length > 0 ? Math.min(...starts) : Date.UTC(2022, 0, 1);
  const clock = now ?? origin;
  const firstYear = new Date(origin).getUTCFullYear();
  const lastYear = new Date(clock).getUTCFullYear();
  const axisStart = Date.UTC(firstYear, 0, 1);
  const axisEnd = Date.UTC(lastYear + 1, 0, 1);
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i);
  const toPct = (ms: number) => Math.min(100, Math.max(0, ((ms - axisStart) / (axisEnd - axisStart)) * 100));
  const ticks = years.map((year) => toPct(Date.UTC(year, 0, 1)));
  const nowPct = toPct(clock);

  const lanes: LaneModel[] = [
    { code: 'A', thread: threadA, copy: copy.threadA, meta: { label: copy.labels.organization, value: threadA.organization } },
    { code: 'B', thread: threadB, copy: copy.threadB, meta: { label: copy.labels.institution, value: threadB.institution } },
  ];

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
              {copy.labels.uptime} — {copy.threadA.label}
            </Meta>
            <p className="mt-3 text-3xl font-light tabular-nums tracking-[-0.03em] md:text-5xl">
              <Uptime start={threadA.start} days={copy.labels.days} fallback={unknown} />
            </p>
          </motion.div>
        }
      />

      {/* Scheduler: two lanes on one shared time axis, advancing in lockstep. Purely visual chrome. */}
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
          {lanes.map((lane) => (
            <Lane key={lane.code} lane={lane} labels={copy.labels} unknown={unknown} ticks={ticks} nowPct={nowPct} toPct={toPct} />
          ))}
        </div>
      </motion.div>

      <div className="mt-20 grid gap-16 md:mt-28 md:grid-cols-12 md:gap-x-6">
        {lanes.map((lane, i) => (
          <motion.div
            key={lane.code}
            variants={fade}
            className={i === 0 ? 'md:col-span-4 md:col-start-4' : 'md:col-span-4 md:col-start-9'}
          >
            <ThreadDetail lane={lane} labels={copy.labels} unknown={unknown} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

type LaneProps = {
  lane: LaneModel;
  labels: TimelineCopy['labels'];
  unknown: string;
  ticks: number[];
  nowPct: number;
  toPct: (ms: number) => number;
};

function Lane({ lane, labels, unknown, ticks, nowPct, toPct }: LaneProps) {
  const { code, thread, copy } = lane;
  const known = thread.start !== null;
  const left = thread.start ? toPct(toMs(thread.start)) : 0;
  const width = Math.max(0, nowPct - left);
  const phaseCount = thread.phases.length;

  return (
    <div className="border-t border-line pb-10 pt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <p className="flex items-baseline gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            {labels.thread} {code}
          </span>
          <span className="text-[15px]">{copy.label}</span>
        </p>
        <div className="flex items-center gap-5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          <span>
            {labels.start} {formatDate(thread.start, unknown)}
          </span>
          <span className="flex items-center gap-2">
            <Pulse />
            {labels.running}
          </span>
        </div>
      </div>

      <div className="relative mt-8 h-3">
        <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-line" />
        {ticks.map((tick) => (
          <span key={tick} aria-hidden className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-line" style={{ left: `${tick}%` }} />
        ))}

        <div className="absolute inset-y-0" style={{ left: `${left}%`, width: `${width}%` }}>
          <motion.div
            aria-hidden
            className="absolute inset-0 overflow-hidden"
            initial={{ clipPath: 'inset(0% 100% 0% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            transition={GROW}
          >
            <span className={cn('absolute inset-x-0 top-1/2 h-px -translate-y-1/2', known ? 'bg-ink' : 'bg-dashed')} />
            <motion.span className="absolute inset-0" initial={{ x: '-100%' }} animate={{ x: '0%' }} transition={PACKET}>
              <span className="absolute right-0 top-1/2 h-[3px] w-10 -translate-y-1/2 rounded-full bg-ink" />
            </motion.span>
          </motion.div>
          {known && (
            <span aria-hidden className="absolute left-0 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink bg-paper" />
          )}
          <motion.span
            aria-hidden
            className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2"
            initial={{ left: '0%' }}
            animate={{ left: '100%' }}
            transition={GROW}
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60 motion-reduce:hidden" />
            <span className="absolute inset-0 rounded-full bg-accent" />
          </motion.span>
        </div>
      </div>

      <div className="relative mt-5 hidden h-4 md:block">
        {thread.phases.map((phase, i) => (
          <span
            key={phase.id}
            className="absolute top-0 whitespace-nowrap border-l border-line pl-2 font-mono text-[11px] text-muted"
            style={{ left: `${left + (i / phaseCount) * width}%` }}
          >
            {pad(i + 1)} {pick(copy.phases, phase.id)?.title ?? phase.id}
          </span>
        ))}
      </div>
    </div>
  );
}

type ThreadDetailProps = { lane: LaneModel; labels: TimelineCopy['labels']; unknown: string };

function ThreadDetail({ lane, labels, unknown }: ThreadDetailProps) {
  const { code, thread, copy, meta } = lane;

  return (
    <article>
      <Meta as="h2">
        {labels.thread} {code} — {copy.label}
      </Meta>
      <h3 className="mt-5 text-2xl font-medium tracking-[-0.025em] md:text-3xl">{copy.role}</h3>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        {meta.label}: {meta.value ?? unknown}
      </p>
      <p className="mt-6 text-[15px] leading-relaxed text-muted">{copy.summary}</p>

      <ol className="mt-10">
        {thread.phases.map((phase, i) => {
          const phaseCopy = pick(copy.phases, phase.id);
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
