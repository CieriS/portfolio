import { useCallback, useSyncExternalStore } from 'react';

const noopSubscribe = () => () => {};

/** `false` during SSR and hydration, `true` afterwards. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/** Wall clock quantized to `stepMs`; `null` on the server to keep hydration deterministic. */
export function useNow(stepMs: number): number | null {
  const subscribe = useCallback(
    (notify: () => void) => {
      const id = window.setInterval(notify, stepMs);
      return () => window.clearInterval(id);
    },
    [stepMs],
  );

  return useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / stepMs) * stepMs,
    () => null,
  );
}
