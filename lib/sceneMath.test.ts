import { describe, expect, it } from 'vitest';
import {
  groundHit,
  hexToLinear,
  lookAtOrigin,
  multiply,
  perspective,
  rotationY,
  toRotatedFrame,
  viewMatrix,
  type Mat4,
} from './sceneMath';

/** Column-major matrix times (x, y, z, 1). */
const apply = (m: Mat4, [x, y, z]: number[]) =>
  [0, 1, 2, 3].map((row) => m[row]! * x! + m[4 + row]! * y! + m[8 + row]! * z! + m[12 + row]!);

describe('perspective', () => {
  const m = perspective(90, 2, 1, 10);

  it('maps the near and far planes to the ends of clip space', () => {
    const near = apply(m, [0, 0, -1]);
    const far = apply(m, [0, 0, -10]);
    expect(near[2]! / near[3]!).toBeCloseTo(-1, 6);
    expect(far[2]! / far[3]!).toBeCloseTo(1, 6);
  });

  it('uses the vertical field of view and widens it by the aspect ratio', () => {
    const top = apply(m, [0, 1, -1]);
    const side = apply(m, [2, 0, -1]);
    expect(top[1]! / top[3]!).toBeCloseTo(1, 6);
    expect(side[0]! / side[3]!).toBeCloseTo(1, 6);
  });
});

describe('viewMatrix', () => {
  it('puts the eye at the origin and the target straight ahead, on -Z', () => {
    const eye: [number, number, number] = [0, 5.2, 10.5];
    const m = viewMatrix(eye);
    for (const v of apply(m, eye).slice(0, 3)) expect(v).toBeCloseTo(0, 5);
    const target = apply(m, [0, 0, 0]);
    expect(target[0]).toBeCloseTo(0, 6);
    expect(target[1]).toBeCloseTo(0, 6);
    expect(target[2]).toBeCloseTo(-Math.hypot(5.2, 10.5), 5);
  });

  it('keeps the world up direction pointing up on screen', () => {
    const { up, right } = lookAtOrigin([3, 4, 8]);
    expect(up[1]).toBeGreaterThan(0);
    expect(right[1]).toBeCloseTo(0, 6);
  });
});

describe('rotationY and multiply', () => {
  it('turns +X towards -Z for a positive angle, as three.js does', () => {
    const [x, , z] = apply(rotationY(Math.PI / 2), [1, 0, 0]);
    expect(x).toBeCloseTo(0, 6);
    expect(z).toBeCloseTo(-1, 6);
  });

  it('composes right to left', () => {
    const quarter = rotationY(Math.PI / 2);
    const half = multiply(quarter, quarter);
    const [x, , z] = apply(half, [1, 0, 0]);
    expect(x).toBeCloseTo(-1, 6);
    expect(z).toBeCloseTo(0, 6);
  });
});

describe('groundHit', () => {
  it('finds the origin under the centre of the screen', () => {
    const hit = groundHit([0, 5.2, 10.5], 40, 16 / 9, 0, 0);
    expect(hit![0]).toBeCloseTo(0, 6);
    expect(hit![1]).toBeCloseTo(0, 6);
  });

  it('lands left of centre for a pointer on the left and nearer for a pointer lower down', () => {
    const left = groundHit([0, 5.2, 10.5], 40, 16 / 9, -0.5, 0)!;
    const low = groundHit([0, 5.2, 10.5], 40, 16 / 9, 0, -0.5)!;
    expect(left[0]).toBeLessThan(0);
    expect(low[1]).toBeGreaterThan(0);
  });

  it('misses when the pointer is above the horizon', () => {
    expect(groundHit([0, 1, 10], 40, 16 / 9, 0, 1)).toBeNull();
  });

  it('misses a ray parallel to the ground unless the eye sits on it', () => {
    // The eye sits level with the target, so the centre ray runs along y = 0.
    expect(groundHit([0, 0, 5], 90, 1, 0, 0)).toEqual([0, 5]);
  });
});

describe('toRotatedFrame', () => {
  it('undoes a group rotation about +Y', () => {
    // A group turned by +90° carries its local +X to world -Z; the inverse brings it back.
    const [x, z] = toRotatedFrame(0, -1, Math.PI / 2);
    expect(x).toBeCloseTo(1, 6);
    expect(z).toBeCloseTo(0, 6);
  });
});

describe('hexToLinear', () => {
  it('decodes sRGB to linear light', () => {
    expect(hexToLinear('#000000')).toEqual([0, 0, 0]);
    expect(hexToLinear('#ffffff').map((c) => +c.toFixed(6))).toEqual([1, 1, 1]);
    // Mid grey is about 21% linear light, not 50%.
    expect(hexToLinear('#808080')[0]).toBeCloseTo(0.2158605, 6);
    // Tiny values sit on the linear segment of the curve.
    expect(hexToLinear('#010101')[0]).toBeCloseTo(1 / 255 / 12.92, 9);
  });

  it('rejects anything but #rrggbb', () => {
    expect(() => hexToLinear('#fff')).toThrow(/rrggbb/);
    expect(() => hexToLinear('red')).toThrow(/rrggbb/);
  });
});
