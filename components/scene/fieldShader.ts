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

/** Flat square points; tone mapping and output colour space as in three's built-in materials. */
export const FIELD_FRAGMENT = /* glsl */ `
varying vec3 vColor;

void main() {
  gl_FragColor = vec4(vColor, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
