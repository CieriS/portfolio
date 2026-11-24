import { describe, expect, it } from 'vitest';
import { dropLocaleCookie, LOCALE_COOKIE, localeCookie } from './localeCookie';

describe('localeCookie', () => {
  it('remembers the choice for a year, site-wide, Secure and SameSite=Lax', () => {
    const cookie = localeCookie('it');
    expect(cookie.startsWith(`${LOCALE_COOKIE}=it;`)).toBe(true);
    expect(cookie).toContain('path=/');
    expect(cookie).toContain('max-age=31536000');
    expect(cookie).toContain('samesite=lax');
    expect(cookie.split(';').map((part) => part.trim())).toContain('secure');
  });
});

describe('dropLocaleCookie', () => {
  it('removes the language cookie the middleware writes', () => {
    const headers = new Headers();
    headers.append('set-cookie', 'NEXT_LOCALE=it; Path=/; SameSite=lax');
    dropLocaleCookie(headers);
    expect(headers.getSetCookie()).toEqual([]);
    expect(headers.has('set-cookie')).toBe(false);
  });

  it('keeps every other cookie, in order', () => {
    const headers = new Headers();
    headers.append('set-cookie', 'a=1; Path=/');
    headers.append('set-cookie', 'NEXT_LOCALE=de; Path=/');
    headers.append('set-cookie', 'b=2; Path=/');
    dropLocaleCookie(headers);
    expect(headers.getSetCookie()).toEqual(['a=1; Path=/', 'b=2; Path=/']);
  });

  it('does not touch a cookie whose name only starts like the language cookie', () => {
    const headers = new Headers();
    headers.append('set-cookie', 'NEXT_LOCALE_OTHER=x; Path=/');
    dropLocaleCookie(headers);
    expect(headers.getSetCookie()).toEqual(['NEXT_LOCALE_OTHER=x; Path=/']);
  });

  it('cleans the mirror Next keeps for the render, removing it when empty', () => {
    const only = new Headers({ 'x-middleware-set-cookie': 'NEXT_LOCALE=fr; Path=/' });
    dropLocaleCookie(only);
    expect(only.has('x-middleware-set-cookie')).toBe(false);

    const mixed = new Headers({ 'x-middleware-set-cookie': 'a=1; Path=/,NEXT_LOCALE=fr; Path=/' });
    dropLocaleCookie(mixed);
    expect(mixed.get('x-middleware-set-cookie')).toBe('a=1; Path=/');
  });

  it('is a no-op on a response with no cookies', () => {
    const headers = new Headers({ 'content-type': 'text/html' });
    dropLocaleCookie(headers);
    expect([...headers.keys()]).toEqual(['content-type']);
  });
});
