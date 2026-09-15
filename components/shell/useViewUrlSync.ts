import { useEffect } from 'react';
import type { Locale } from '@/i18n/routing';
import type { UiMessages } from '@/lib/portfolio';
import { documentTitle, pathFor, viewFromPath } from '@/lib/views';
import { useSceneStore } from '@/store/useSceneStore';
import { markBooted, useViewStoreApi } from '@/store/viewStore';

/**
 * Keeps address bar, history, document title and scene mode in step with the active view.
 * Uses the native History API (integrated with the Next router): no navigation, no reload.
 */
export function useViewUrlSync(locale: Locale, meta: UiMessages['meta']) {
  const store = useViewStoreApi();

  useEffect(() => {
    useSceneStore.getState().setMode(store.getState().active);

    const unsubscribe = store.subscribe((state, previous) => {
      if (state.active === previous.active) return;
      markBooted();
      useSceneStore.getState().setMode(state.active);
      document.title = documentTitle(meta, state.active);
      const path = pathFor(locale, state.active);
      if (window.location.pathname !== path) window.history.pushState(null, '', path);
    });

    // Back/forward: read the view from the restored URL. Entries written before a language
    // switch still carry the other locale's slug, so realign the URL to the current language.
    const onPopState = () => {
      const view = viewFromPath(window.location.pathname);
      if (!view) return;
      store.getState().setView(view);
      const path = pathFor(locale, view);
      if (window.location.pathname !== path) window.history.replaceState(null, '', path);
    };

    window.addEventListener('popstate', onPopState);
    return () => {
      unsubscribe();
      window.removeEventListener('popstate', onPopState);
    };
  }, [store, locale, meta]);
}
