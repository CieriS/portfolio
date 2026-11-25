import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { dropLocaleCookie } from './lib/localeCookie';
import { localizedPath } from './lib/routes';

const intl = createMiddleware(routing);

/**
 * Locale prefix from the browser language (next-intl), then the view segment in that
 * language: `/systems/ariaer` → `/it/systems/ariaer` → `/it/sistemi/ariaer` for an Italian
 * reader. A link written in one language therefore works in every other.
 *
 * A plain visit sets no cookie (#130): the language cookie next-intl writes when the address
 * language differs from the browser's is dropped; only an explicit choice in the menu writes it.
 */
export default function proxy(request: NextRequest) {
  const target = localizedPath(request.nextUrl.pathname);
  if (target) {
    const url = request.nextUrl.clone();
    url.pathname = target;
    return NextResponse.redirect(url, 308);
  }
  const response = intl(request);
  dropLocaleCookie(response.headers);
  return response;
}

export const config = {
  // Skip the API, the internal routes of the agent files, Next and Vercel internals and any path
  // with a file extension (`/llms.txt`, `/en/identity.md`): none of them is localized.
  matcher: '/((?!api|agents|_next|_vercel|.*\\..*).*)',
};
