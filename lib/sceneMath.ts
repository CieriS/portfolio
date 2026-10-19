/**
 * The little linear algebra the point field needs: a perspective camera that looks at the
 * origin, a rotation about the vertical axis, and the pointer ray hitting the ground plane.
 * Matrices are column-major `Float32Array(16)`, the layout `uniformMatrix4fv` expects.
 * The conventions follow three.js (right-handed, camera looking down its own -Z), so the
 * picture is the one the scene drew when it ran on three.
 */
export type Vec3 = [number, number, number];
export type Mat4 = Float32Array;

/** OpenGL perspective projection; `fov` is the vertical field of view in degrees. */
export function perspective(fov: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1 / Math.tan((fov * Math.PI) / 360);
  const m = new Float32Array(16);
  m[0] = f / aspect;
  m[5] = f;
  m[10] = -(far + near) / (far - near);
  m[11] = -1;
  m[14] = (-2 * far * near) / (far - near);
  return m;
}

/** Orthonormal camera axes for an eye looking at the origin with +Y up. */
export function lookAtOrigin(eye: Vec3): { right: Vec3; up: Vec3; back: Vec3 } {
  const back = normalize(eye);
  const right = normalize(cross([0, 1, 0], back));
  const up = cross(back, right);
  return { right, up, back };
}

/** World → camera transform for an eye looking at the origin. */
export function viewMatrix(eye: Vec3): Mat4 {
  const { right, up, back } = lookAtOrigin(eye);
  const m = new Float32Array(16);
  [m[0], m[4], m[8]] = right;
  [m[1], m[5], m[9]] = up;
  [m[2], m[6], m[10]] = back;
  m[12] = -dot(right, eye);
  m[13] = -dot(up, eye);
  m[14] = -dot(back, eye);
  m[15] = 1;
  return m;
}

/** Rotation by `angle` radians about +Y. */
export function rotationY(angle: number): Mat4 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const m = new Float32Array(16);
  m[0] = c;
  m[2] = -s;
  m[5] = 1;
  m[8] = s;
  m[10] = c;
  m[15] = 1;
  return m;
}

/** `a × b` for column-major 4×4 matrices. */
export function multiply(a: Mat4, b: Mat4): Mat4 {
  const m = new Float32Array(16);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) sum += a[k * 4 + row]! * b[col * 4 + k]!;
      m[col * 4 + row] = sum;
    }
  }
  return m;
}

/**
 * Where the ray through the screen point `ndc` (-1..1 on both axes) meets the plane y = 0,
 * or `null` when it never does (pointing at or above the horizon).
 */
export function groundHit(eye: Vec3, fov: number, aspect: number, ndcX: number, ndcY: number): [number, number] | null {
  const { right, up, back } = lookAtOrigin(eye);
  const h = Math.tan((fov * Math.PI) / 360);
  const cx = ndcX * h * aspect;
  const cy = ndcY * h;
  const dir: Vec3 = [
    right[0] * cx + up[0] * cy - back[0],
    right[1] * cx + up[1] * cy - back[1],
    right[2] * cx + up[2] * cy - back[2],
  ];
  if (dir[1] === 0) return eye[1] === 0 ? [eye[0], eye[2]] : null;
  const t = -eye[1] / dir[1];
  if (t < 0) return null;
  return [eye[0] + dir[0] * t, eye[2] + dir[2] * t];
}

/** A point on the ground brought into the frame of a group rotated by `angle` about +Y. */
export function toRotatedFrame(x: number, z: number, angle: number): [number, number] {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [x * c - z * s, x * s + z * c];
}

/** `#rrggbb` (sRGB, as written in CSS) to linear RGB, the space the shader blends in. */
export function hexToLinear(hex: string): Vec3 {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) throw new Error(`Not a #rrggbb colour: ${hex}`);
  const n = parseInt(match[1]!, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => srgbToLinear(c / 255)) as Vec3;
}

function srgbToLinear(c: number): number {
  return c < 0.04045 ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function normalize(v: Vec3): Vec3 {
  const length = Math.hypot(v[0], v[1], v[2]);
  return length === 0 ? [0, 0, 0] : [v[0] / length, v[1] / length, v[2] / length];
}
