import { describe, expect, it } from 'vitest';
import { SCROLL_TRACK, scrollThumb } from './scroll';

describe('scrollThumb', () => {
  it('is absent when the content fits', () => {
    expect(scrollThumb(800, 800)).toBeNull();
    expect(scrollThumb(800, 600)).toBeNull();
  });

  it('ignores overflow that is only rounding noise', () => {
    expect(scrollThumb(800, 804)).toBeNull();
    expect(scrollThumb(800, 808)).not.toBeNull();
  });

  it('is absent before the container has a size', () => {
    expect(scrollThumb(0, 1200)).toBeNull();
  });

  it('covers the visible share of the track and travels over the rest', () => {
    expect(scrollThumb(800, 1600)).toEqual({ size: SCROLL_TRACK / 2, travel: SCROLL_TRACK / 2 });
    expect(scrollThumb(500, 2000, 100)).toEqual({ size: 25, travel: 75 });
  });

  it('never shrinks below a visible minimum, and never leaves the track', () => {
    const thumb = scrollThumb(600, 60_000);
    expect(thumb?.size).toBe(12);
    expect(thumb!.size + thumb!.travel).toBe(SCROLL_TRACK);
  });
});
