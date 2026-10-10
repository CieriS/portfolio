/**
 * Theme colours for everything that cannot read CSS custom properties: the WebGL scene, the
 * browser chrome colour, the web manifest and the share cards. `app/globals.css` declares the
 * same paper and ink; `lib/theme.test.ts` fails when the two drift apart or lose contrast.
 */
export type ThemeName = 'light' | 'dark';

/** `dot` is the resting colour of a scene point, `pointSize` its size in world units. */
export type ThemeColors = { paper: string; ink: string; dot: string; pointSize: number };

export const THEME: Record<ThemeName, ThemeColors> = {
  // Dark points on a bright ground look thinner than light points on a dark one at the same
  // contrast, so the light theme compensates with a darker dot and a larger point.
  light: { paper: '#ede7db', ink: '#1b1916', dot: '#9c9687', pointSize: 0.043 },
  dark: { paper: '#0b0b0b', ink: '#ecebe7', dot: '#3f3f3c', pointSize: 0.034 },
};
