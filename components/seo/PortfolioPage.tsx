import { AppRoot } from '@/components/shell/AppRoot';
import type { Locale } from '@/i18n/routing';
import { getPortfolioBundle } from '@/lib/portfolio';
import { buildJsonLd } from '@/lib/structuredData';
import type { ViewId } from '@/lib/views';
import { ViewStoreProvider } from '@/store/viewStore';

/** Server entry shared by every view URL: structured data + the SPA starting on the requested view. */
export function PortfolioPage({ locale, view }: { locale: Locale; view: ViewId }) {
  const json = JSON.stringify(buildJsonLd(locale, view)).replace(/</g, '\\u003c');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
      <ViewStoreProvider initialView={view}>
        <AppRoot {...getPortfolioBundle()} initialLocale={locale} />
      </ViewStoreProvider>
    </>
  );
}
