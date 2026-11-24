/**
 * The visitor's choice to pause the scene and the decorative loops (#142, WCAG 2.2.2). Stored in
 * `localStorage` so it survives a reload; reflected as `data-motion="paused"` on `<html>`, which
 * the CSS reads to stop the loops. Pure parsing here, the browser calls stay in the toggle.
 */
export const MOTION_STORAGE_KEY = 'motion';
export const PAUSED = 'paused';

/** Only the exact stored value pauses: anything else (missing, old, tampered) means moving. */
export function isPausedValue(value: string | null | undefined): boolean {
  return value === PAUSED;
}
