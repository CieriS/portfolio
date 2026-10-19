import { FIELD } from '@/lib/sceneField';

/** A whole number as a GLSL float literal. */
const float = (value: number) => value.toFixed(1);

/**
 * The field's motion, per point, on the GPU. Each vertex gets its height from three waves
 * plus the ripple around the pointer, and its colour from how much it glows: near the
 * pointer, on a crest, or under a data packet travelling along its row.
 *
 * `uWave` and `uFlow` arrive already wrapped (see `lib/sceneField.ts`): the rates that
 * multiply `uWave` below are the ones listed in `WAVE_RATES`, and a test keeps them in step.
 */
export const FIELD_VERTEX = /* glsl */ `
uniform float uWave;
uniform float uFlow;
uniform float uHeat;
uniform vec2 uPointer;
uniform float uRadius;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uForce;
uniform float uPulse;
uniform float uGlowScale;
uniform float uSize;
uniform float uScale;
uniform vec3 uBase;
uniform vec3 uInk;

attribute vec2 aCell;

varying vec3 vColor;

const float COLS = ${float(FIELD.cols)};
const float LANE_EVERY = ${float(FIELD.laneEvery)};
const float PACKET_SPAN = ${float(FIELD.packetSpan)};
const float PACKET_TAIL = ${float(FIELD.packetTail)};

void main() {
  float x = position.x;
  float z = position.z;

  vec2 away = vec2(x, z) - uPointer;
  float d2 = dot(away, away);
  float influence = uHeat * exp(-d2 / (uRadius * uRadius));

  float y =
    uAmplitude * sin(x * uFrequency + uWave * 1.0) * cos(z * uFrequency * 0.8 - uWave * 0.7) +
    uAmplitude * 0.35 * sin((x + z) * uFrequency * 0.5 + uWave * 0.45) +
    influence * (uForce + 0.22 * sin(sqrt(d2) * 3.2 - uWave * 4.0));

  // Packets run along every LANE_EVERY-th row, in alternating directions.
  float pulse = 0.0;
  if (mod(aCell.y, LANE_EVERY) < 0.5) {
    float lane = floor(aCell.y / LANE_EVERY + 0.5);
    float cell = mod(lane, 2.0) < 0.5 ? aCell.x : COLS - 1.0 - aCell.x;
    float behind = mod(uFlow + lane * 17.3 - cell, PACKET_SPAN);
    if (behind < PACKET_TAIL) {
      float k = 1.0 - behind / PACKET_TAIL;
      pulse = k * k * uPulse;
    }
  }

  float glow = min(1.0, influence * 1.3 + max(0.0, y) * 0.12 + pulse) * uGlowScale;
  vColor = mix(uBase, uInk, glow);

  vec4 mvPosition = modelViewMatrix * vec4(x, y, z, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  // Same perspective size attenuation as three's own points material.
  gl_PointSize = uSize * (uScale / -mvPosition.z);
}
`;

/**
 * Declarations three.js used to prepend to every shader. Kept out of `FIELD_VERTEX` so that
 * the field's own code stays as it was; `fieldRenderer.ts` joins the two.
 */
export const VERTEX_PRELUDE = /* glsl */ `
precision highp float;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
attribute vec3 position;
`;

/**
 * Flat square points, then what three applied to its built-in materials by default: ACES
 * filmic tone mapping (exposure 1) and the linear → sRGB transfer for the screen. Copied from
 * three r186 (`tonemapping_pars_fragment`, `colorspace_pars_fragment`) so the colours match.
 */
export const FIELD_FRAGMENT = /* glsl */ `
precision highp float;
varying vec3 vColor;

vec3 RRTAndODTFit(vec3 v) {
  vec3 a = v * (v + 0.0245786) - 0.000090537;
  vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081;
  return a / b;
}

vec3 ACESFilmicToneMapping(vec3 color) {
  const mat3 ACESInputMat = mat3(
    vec3(0.59719, 0.07600, 0.02840),
    vec3(0.35458, 0.90834, 0.13383),
    vec3(0.04823, 0.01566, 0.83777)
  );
  const mat3 ACESOutputMat = mat3(
    vec3(1.60475, -0.10208, -0.00327),
    vec3(-0.53108, 1.10813, -0.07276),
    vec3(-0.07367, -0.00605, 1.07602)
  );
  color *= 1.0 / 0.6;
  color = ACESInputMat * color;
  color = RRTAndODTFit(color);
  color = ACESOutputMat * color;
  return clamp(color, 0.0, 1.0);
}

vec3 sRGBTransferOETF(vec3 value) {
  return mix(pow(value, vec3(0.41666)) * 1.055 - vec3(0.055), value * 12.92, vec3(lessThanEqual(value, vec3(0.0031308))));
}

void main() {
  gl_FragColor = vec4(sRGBTransferOETF(ACESFilmicToneMapping(vColor)), 1.0);
}
`;
