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
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Still: the system asks for reduced motion, or the visitor paused the scene (#142).
    const isStill = () => reduced || useSceneStore.getState().paused;
    const monitor = createFpsMonitor();
    const size = { width: 1, height: 1, dpr: Math.min(window.devicePixelRatio, MAX_DPR) };
    let last: number | null = null;
    let frame = 0;

    const draw = (now: number) => {
      const delta = last === null ? 0 : (now - last) / 1000;
      last = now;
      const { mode, palette, pointer } = useSceneStore.getState();
      renderer.draw(stepSim(sim, { mode, palette, pointer, delta, still: isStill(), ...size }));
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

    let running = false;
    const loop = (now: number) => {
      if (isStill()) {
        running = false;
        return;
      }
      draw(now);
      const verdict = monitor(now);
      if (verdict === 'decline') setDpr(1);
      if (verdict === 'incline') setDpr(Math.min(window.devicePixelRatio, MAX_DPR));
      frame = requestAnimationFrame(loop);
    };

    // Still: repaint only when the view, the palette or the size change.
    const paint = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    };

    // A store change while still repaints once; leaving the pause restarts the loop with a zero
    // step, so the field resumes where it stopped instead of jumping by the paused time.
    const wake = () => {
      if (isStill()) {
        running = false;
        paint();
      } else if (!running) {
        running = true;
        last = null;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(loop);
      }
    };

    resize();
    const observer = new ResizeObserver(() => {
      resize();
      if (isStill()) paint();
    });
    observer.observe(canvas);
    const unsubscribe = useSceneStore.subscribe(wake);
    frame = requestAnimationFrame((now) => {
      if (isStill()) draw(now);
      else {
        running = true;
        loop(now);
      }
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
