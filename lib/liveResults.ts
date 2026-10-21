import { z } from 'zod';

/**
 * Live results of a case study: JSON files a project publishes on its own (aria-er: a daily
 * export on GitHub Pages, contract `v1` in its `docs/export.md`), read in the browser.
 * Everything here is pure, so the client component only fetches and draws.
 */

/** Origins the browser may fetch data from; `next.config.ts` puts them in `connect-src`. */
export const DATA_ORIGINS = ['https://cieris.github.io'] as const;

/** Older than this, the data are shown with a warning: the daily run has not succeeded. */
export const STALE_AFTER_HOURS = 48;

export const MetaSchema = z.object({
  schema_version: z.literal(1),
  generated_at: z.string().datetime({ offset: true }),
  period: z.object({ from: z.string(), to: z.string() }).nullable(),
});

// Stations of the local networks have no municipality in the ARPAE registry: null.
const ExceedanceSchema = z.object({
  station_name: z.string(),
  municipality: z.string().nullable(),
  pollutant_code: z.string(),
  metric: z.string(),
  year: z.number().int(),
  exceedances: z.number().int(),
  max_exceedances_per_year: z.number().int().nullable(),
  year_coverage: z.number().nullable(),
});

const TrendSchema = z.object({
  municipality: z.string().nullable(),
  pollutant_code: z.string(),
  year: z.number().int(),
  annual_mean_ugm3: z.number().nullable(),
  is_representative: z.boolean().nullable(),
});

export const ExceedancesSchema = z.array(ExceedanceSchema);
export const TrendsSchema = z.array(TrendSchema);

export type Meta = z.infer<typeof MetaSchema>;
export type Exceedance = z.infer<typeof ExceedanceSchema>;
export type Trend = z.infer<typeof TrendSchema>;

export type ExceedanceChart = {
  years: number[];
  stations: { name: string; values: (number | null)[] }[];
  /** Exceedances the law allows per year, if every row agrees on it. */
  allowed: number | null;
  max: number;
};

/**
 * Days over the limit per station and year in one municipality. Years span every year with
 * data for any station, so a station missing a year shows a gap rather than shifting.
 */
export function exceedanceChart(
  rows: Exceedance[],
  filter: { municipality: string; pollutant: string; metric: string },
): ExceedanceChart {
  const selected = rows.filter(
    (row) => row.municipality === filter.municipality && row.pollutant_code === filter.pollutant && row.metric === filter.metric,
  );
  const years = [...new Set(selected.map((row) => row.year))].sort((a, b) => a - b);
  const names = [...new Set(selected.map((row) => row.station_name))].sort();
  const stations = names.map((name) => ({
    name,
    values: years.map((year) => selected.find((row) => row.station_name === name && row.year === year)?.exceedances ?? null),
  }));
  const allowedValues = [...new Set(selected.map((row) => row.max_exceedances_per_year))];
  const allowed = allowedValues.length === 1 ? allowedValues[0] : null;
  const max = Math.max(0, allowed ?? 0, ...selected.map((row) => row.exceedances));
  return { years, stations, allowed, max };
}

export type TrendChart = {
  years: number[];
  series: { pollutant: string; values: (number | null)[] }[];
  max: number;
};

/** Annual means per pollutant in one municipality; years that are not representative are left out. */
export function trendChart(rows: Trend[], filter: { municipality: string; pollutants: string[] }): TrendChart {
  const selected = rows.filter(
    (row) =>
      row.municipality === filter.municipality &&
      filter.pollutants.includes(row.pollutant_code) &&
      row.is_representative !== false &&
      row.annual_mean_ugm3 !== null,
  );
  const years = [...new Set(selected.map((row) => row.year))].sort((a, b) => a - b);
  const series = filter.pollutants
    .map((pollutant) => ({
      pollutant,
      values: years.map(
        (year) => selected.find((row) => row.pollutant_code === pollutant && row.year === year)?.annual_mean_ugm3 ?? null,
      ),
    }))
    .filter((line) => line.values.some((value) => value !== null));
  const max = Math.max(0, ...selected.map((row) => row.annual_mean_ugm3 ?? 0));
  return { years, series, max };
}

export function isStale(generatedAt: string, now: Date, hours = STALE_AFTER_HOURS): boolean {
  return now.getTime() - new Date(generatedAt).getTime() > hours * 3_600_000;
}

/** A round upper bound for an axis: 1, 2 or 5 times a power of ten, at least `value`. */
export function niceCeiling(value: number): number {
  if (value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 5, 10].find((factor) => factor * power >= value) ?? 10;
  return step * power;
}
