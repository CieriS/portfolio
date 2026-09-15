'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useSceneStore, type ScenePalette } from '@/store/useSceneStore';
import { PARAM_KEYS, SCENE_MODES } from './modes';

const COLS = 96;
const ROWS = 56;
const GAP = 0.26;
const LANE_EVERY = 5; // every Nth row carries travelling data packets
const PACKET_SPAN = 48;
const PACKET_TAIL = 12;

function buildGrid(): Float32Array {
  const grid = new Float32Array(COLS * ROWS * 2);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c;
      grid[i * 2] = (c - (COLS - 1) / 2) * GAP;
      grid[i * 2 + 1] = (r - (ROWS - 1) / 2) * GAP;
    }
  }
  return grid;
}

export function DataGrid({ still }: { still: boolean }) {
  const grid = useMemo(() => buildGrid(), []);
  const buffers = useMemo(
    () => ({
      position: new Float32Array(COLS * ROWS * 3),
      color: new Float32Array(COLS * ROWS * 3),
    }),
    [],
  );

  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // Mutable simulation state: never part of React state.
  const sim = useRef({
    params: { ...SCENE_MODES.hero },
    wave: 0,
    flow: 0,
    heat: 0,
    px: 0,
    pz: 0,
    palette: null as ScenePalette | null,
  });
  const scratch = useRef({
    raycaster: new THREE.Raycaster(),
    ndc: new THREE.Vector2(),
    plane: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    hit: new THREE.Vector3(),
    bg: new THREE.Color(),
    dim: new THREE.Color(),
    ink: new THREE.Color(),
  });

  // With frameloop="demand" (reduced motion) repaint only when mode or palette change.
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => useSceneStore.subscribe(() => invalidate()), [invalidate]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    const points = pointsRef.current;
    if (!group || !points) return;

    const s = sim.current;
    const o = scratch.current;
    const { mode, palette, pointer } = useSceneStore.getState();
    const target = SCENE_MODES[mode];
    const dt = Math.min(delta, 1 / 20);
    const ease = still ? 1 : 1 - Math.exp(-dt * 2);
    const p = s.params;

    for (const key of PARAM_KEYS) p[key] += (target[key] - p[key]) * ease;
    if (!still) {
      s.wave += dt * p.speed;
      s.flow += dt * p.flow;
    }

    if (palette !== s.palette) {
      o.bg.set(palette.bg);
      o.dim.set(palette.dim);
      o.ink.set(palette.ink);
      s.palette = palette;
    }

    // Camera: mode pose + pointer parallax.
    const camera = state.camera;
    const camEase = still ? 1 : 1 - Math.exp(-dt * 2.5);
    camera.position.x += (p.camX + pointer.x * 0.8 - camera.position.x) * camEase;
    camera.position.y += (p.camY + pointer.y * 0.4 - camera.position.y) * camEase;
    camera.position.z += (p.camZ - camera.position.z) * camEase;
    camera.lookAt(0, 0, 0);
    group.rotation.y = p.rotY;
    group.updateMatrixWorld();

    // Project the pointer onto the field plane, in grid-local space.
    o.ndc.set(pointer.x, pointer.y);
    o.raycaster.setFromCamera(o.ndc, camera);
    const hit = o.raycaster.ray.intersectPlane(o.plane, o.hit);
    if (hit) {
      group.worldToLocal(hit);
      const follow = still ? 1 : 1 - Math.exp(-dt * 7);
      s.px += (hit.x - s.px) * follow;
      s.pz += (hit.z - s.pz) * follow;
    }
    s.heat += ((pointer.active && hit ? 1 : 0) - s.heat) * ease;

    // Write through the scene graph ref so the buffers stay out of React's data flow.
    const P = points.geometry.attributes.position.array as Float32Array;
    const C = points.geometry.attributes.color.array as Float32Array;
    const r2 = p.radius * p.radius;
    const presence = p.presence;
    const glowScale = 0.35 + 0.65 * presence;
    const baseR = o.bg.r + (o.dim.r - o.bg.r) * presence;
    const baseG = o.bg.g + (o.dim.g - o.bg.g) * presence;
    const baseB = o.bg.b + (o.dim.b - o.bg.b) * presence;

    for (let r = 0; r < ROWS; r++) {
      const lane = r % LANE_EVERY === 0 ? r / LANE_EVERY : -1;
      const forward = lane % 2 === 0;
      const head = s.flow + lane * 17.3;

      for (let c = 0; c < COLS; c++) {
        const i = r * COLS + c;
        const x = grid[i * 2];
        const z = grid[i * 2 + 1];

        const dx = x - s.px;
        const dz = z - s.pz;
        const d2 = dx * dx + dz * dz;
        const influence = s.heat * Math.exp(-d2 / r2);

        const y =
          p.amplitude * Math.sin(x * p.frequency + s.wave) * Math.cos(z * p.frequency * 0.8 - s.wave * 0.7) +
          p.amplitude * 0.35 * Math.sin((x + z) * p.frequency * 0.5 + s.wave * 0.45) +
          influence * (p.force + 0.22 * Math.sin(Math.sqrt(d2) * 3.2 - s.wave * 4));

        P[i * 3] = x;
        P[i * 3 + 1] = y;
        P[i * 3 + 2] = z;

        let pulse = 0;
        if (lane >= 0) {
          const cell = forward ? c : COLS - 1 - c;
          const u = (((head - cell) % PACKET_SPAN) + PACKET_SPAN) % PACKET_SPAN;
          if (u < PACKET_TAIL) {
            const k = 1 - u / PACKET_TAIL;
            pulse = k * k * p.pulse;
          }
        }

        const glow = Math.min(1, influence * 1.3 + Math.max(0, y) * 0.12 + pulse) * glowScale;
        C[i * 3] = baseR + (o.ink.r - baseR) * glow;
        C[i * 3 + 1] = baseG + (o.ink.g - baseG) * glow;
        C[i * 3 + 2] = baseB + (o.ink.b - baseB) * glow;
      }
    }

    points.geometry.attributes.position.needsUpdate = true;
    points.geometry.attributes.color.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[buffers.position, 3]} usage={THREE.DynamicDrawUsage} />
          <bufferAttribute attach="attributes-color" args={[buffers.color, 3]} usage={THREE.DynamicDrawUsage} />
        </bufferGeometry>
        <pointsMaterial size={0.034} sizeAttenuation vertexColors depthWrite={false} />
      </points>
    </group>
  );
}
