'use client';

import { motion } from 'framer-motion';
import { EASE_OUT, fade } from '@/components/motion/Reveal';
import { pad, pick } from '@/lib/format';
import { Emphasis, Meta, SectionHead, type ViewProps } from './atoms';

// Damped string vibration: y = A·e^(−t/τ)·sin(ωt). Computed once at module load.
const WAVE_PATH = Array.from({ length: 241 }, (_, i) => {
  const y = 40 - 30 * Math.exp(-i / 90) * Math.sin(i * 0.4);
  return `${i === 0 ? 'M' : 'L'}${(i * 400) / 240} ${y.toFixed(2)}`;
}).join(' ');

export function DisciplineView({ data }: ViewProps) {
  const copy = data.content.discipline;
  const { biological, acoustic } = data.shared.discipline;
  const unknown = data.content.ui.shell.unknown;
  const bio = copy.biological;
  const sound = copy.acoustic;

  const metrics = [
    { id: 'height', label: bio.metrics.height, value: biological.heightCm, unit: bio.units.height },
    { id: 'weight', label: bio.metrics.weight, value: biological.weightKg, unit: bio.units.weight },
    { id: 'frequency', label: bio.metrics.frequency, value: biological.daysPerWeek, unit: bio.units.frequency },
  ];

  return (
    <div className="px-frame pb-28 pt-10 md:pt-16">
      <SectionHead
        index={5}
        label={data.content.ui.nav.discipline}
        title={copy.title}
        emphasis={copy.titleEmphasis}
        subtitle={copy.subtitle}
      />

      <div className="mt-20 grid gap-24 md:mt-32 md:grid-cols-12 md:gap-x-6">
        <motion.section variants={fade} className="md:col-span-4 md:col-start-4">
          <Meta>(A)</Meta>
          <h2 className="mt-5 text-3xl font-medium leading-none tracking-[-0.035em] md:text-[2.75rem]">
            <Emphasis text={bio.title} emphasis={bio.titleEmphasis} />
          </h2>
          <p className="mt-6 text-[15px] leading-relaxed text-muted">{bio.summary}</p>

          <dl className="mt-12 grid grid-cols-3 gap-x-4 border-t border-line">
            {metrics.map((metric) => (
              <div key={metric.id} className="pt-5">
                <dt className="select-none font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{metric.label}</dt>
                <dd className="mt-4">
                  <span className="block text-4xl font-light tabular-nums leading-none tracking-[-0.04em] md:text-5xl">
                    {metric.value ?? unknown}
                  </span>
                  <span className="mt-2 block font-mono text-[11px] text-muted">{metric.unit}</span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-14">
            <Meta as="h3">{bio.sessionsTitle}</Meta>
            <ol className="mt-5">
              {biological.sessions.map((session) => (
                <li key={session.id} className="grid grid-cols-[5.5rem_minmax(0,1fr)] border-t border-line py-4">
                  <span className="select-none font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                    {bio.dayLabel} {session.id}
                  </span>
                  <div>
                    <p className="text-[15px]">{pick(bio.focus, session.focus) ?? session.focus}</p>
                    <p className="mt-1 text-sm text-muted">{session.patterns.join(' · ')}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </motion.section>

        <motion.section variants={fade} className="md:col-span-4 md:col-start-9">
          <Meta>(B)</Meta>
          <h2 className="mt-5 text-3xl font-medium leading-none tracking-[-0.035em] md:text-[2.75rem]">
            <Emphasis text={sound.title} emphasis={sound.titleEmphasis} />
          </h2>
          <p className="mt-6 text-[15px] leading-relaxed text-muted">{sound.summary}</p>

          <svg
            viewBox="0 0 400 80"
            preserveAspectRatio="none"
            className="mt-12 h-20 w-full select-none"
            role="img"
            aria-label={sound.pipelineTitle}
          >
            <line x1="0" y1="40" x2="400" y2="40" stroke="var(--line)" vectorEffect="non-scaling-stroke" />
            <motion.path
              d={WAVE_PATH}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.2, ease: EASE_OUT, delay: 0.4 }}
            />
          </svg>

          <dl className="mt-10 grid grid-cols-2 gap-x-4 border-t border-line">
            <div className="pt-5">
              <dt className="select-none font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{sound.instrumentLabel}</dt>
              <dd className="mt-3 text-[15px]">{sound.instrument}</dd>
            </div>
            <div className="pt-5">
              <dt className="select-none font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{sound.formatsLabel}</dt>
              <dd className="mt-3 text-[15px]">{acoustic.formats.join(' · ')}</dd>
            </div>
          </dl>

          <div className="mt-14">
            <Meta as="h3">{sound.pipelineTitle}</Meta>
            <ol className="mt-5">
              {acoustic.pipeline.map((stepId, index) => (
                <li key={stepId} className="grid grid-cols-[2.5rem_minmax(0,1fr)] border-t border-line py-4">
                  <span className="select-none font-mono text-[11px] tabular-nums text-muted">{pad(index + 1)}</span>
                  <span className="text-[15px]">{pick(sound.pipeline, stepId) ?? stepId}</span>
                </li>
              ))}
            </ol>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
