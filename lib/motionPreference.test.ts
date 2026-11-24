import { describe, expect, it } from 'vitest';
import { isPausedValue, PAUSED } from './motionPreference';

describe('isPausedValue', () => {
  it('pauses only on the stored value', () => {
    expect(isPausedValue(PAUSED)).toBe(true);
  });

  it.each([null, undefined, '', 'running', 'PAUSED', ' paused'])('keeps moving on %j', (value) => {
    expect(isPausedValue(value)).toBe(false);
  });
});
