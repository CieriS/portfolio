import { describe, expect, it } from 'vitest';
import { getCaseStudy } from './caseStudy';
import {
  DATA_ORIGINS,
  exceedanceChart,
  isStale,
  niceCeiling,
  parseExceedances,
  parseMeta,
  parseTrends,
  trendChart,
  type Exceedance,
  type Trend,
} from './liveResults';
import { CASE_STUDY_IDS } from './routes';

const exceedance = (overrides: Partial<Exceedance>): Exceedance => ({
  station_name: 'GIARDINI MARGHERITA',
  municipality: 'BOLOGNA',
  pollutant_code: 'PM10',
  metric: 'daily_mean',
  year: 2025,
  exceedances: 10,
  max_exceedances_per_year: 35,
  year_coverage: 0.98,
  ...overrides,
});

const trend = (overrides: Partial<Trend>): Trend => ({
  municipality: 'BOLOGNA',
  pollutant_code: 'PM10',
  year: 2025,
  annual_mean_ugm3: 24,
  is_representative: true,
  ...overrides,
});

const PM10 = { municipality: 'BOLOGNA', pollutant: 'PM10', metric: 'daily_mean' };

// Whether a guard accepts a value, without letting its error escape.
const safe = (parse: (value: unknown) => unknown, value: unknown) => {
  try {
    parse(value);
    return { success: true };
  } catch {
    return { success: false };
  }
};

describe('exceedanceChart', () => {
  it('lines the stations up on every year that has data, with gaps where a station has none', () => {
    const chart = exceedanceChart(
      [
        exceedance({ station_name: 'VIA CHIARINI', year: 2024, exceedances: 14 }),
        exceedance({ year: 2025, exceedances: 10 }),
        exceedance({ year: 2024, exceedances: 15 }),
        exceedance({ station_name: 'VIA CHIARINI', year: 2026, exceedances: 2 }),
      ],
      PM10,
    );
    expect(chart.years).toEqual([2024, 2025, 2026]);
    expect(chart.stations).toEqual([
      { name: 'GIARDINI MARGHERITA', values: [15, 10, null] },
      { name: 'VIA CHIARINI', values: [14, null, 2] },
    ]);
    expect(chart.allowed).toBe(35);
    expect(chart.max).toBe(35);
  });

  it('keeps only the municipality, pollutant and metric asked for', () => {
    const chart = exceedanceChart(
      [
        exceedance({ municipality: 'MODENA', exceedances: 40 }),
        exceedance({ pollutant_code: 'NO2', metric: 'hourly_mean', exceedances: 3 }),
        exceedance({ exceedances: 60 }),
      ],
      PM10,
    );
    expect(chart.stations).toEqual([{ name: 'GIARDINI MARGHERITA', values: [60] }]);
    expect(chart.max).toBe(60);
  });

  it('has no allowed line when the rows disagree on it, and nothing at all for no rows', () => {
    expect(exceedanceChart([exceedance({ year: 2024 }), exceedance({ max_exceedances_per_year: 25 })], PM10).allowed).toBeNull();
    expect(exceedanceChart([], PM10)).toEqual({ years: [], stations: [], allowed: null, max: 0 });
  });
});

describe('trendChart', () => {
  it('draws one line per pollutant, leaving out years that are not representative', () => {
    const chart = trendChart(
      [
        trend({ year: 2024, annual_mean_ugm3: 25 }),
        trend({ year: 2025, annual_mean_ugm3: 24 }),
        trend({ pollutant_code: 'NO2', year: 2025, annual_mean_ugm3: 31 }),
        trend({ pollutant_code: 'NO2', year: 2026, annual_mean_ugm3: 20, is_representative: false }),
      ],
      { municipality: 'BOLOGNA', pollutants: ['PM10', 'NO2'] },
    );
    expect(chart.years).toEqual([2024, 2025]);
    expect(chart.series).toEqual([
      { pollutant: 'PM10', values: [25, 24] },
      { pollutant: 'NO2', values: [null, 31] },
    ]);
    expect(chart.max).toBe(31);
  });

  it('drops a pollutant with no value at all', () => {
    const chart = trendChart([trend({})], { municipality: 'BOLOGNA', pollutants: ['PM10', 'O3'] });
    expect(chart.series.map((line) => line.pollutant)).toEqual(['PM10']);
  });
});

describe('isStale', () => {
  const now = new Date('2026-10-23T07:00:00Z');
  it('is fresh within 48 hours and stale after', () => {
    expect(isStale('2026-10-21T07:00:00+00:00', now)).toBe(false);
    expect(isStale('2026-10-21T06:59:00+00:00', now)).toBe(true);
  });
});

describe('niceCeiling', () => {
  it('rounds up to 1, 2 or 5 times a power of ten', () => {
    expect(niceCeiling(0)).toBe(1);
    expect(niceCeiling(35)).toBe(50);
    expect(niceCeiling(42)).toBe(50);
    expect(niceCeiling(50)).toBe(50);
    expect(niceCeiling(51)).toBe(100);
    expect(niceCeiling(17)).toBe(20);
    expect(niceCeiling(0.4)).toBe(0.5);
  });
});

describe('stations without a municipality', () => {
  it('are accepted, as the export has them (local networks), and left out of a municipality chart', () => {
    const local = { ...exceedance({ station_name: 'LM-PR' }), municipality: null };
    expect(safe(parseExceedances, [local]).success).toBe(true);
    expect(safe(parseTrends, [{ ...trend({}), municipality: null }]).success).toBe(true);
    const chart = exceedanceChart(parseExceedances([local, exceedance({})]), PM10);
    expect(chart.stations.map((station) => station.name)).toEqual(['GIARDINI MARGHERITA']);
  });
});

describe('schemas', () => {
  it('accept the export contract v1 and refuse another version', () => {
    const meta = { schema_version: 1, generated_at: '2026-10-21T12:43:26.644502+00:00', period: null };
    expect(safe(parseMeta, meta).success).toBe(true);
    expect(safe(parseMeta, { ...meta, schema_version: 2 }).success).toBe(false);
    expect(safe(parseExceedances, [exceedance({})]).success).toBe(true);
    expect(safe(parseExceedances, [{ ...exceedance({}), year: '2025' }]).success).toBe(false);
    expect(safe(parseTrends, [trend({ annual_mean_ugm3: null })]).success).toBe(true);
  });
});

describe('data origins', () => {
  it('cover the source of every case study with live results, so the CSP lets it through', () => {
    for (const id of CASE_STUDY_IDS) {
      const live = getCaseStudy(id).data.live;
      if (live) expect(DATA_ORIGINS, id).toContain(new URL(live.source).origin);
    }
  });
});

describe('guards', () => {
  const meta = { schema_version: 1, generated_at: '2026-10-21T12:43:26Z', period: { from: '2020-01-01', to: '2026-10-20' } };

  it('accept a period and refuse a half one', () => {
    expect(parseMeta(meta)).toEqual(meta);
    expect(safe(parseMeta, { ...meta, period: { from: '2020-01-01' } }).success).toBe(false);
  });

  it('refuse a date-time without an offset or that is not a date', () => {
    expect(safe(parseMeta, { ...meta, generated_at: '2026-10-21T12:43:26' }).success).toBe(false);
    expect(safe(parseMeta, { ...meta, generated_at: '2026-13-45T99:00:00Z' }).success).toBe(false);
    expect(safe(parseMeta, { ...meta, generated_at: 1 }).success).toBe(false);
  });

  it('refuse what is not an object or an array, and a missing field', () => {
    for (const value of [null, [], 'meta', 1]) expect(safe(parseMeta, value).success).toBe(false);
    expect(safe(parseExceedances, {}).success).toBe(false);
    expect(safe(parseTrends, null).success).toBe(false);
    const partial: Partial<Exceedance> = exceedance({});
    delete partial.metric;
    expect(safe(parseExceedances, [partial]).success).toBe(false);
  });

  it('refuse a fractional count, a non-finite mean and a non-boolean flag', () => {
    expect(safe(parseExceedances, [exceedance({ exceedances: 1.5 })]).success).toBe(false);
    expect(safe(parseTrends, [trend({ annual_mean_ugm3: Number.NaN })]).success).toBe(false);
    expect(safe(parseTrends, [{ ...trend({}), is_representative: 'yes' }]).success).toBe(false);
  });

  it('name the row and the field that failed', () => {
    expect(() => parseExceedances([exceedance({}), { ...exceedance({}), year: '2025' }])).toThrow('exceedances[1].year');
  });

  it('accept an empty export', () => {
    expect(parseExceedances([])).toEqual([]);
    expect(parseTrends([])).toEqual([]);
  });
});
