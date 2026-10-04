import { describe, expect, it } from 'vitest';
import { isMenuKey, nextMenuIndex } from './menu';

describe('nextMenuIndex', () => {
  it('moves down and up by one', () => {
    expect(nextMenuIndex(1, 'ArrowDown', 4)).toBe(2);
    expect(nextMenuIndex(1, 'ArrowUp', 4)).toBe(0);
  });

  it('wraps around at both ends', () => {
    expect(nextMenuIndex(3, 'ArrowDown', 4)).toBe(0);
    expect(nextMenuIndex(0, 'ArrowUp', 4)).toBe(3);
  });

  it('jumps to the first and last option', () => {
    expect(nextMenuIndex(2, 'Home', 4)).toBe(0);
    expect(nextMenuIndex(0, 'End', 4)).toBe(3);
  });

  it('starts from the first option when nothing is highlighted', () => {
    expect(nextMenuIndex(-1, 'ArrowDown', 4)).toBe(0);
  });

  it('has nothing to highlight in an empty menu', () => {
    expect(nextMenuIndex(0, 'ArrowDown', 0)).toBe(-1);
  });
});

describe('isMenuKey', () => {
  it('accepts only the navigation keys', () => {
    expect(isMenuKey('ArrowDown')).toBe(true);
    expect(isMenuKey('End')).toBe(true);
    expect(isMenuKey('ArrowLeft')).toBe(false);
    expect(isMenuKey('Enter')).toBe(false);
  });
});
