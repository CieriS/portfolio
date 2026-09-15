export function pad(value: number, size = 2): string {
  return String(value).padStart(size, '0');
}

/** ISO `YYYY-MM-DD` → `DD.MM.YYYY`; `null` renders as the fallback glyph. */
export function formatDate(iso: string | null, fallback: string): string {
  if (!iso) return fallback;
  const [year, month, day] = iso.split('-');
  return `${day}.${month}.${year}`;
}

/** Keyed lookup into a localized copy map using an id coming from shared data. */
export function pick<V>(map: Readonly<Record<string, V>>, key: string): V | undefined {
  return Object.hasOwn(map, key) ? map[key] : undefined;
}
