/**
 * Theme colours for everything that cannot read CSS custom properties: the WebGL scene, the
 * browser chrome colour, the web manifest and the share cards. `app/globals.css` declares the
 * same paper and ink; `lib/theme.test.ts` fails when the two drift apart or lose contrast.
 */
export type ThemeName = 'light' | 'dark';

/**
 * `muted` is secondary text, as `--muted` in the CSS.
 * `dot` is the resting colour of a scene point, `pointSize` its size in world units.
 * `presenceScale` multiplies how present the field is behind each view (capped at 1).
 */
export type ThemeColors = { paper: string; ink: string; muted: string; dot: string; pointSize: number; presenceScale: number };

export const THEME: Record<ThemeName, ThemeColors> = {
  // Dark points on a bright ground look thinner than light points on a dark one at the same
  // contrast, so the light theme compensates with a darker dot and a larger point. The inner
  // views dim the field to about half; on cream that left it close to invisible, so the light
  // theme also keeps more of it (0.45 becomes 0.7).
  light: { paper: '#ede7db', ink: '#1b1916', muted: '#646057', dot: '#9c9687', pointSize: 0.043, presenceScale: 1.55 },
  dark: { paper: '#0b0b0b', ink: '#ecebe7', muted: '#8c8b86', dot: '#3f3f3c', pointSize: 0.034, presenceScale: 1 },
};

/** The accent, the same in both themes (`--accent`, declared once on `:root`). */
export const ACCENT = '#ff5b1f';

/** The ink of a theme at some opacity, for hairlines and borders: `rgba(r, g, b, alpha)`. */
export function inkAlpha(theme: ThemeName, alpha: number): string {
  const hex = THEME[theme].ink.slice(1);
  const [r, g, b] = [0, 2, 4].map((at) => parseInt(hex.slice(at, at + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
