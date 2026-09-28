import { describe, expect, it } from 'vitest';
import { formatDate, pad, pick } from './format';

describe('pad', () => {
  it('left-pads to two digits by default', () => {
    expect(pad(4)).toBe('04');
    expect(pad(12)).toBe('12');
  });

  it('honours a custom width', () => {
    expect(pad(7, 3)).toBe('007');
  });
});

describe('formatDate', () => {
  it('turns an ISO date into DD.MM.YYYY', () => {
    expect(formatDate('2022-02-23', '—')).toBe('23.02.2022');
  });

  it('renders the fallback for null', () => {
    expect(formatDate(null, '—')).toBe('—');
  });
});

describe('pick', () => {
  it('reads own keys only, never the prototype chain', () => {
    const map = { a: 1 };
    expect(pick(map, 'a')).toBe(1);
    expect(pick(map, 'toString')).toBeUndefined();
  });
});
