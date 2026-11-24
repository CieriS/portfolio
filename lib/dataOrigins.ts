/**
 * Origins the browser may fetch case-study data from (lib/liveResults.ts); `next.config.ts`
 * puts them in `connect-src`. A module of its own so the config does not load the parsers.
 */
export const DATA_ORIGINS = ['https://cieris.github.io'] as const;
