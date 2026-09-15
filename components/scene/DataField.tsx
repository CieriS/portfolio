'use client';

import { PerformanceMonitor } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { DataGrid } from './DataGrid';

const MAX_DPR = 1.75;

// Loaded only on the client through next/dynamic: three.js never touches the server bundle.
export default function DataField() {
  const [still] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio, MAX_DPR));
  const [ready, setReady] = useState(false);

  return (
    <Canvas
      className={cn('transition-opacity duration-1000', ready ? 'opacity-100' : 'opacity-0')}
      dpr={dpr}
      frameloop={still ? 'demand' : 'always'}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 5.2, 10.5], fov: 40, near: 0.1, far: 80 }}
      onCreated={() => setReady(true)}
    >
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(Math.min(window.devicePixelRatio, MAX_DPR))}
      />
      <DataGrid still={still} />
    </Canvas>
  );
}
