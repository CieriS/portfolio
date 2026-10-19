'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { createFpsMonitor } from '@/lib/sceneMonitor';
import { createSim, stepSim } from '@/lib/sceneSim';
import { useSceneStore } from '@/store/useSceneStore';
import { createFieldRenderer } from './fieldRenderer';

const MAX_DPR = 1.75;

// Loaded only on the client through next/dynamic, after the page is interactive.
export default function DataField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current!;
    // Throws without WebGL: the error reaches SceneErrorBoundary, which drops the canvas.
    const renderer = createFieldRenderer(canvas);
    const sim = createSim();
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const monitor = createFpsMonitor();
    const size = { width: 1, height: 1, dpr: Math.min(window.devicePixelRatio, MAX_DPR) };
    let last: number | null = null;
    let frame = 0;

    const draw = (now: number) => {
      const delta = last === null ? 0 : (now - last) / 1000;
      last = now;
      const { mode, palette, pointer } = useSceneStore.getState();
      renderer.draw(stepSim(sim, { mode, palette, pointer, delta, still, ...size }));
    };

    const resize = () => {
      size.width = Math.max(1, canvas.clientWidth);
      size.height = Math.max(1, canvas.clientHeight);
      renderer.resize(size.width, size.height, size.dpr);
    };

    const setDpr = (dpr: number) => {
      if (dpr === size.dpr) return;
      size.dpr = dpr;
      resize();
    };

    const loop = (now: number) => {
      draw(now);
      const verdict = monitor(now);
      if (verdict === 'decline') setDpr(1);
      if (verdict === 'incline') setDpr(Math.min(window.devicePixelRatio, MAX_DPR));
      frame = requestAnimationFrame(loop);
    };

    // Reduced motion: repaint only when the view, the palette or the size change.
    const paint = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    };

    resize();
    const observer = new ResizeObserver(() => {
      resize();
      if (still) paint();
    });
    observer.observe(canvas);
    const unsubscribe = still ? useSceneStore.subscribe(paint) : () => {};
    frame = requestAnimationFrame((now) => {
      if (still) draw(now);
      else loop(now);
      setReady(true);
    });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      unsubscribe();
      // No forced context loss: in development React mounts effects twice on the same canvas,
      // and a lost context cannot be taken back. The GPU objects go with the canvas.
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn('block h-full w-full transition-opacity duration-1000', ready ? 'opacity-100' : 'opacity-0')}
    />
  );
}
