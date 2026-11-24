/**
 * Live results of a case study: JSON files a project publishes on its own (aria-er: a daily
 * export on GitHub Pages, contract `v1` in its `docs/export.md`), read in the browser.
 * Everything here is pure, so the client component only fetches and draws.
 *
 * The export is checked by small hand-written guards, not zod: this module runs in the
 * browser, where zod would add ~38 KB gzip and its `Function('')` probe trips the CSP
 * (issues #122, #124). Each guard throws on the first field that does not match.
 */

export { DATA_ORIGINS } from './dataOrigins';

/** Older than this, the data are shown with a warning: the daily run has not succeeded. */
const STALE_AFTER_HOURS = 48;

export type Meta = {
  schema_version: 1;
  generated_at: string;
  period: { from: string; to: string } | null;
};

// Stations of the local networks have no municipality in the ARPAE registry: null.
export type Exceedance = {
  station_name: string;
  municipality: string | null;
  pollutant_code: string;
  metric: string;
  year: number;
  exceedances: number;
  max_exceedances_per_year: number | null;
  year_coverage: number | null;
};

export type Trend = {
  municipality: string | null;
  pollutant_code: string;
  year: number;
  annual_mean_ugm3: number | null;
  is_representative: boolean | null;
};

type Check = (value: unknown) => boolean;

const isString: Check = (value) => typeof value === 'string';
const isNumber: Check = (value) => typeof value === 'number' && Number.isFinite(value);
const isInteger: Check = (value) => Number.isInteger(value);
const isBoolean: Check = (value) => typeof value === 'boolean';
const nullable =
  (check: Check): Check =>
  (value) =>
    value === null || check(value);
// An ISO 8601 date-time with an explicit offset, as the export writes it.
const isDateTime: Check = (value) =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(value) &&
  !Number.isNaN(Date.parse(value));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function object<T>(value: unknown, shape: Record<keyof T, Check>, at: string): T {
  if (!isRecord(value)) throw new TypeError(`${at}: expected an object`);
  for (const [key, check] of Object.entries<Check>(shape)) {
    if (!check(value[key])) throw new TypeError(`${at}.${key}: unexpected value`);
  }
  return value as T;
}

function array<T>(value: unknown, item: (value: unknown, at: string) => T, at: string): T[] {
  if (!Array.isArray(value)) throw new TypeError(`${at}: expected an array`);
  return value.map((entry, index) => item(entry, `${at}[${index}]`));
}

const isPeriod: Check = (value) => value === null || (isRecord(value) && isString(value.from) && isString(value.to));

/** The export's `meta.json`; only contract version 1 is accepted. */
export function parseMeta(value: unknown): Meta {
  return object<Meta>(value, { schema_version: (v) => v === 1, generated_at: isDateTime, period: isPeriod }, 'meta');
}

const exceedance = (value: unknown, at: string) =>
  object<Exceedance>(
    value,
    {
      station_name: isString,
      municipality: nullable(isString),
      pollutant_code: isString,
      metric: isString,
      year: isInteger,
      exceedances: isInteger,
      max_exceedances_per_year: nullable(isInteger),
      year_coverage: nullable(isNumber),
    },
    at,
  );

const trend = (value: unknown, at: string) =>
  object<Trend>(
    value,
    {
      municipality: nullable(isString),
      pollutant_code: isString,
      year: isInteger,
      annual_mean_ugm3: nullable(isNumber),
      is_representative: nullable(isBoolean),
    },
    at,
  );

export function parseExceedances(value: unknown): Exceedance[] {
  return array(value, exceedance, 'exceedances');
}

export function parseTrends(value: unknown): Trend[] {
  return array(value, trend, 'trends');
}

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
