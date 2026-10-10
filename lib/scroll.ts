/** Length of the scroll indicator's track, in pixels. */
export const SCROLL_TRACK = 96;
const MIN_THUMB = 12;
/** Overflow below this is rounding noise, not content worth pointing at. */
const MIN_OVERFLOW = 8;

export type ScrollThumb = { size: number; travel: number };

/**
 * Geometry of the indicator for a container showing `client` pixels of `content`: the thumb
 * covers the visible share of the track and travels over the rest. `null` when everything
 * already fits, so the indicator only appears where there is something below the fold.
 */
export function scrollThumb(client: number, content: number, track = SCROLL_TRACK): ScrollThumb | null {
  if (client <= 0 || content - client < MIN_OVERFLOW) return null;
  const size = Math.max(MIN_THUMB, Math.round((client / content) * track));
  return { size, travel: track - size };
}
