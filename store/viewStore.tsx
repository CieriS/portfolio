'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { createStore, useStore, type StoreApi } from 'zustand';
import { VIEW_IDS, type ViewId } from '@/lib/views';

type ViewState = {
  active: ViewId;
  setView: (id: ViewId) => void;
  step: (delta: 1 | -1) => void;
};

export type ViewStore = StoreApi<ViewState>;

export function createViewStore(initial: ViewId): ViewStore {
  return createStore<ViewState>()((set, get) => ({
    active: initial,
    setView: (id) => {
      if (id !== get().active) set({ active: id });
    },
    step: (delta) => {
      const index = VIEW_IDS.indexOf(get().active);
      get().setView(VIEW_IDS[(index + delta + VIEW_IDS.length) % VIEW_IDS.length]);
    },
  }));
}

const ViewStoreContext = createContext<ViewStore | null>(null);

/**
 * One store per app instance. The initial view comes from the URL, so a module-level
 * singleton would leak state between concurrent server renders.
 */
export function ViewStoreProvider({ initialView, children }: { initialView: ViewId; children: ReactNode }) {
  const [store] = useState(() => createViewStore(initialView));
  return <ViewStoreContext.Provider value={store}>{children}</ViewStoreContext.Provider>;
}

export function useViewStoreApi(): ViewStore {
  const store = useContext(ViewStoreContext);
  if (!store) throw new Error('useViewStoreApi must be used inside <ViewStoreProvider>');
  return store;
}

export function useViewStore<T>(selector: (state: ViewState) => T): T {
  return useStore(useViewStoreApi(), selector);
}

/** Hands entrance animations over from the first-paint CSS intro to Framer Motion. */
export function markBooted() {
  document.documentElement.dataset.booted = '';
}
