import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { localizedPath } from './lib/routes';

const intl = createMiddleware(routing);

/**
 * Locale prefix from the browser language (next-intl), then the view segment in that
 * language: `/systems/ariaer` → `/it/systems/ariaer` → `/it/sistemi/ariaer` for an Italian
 * reader. A link written in one language therefore works in every other.
 */
export default function proxy(request: NextRequest) {
  const target = localizedPath(request.nextUrl.pathname);
  if (target) {
    const url = request.nextUrl.clone();
    url.pathname = target;
    return NextResponse.redirect(url, 308);
  }
  return intl(request);
}

export const config = {
  // Skip Next internals, Vercel internals and any path with a file extension.
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
