/**
 * The language cookie (#130). Only an explicit choice in the language menu writes it; a plain
 * visit never does, so the site sets no cookie unless the visitor asks for one. The middleware
 * still reads it, to send `/` to the language the visitor picked.
 *
 * Framework-free on purpose, like `lib/routes.ts`: the proxy imports it with a relative path.
 */

export const LOCALE_COOKIE = 'NEXT_LOCALE';

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** The `document.cookie` assignment that remembers an explicit language choice. */
export function localeCookie(locale: string): string {
  return `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax; secure`;
}

const isLocaleCookie = (cookie: string) => cookie.trimStart().startsWith(`${LOCALE_COOKIE}=`);

/**
 * Removes the language cookie that next-intl's middleware writes on a plain visit (when the
 * address language differs from the browser's), keeping every other cookie. `localeCookie: false`
 * in the routing would also stop the middleware from *reading* the explicit choice, so the
 * write is dropped here instead. Mutates `headers`.
 */
export function dropLocaleCookie(headers: Headers): void {
  const kept = headers.getSetCookie().filter((cookie) => !isLocaleCookie(cookie));
  headers.delete('set-cookie');
  for (const cookie of kept) headers.append('set-cookie', cookie);

  // Next mirrors response cookies here, comma-joined, for the render of the same request.
  const mirrored = headers.get('x-middleware-set-cookie');
  if (mirrored !== null) {
    const rest = mirrored.split(',').filter((cookie) => cookie.trim() && !isLocaleCookie(cookie));
    if (rest.length) headers.set('x-middleware-set-cookie', rest.join(','));
    else headers.delete('x-middleware-set-cookie');
  }
}
