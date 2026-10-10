import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { THEME, type ThemeName } from './theme';

const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');

/** Custom properties declared in the first rule that starts with `selector`. */
function tokens(selector: string): Record<string, string> {
  const block = new RegExp(`(?:^|\\n)${selector.replace('.', '\\.')}\\s*\\{([^}]*)\\}`).exec(css)?.[1] ?? '';
  return Object.fromEntries([...block.matchAll(/--([a-z-]+):\s*([^;]+);/g)].map((match) => [match[1], match[2].trim()]));
}

const rgb = (hex: string) => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));

/** WCAG 2 contrast ratio between two `#rrggbb` colours. */
function contrast(a: string, b: string): number {
  const luminance = (hex: string) => {
    const [r, g, bl] = rgb(hex).map((channel) => {
      const c = channel / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const SELECTOR: Record<ThemeName, string> = { light: ':root', dark: '.dark' };

describe.each(Object.keys(THEME) as ThemeName[])('%s theme', (name) => {
  const theme = THEME[name];
  const declared = tokens(SELECTOR[name]);

  it('declares the same paper and ink in CSS as in lib/theme.ts', () => {
    expect(declared.paper).toBe(theme.paper);
    expect(declared.ink).toBe(theme.ink);
  });

  it('draws its hairlines in the ink colour', () => {
    expect(declared.line).toMatch(new RegExp(`^rgb\\(${rgb(theme.ink).join(' ')} / 0\\.\\d+\\)$`));
  });

  it('keeps text readable: ink at AAA, muted at AA', () => {
    expect(contrast(theme.ink, theme.paper)).toBeGreaterThanOrEqual(7);
    expect(contrast(declared.muted, theme.paper)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps the scene visible but below any text', () => {
    const dot = contrast(theme.dot, theme.paper);
    expect(dot).toBeGreaterThan(1.8);
    expect(dot).toBeLessThan(3);
    expect(dot).toBeLessThan(contrast(declared.muted, theme.paper));
  });
});

describe('light theme', () => {
  it('is a cream paper, not display white', () => {
    const [r, , b] = rgb(THEME.light.paper);
    // Warm (red over blue) and clearly below pure white, where the scene points wash out.
    expect(r).toBeGreaterThan(b);
    expect(contrast('#ffffff', THEME.light.paper)).toBeGreaterThan(1.15);
  });

  it('compensates the thinner look of dark points with a larger point', () => {
    expect(THEME.light.pointSize).toBeGreaterThan(THEME.dark.pointSize);
  });
});

describe('contrast', () => {
  it('matches the reference values of WCAG', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrast('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
    expect(contrast('#123456', '#123456')).toBe(1);
  });
});
