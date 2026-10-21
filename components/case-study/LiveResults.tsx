'use client';

import { useEffect, useState } from 'react';
import { Meta } from '@/components/ui/text';
import type { LiveCopy } from '@/lib/caseStudy';
import { cn } from '@/lib/cn';
import {
  ExceedancesSchema,
  exceedanceChart,
  isStale,
  MetaSchema,
  niceCeiling,
  trendChart,
  TrendsSchema,
  type ExceedanceChart,
  type Meta as ExportMeta,
  type TrendChart,
} from '@/lib/liveResults';

type Loaded = { meta: ExportMeta; exceedances: ExceedanceChart; trend: TrendChart };
type State = { status: 'loading' } | { status: 'error' } | ({ status: 'ready' } & Loaded);

async function load(source: string, municipality: string, signal: AbortSignal): Promise<Loaded> {
  const get = async (file: string): Promise<unknown> => {
    const response = await fetch(new URL(file, source), { signal });
    if (!response.ok) throw new Error(`${file}: ${response.status}`);
    return response.json();
  };
  const [meta, exceedances, trends] = await Promise.all([get('meta.json'), get('exceedances.json'), get('pollutant-trend.json')]);
  return {
    meta: MetaSchema.parse(meta),
    exceedances: exceedanceChart(ExceedancesSchema.parse(exceedances), { municipality, pollutant: 'PM10', metric: 'daily_mean' }),
    trend: trendChart(TrendsSchema.parse(trends), { municipality, pollutants: ['PM10', 'NO2'] }),
  };
}

/**
 * Charts drawn from the export a project publishes every day (aria-er: GitHub Pages). The
 * rest of the case study is prerendered; this island only fetches and draws, and if the
 * export cannot be reached it says so and the page stays whole.
 */
export function LiveResults({
  source,
  municipality,
  locale,
  copy,
}: {
  source: string;
  municipality: string;
  locale: string;
  copy: LiveCopy;
}) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    load(source, municipality, controller.signal)
      .then((loaded) => setState({ status: 'ready', ...loaded }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.warn('Live results could not be loaded:', error);
        setState({ status: 'error' });
      });
    return () => controller.abort();
  }, [source, municipality]);

  if (state.status === 'loading') {
    return (
      <p className="text-[15px] text-muted" data-live="loading" aria-live="polite">
        {copy.loading}
      </p>
    );
  }
  if (state.status === 'error') {
    return (
      <p className="max-w-2xl text-[15px] text-muted" data-live="error" aria-live="polite">
        {copy.error}
      </p>
    );
  }

  const date = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(state.meta.generated_at),
  );
  const stale = isStale(state.meta.generated_at, new Date());
  return (
    <div className="space-y-14" data-live="ready">
      <p
        className={cn('font-mono text-[11px] tracking-[0.14em] uppercase', stale ? 'text-accent' : 'text-muted')}
        data-stale={stale}
      >
        {(stale ? copy.stale : copy.updated).replace('{date}', date)}
      </p>
      <ExceedancesFigure chart={state.exceedances} copy={copy} />
      <TrendFigure chart={state.trend} copy={copy} />
      <p className="text-sm text-muted">{copy.credits}</p>
    </div>
  );
}

// Not the mono label style: it is uppercase, and µg/m³ would read Mg/m³.
const CHART_TITLE = 'text-lg font-medium tracking-[-0.015em]';
const WIDTH = 640;
const HEIGHT = 240;
const PAD = { top: 12, right: 12, bottom: 28, left: 32 };
const PLOT_W = WIDTH - PAD.left - PAD.right;
const PLOT_H = HEIGHT - PAD.top - PAD.bottom;
// One shade of ink per station: the accent is kept for the legal line.
const SHADES = [1, 0.55, 0.28, 0.75, 0.4];

function Axis({ top, years, x }: { top: number; years: number[]; x: (index: number) => number }) {
  const ticks = [0, top / 2, top];
  return (
    <g className="font-mono text-[10px]" fill="currentColor">
      {ticks.map((tick) => {
        const y = PAD.top + PLOT_H - (tick / top) * PLOT_H;
        return (
          <g key={tick}>
            <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y} y2={y} stroke="var(--line)" />
            <text x={PAD.left - 6} y={y + 3} textAnchor="end" className="fill-muted">
              {tick}
            </text>
          </g>
        );
      })}
      {years.map((year, index) =>
        // Every other year on a long span, the last one always.
        years.length <= 8 || index % 2 === (years.length - 1) % 2 ? (
          <text key={year} x={x(index)} y={HEIGHT - 8} textAnchor="middle" className="fill-muted">
            {year}
          </text>
        ) : null,
      )}
    </g>
  );
}

/** `className` sets the swatch colour (`bg-ink`, `bg-accent`…), `opacity` a shade of it. */
function Legend({ items }: { items: { label: string; className: string; opacity?: number }[] }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2">
          <span aria-hidden className={cn('inline-block size-2.5', item.className)} style={{ opacity: item.opacity }} />
          <Meta as="span">{item.label}</Meta>
        </li>
      ))}
    </ul>
  );
}

function ExceedancesFigure({ chart, copy }: { chart: ExceedanceChart; copy: LiveCopy }) {
  if (chart.years.length === 0) return null;
  const top = niceCeiling(chart.max);
  const group = PLOT_W / chart.years.length;
  const bar = Math.max(2, (group * 0.72) / chart.stations.length);
  const x = (index: number) => PAD.left + group * (index + 0.5);
  const y = (value: number) => PAD.top + PLOT_H - (value / top) * PLOT_H;
  return (
    <figure data-chart="exceedances">
      <h3 className={CHART_TITLE}>{copy.exceedances.title}</h3>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-5 h-auto w-full text-ink"
        role="img"
        aria-label={copy.exceedances.title}
      >
        <Axis top={top} years={chart.years} x={x} />
        {chart.stations.map((station, s) =>
          station.values.map((value, index) =>
            value === null ? null : (
              <rect
                key={`${station.name}-${chart.years[index]}`}
                x={x(index) - (bar * chart.stations.length) / 2 + bar * s}
                y={y(value)}
                width={bar - 1}
                height={PAD.top + PLOT_H - y(value)}
                fill="currentColor"
                opacity={SHADES[s % SHADES.length]}
              >
                <title>{`${station.name}, ${chart.years[index]}: ${value}`}</title>
              </rect>
            ),
          ),
        )}
        {chart.allowed !== null && (
          <line
            x1={PAD.left}
            x2={WIDTH - PAD.right}
            y1={y(chart.allowed)}
            y2={y(chart.allowed)}
            stroke="var(--accent)"
            strokeDasharray="4 4"
          />
        )}
      </svg>
      <Legend
        items={[
          ...chart.stations.map((station, s) => ({
            label: station.name,
            className: 'bg-ink',
            opacity: SHADES[s % SHADES.length],
          })),
          ...(chart.allowed !== null
            ? [{ label: copy.exceedances.allowed.replace('{n}', String(chart.allowed)), className: 'bg-accent' }]
            : []),
        ]}
      />
      <figcaption className="mt-3 max-w-2xl text-sm text-muted">{copy.exceedances.caption}</figcaption>
    </figure>
  );
}

function TrendFigure({ chart, copy }: { chart: TrendChart; copy: LiveCopy }) {
  if (chart.years.length === 0) return null;
  const top = niceCeiling(chart.max);
  const step = chart.years.length > 1 ? PLOT_W / (chart.years.length - 1) : 0;
  const x = (index: number) => PAD.left + (chart.years.length > 1 ? step * index : PLOT_W / 2);
  const y = (value: number) => PAD.top + PLOT_H - (value / top) * PLOT_H;
  const colours = ['var(--ink)', 'var(--accent)', 'var(--muted)'];
  return (
    <figure data-chart="trend">
      <h3 className={CHART_TITLE}>{copy.trend.title}</h3>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mt-5 h-auto w-full text-ink" role="img" aria-label={copy.trend.title}>
        <Axis top={top} years={chart.years} x={x} />
        {chart.series.map((line, s) => {
          // A missing year breaks the line instead of joining across it.
          const path = line.values
            .map((value, index) => (value === null ? null : `${x(index)},${y(value)}`))
            .reduce<string[][]>(
              (runs, point) => {
                if (point === null) runs.push([]);
                else runs[runs.length - 1].push(point);
                return runs;
              },
              [[]],
            )
            .filter((run) => run.length > 0)
            .map((run) => `M${run.join(' L')}`)
            .join(' ');
          return (
            <g key={line.pollutant}>
              <path d={path} fill="none" stroke={colours[s % colours.length]} strokeWidth={1.75} />
              {line.values.map((value, index) =>
                value === null ? null : (
                  <circle key={chart.years[index]} cx={x(index)} cy={y(value)} r={2.5} fill={colours[s % colours.length]}>
                    <title>{`${line.pollutant}, ${chart.years[index]}: ${value} µg/m³`}</title>
                  </circle>
                ),
              )}
            </g>
          );
        })}
      </svg>
      <Legend
        items={chart.series.map((line, s) => ({
          label: line.pollutant,
          className: ['bg-ink', 'bg-accent', 'bg-muted'][s % 3],
        }))}
      />
      <figcaption className="mt-3 max-w-2xl text-sm text-muted">{copy.trend.caption}</figcaption>
    </figure>
  );
}
