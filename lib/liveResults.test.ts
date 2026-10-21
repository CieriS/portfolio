import { describe, expect, it } from 'vitest';
import { getCaseStudy } from './caseStudy';
import {
  DATA_ORIGINS,
  ExceedancesSchema,
  exceedanceChart,
  isStale,
  MetaSchema,
  niceCeiling,
  trendChart,
  TrendsSchema,
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
    expect(ExceedancesSchema.safeParse([local]).success).toBe(true);
    expect(TrendsSchema.safeParse([{ ...trend({}), municipality: null }]).success).toBe(true);
    const chart = exceedanceChart(ExceedancesSchema.parse([local, exceedance({})]), PM10);
    expect(chart.stations.map((station) => station.name)).toEqual(['GIARDINI MARGHERITA']);
  });
});

describe('schemas', () => {
  it('accept the export contract v1 and refuse another version', () => {
    const meta = { schema_version: 1, generated_at: '2026-10-21T12:43:26.644502+00:00', period: null };
    expect(MetaSchema.safeParse(meta).success).toBe(true);
    expect(MetaSchema.safeParse({ ...meta, schema_version: 2 }).success).toBe(false);
    expect(ExceedancesSchema.safeParse([exceedance({})]).success).toBe(true);
    expect(ExceedancesSchema.safeParse([{ ...exceedance({}), year: '2025' }]).success).toBe(false);
    expect(TrendsSchema.safeParse([trend({ annual_mean_ugm3: null })]).success).toBe(true);
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
