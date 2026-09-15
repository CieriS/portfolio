'use client';

import { NextIntlClientProvider } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import type { Locale } from '@/i18n/routing';
import type { PortfolioBundle, PortfolioView } from '@/lib/portfolio';
import { documentTitle, pathFor } from '@/lib/views';
import { markBooted, useViewStoreApi } from '@/store/viewStore';
import { AppShell } from './AppShell';

type AppRootProps = PortfolioBundle & { initialLocale: Locale };

export function AppRoot({ shared, contents, initialLocale }: AppRootProps) {
  const store = useViewStoreApi();
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const content = contents[locale];
  const data = useMemo<PortfolioView>(() => ({ locale, shared, content }), [locale, shared, content]);

  // Client-side language swap: no navigation, so the root layout, the canvas and the active view all survive.
  const changeLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      const active = store.getState().active;
      markBooted();
      setLocale(next);
      window.history.replaceState(null, '', pathFor(next, active));
      document.documentElement.lang = next;
      document.title = documentTitle(contents[next].ui.meta, active);
      document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax`;
    },
    [locale, contents, store],
  );

  return (
    <NextIntlClientProvider locale={locale} messages={content.ui} timeZone="UTC">
      <AppShell data={data} locale={locale} onLocaleChange={changeLocale} />
    </NextIntlClientProvider>
  );
}
