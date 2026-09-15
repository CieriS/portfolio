import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { getUiMessages } from '@/lib/portfolio';
import { routing } from './routing';

// UI strings come from the same data/portfolio.json that feeds the views: one source of truth.
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    // Explicit and matching the client provider, so server and client never diverge.
    timeZone: 'UTC',
    messages: getUiMessages(locale),
  };
});
