'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { buildFieldAttributes, FIELD, wrap, WAVE_PERIOD } from '@/lib/sceneField';
import { useSceneStore, type ScenePalette } from '@/store/useSceneStore';
import { FIELD_FRAGMENT, FIELD_VERTEX } from './fieldShader';
import { PARAM_KEYS, SCENE_MODES } from './modes';

const createUniforms = () => ({
  uWave: { value: 0 },
  uFlow: { value: 0 },
  uHeat: { value: 0 },
  uPointer: { value: new THREE.Vector2() },
  uRadius: { value: 1 },
  uAmplitude: { value: 0 },
  uFrequency: { value: 0 },
  uForce: { value: 0 },
  uPulse: { value: 0 },
  uGlowScale: { value: 1 },
  uSize: { value: 1 },
  uScale: { value: 1 },
  uBase: { value: new THREE.Color() },
  uInk: { value: new THREE.Color() },
});
type FieldUniforms = ReturnType<typeof createUniforms>;

export function DataGrid({ still }: { still: boolean }) {
  // Uploaded once: the points never move on the CPU. Everything else is a uniform.
  const attributes = useMemo(() => buildFieldAttributes(), []);
  const uniforms = useMemo(() => createUniforms(), []);

  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

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
    const material = materialRef.current;
    if (!group || !material) return;
    // Written through the scene graph ref, so the uniforms stay out of React's data flow.
    const u = material.uniforms as FieldUniforms;

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
      o.bg.set(palette.paper);
      o.dim.set(palette.dot);
      o.ink.set(palette.ink);
      u.uInk.value.copy(o.ink);
      s.palette = palette;
    }

    // Camera: mode pose + pointer parallax. Not on touch, where the scene would slide under the finger.
    const camera = state.camera;
    const camEase = still ? 1 : 1 - Math.exp(-dt * 2.5);
    const parallax = pointer.touch ? 0 : 1;
    camera.position.x += (p.camX + pointer.x * 0.8 * parallax - camera.position.x) * camEase;
    camera.position.y += (p.camY + pointer.y * 0.4 * parallax - camera.position.y) * camEase;
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
      // Touch input is sparser and jitterier than a mouse, so it is followed more softly.
      const follow = still || pointer.snap ? 1 : 1 - Math.exp(-dt * (pointer.touch ? 4 : 7));
      s.px += (hit.x - s.px) * follow;
      s.pz += (hit.z - s.pz) * follow;
      pointer.snap = false;
    }
    s.heat += ((pointer.active && hit ? 1 : 0) - s.heat) * ease;

    // The frame's whole cost: a dozen numbers handed to the shader, whatever the point count.
    const presence = Math.min(1, p.presence * palette.presenceScale);
    u.uWave.value = wrap(s.wave, WAVE_PERIOD);
    u.uFlow.value = wrap(s.flow, FIELD.packetSpan);
    u.uHeat.value = s.heat;
    u.uPointer.value.set(s.px, s.pz);
    u.uRadius.value = p.radius;
    u.uAmplitude.value = p.amplitude;
    u.uFrequency.value = p.frequency;
    u.uForce.value = p.force;
    u.uPulse.value = p.pulse;
    u.uGlowScale.value = 0.35 + 0.65 * presence;
    u.uBase.value.copy(o.bg).lerp(o.dim, presence);
    u.uSize.value = palette.pointSize * state.viewport.dpr;
    u.uScale.value = state.size.height * 0.5;
  });

  return (
    <group ref={groupRef}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[attributes.position, 3]} />
          <bufferAttribute attach="attributes-aCell" args={[attributes.cell, 2]} />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          args={[{ uniforms, vertexShader: FIELD_VERTEX, fragmentShader: FIELD_FRAGMENT }]}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
