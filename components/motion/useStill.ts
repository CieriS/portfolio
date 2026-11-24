import { useReducedMotion } from 'framer-motion';
import { useSceneStore } from '@/store/useSceneStore';

/** True when nothing decorative should move: the system asks for reduced motion or the visitor paused (#142, #143). */
export function useStill(): boolean {
  const reduced = useReducedMotion();
  const paused = useSceneStore((state) => state.paused);
  return Boolean(reduced) || paused;
}
