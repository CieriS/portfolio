import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { isLocale, type Locale } from '@/lib/routes';

/**
 * Stateless download links. The site has no database, so the link carries its own claims —
 * in which language, until when — signed with HMAC-SHA256. Without the secret a token can be
 * neither forged nor extended, and a tampered one fails the signature check.
 *
 * The claims are signed, not encrypted, so anyone who sees the URL can read them: they hold
 * nothing personal (#65). Links sent before that also carried the requester's email; their
 * signature is still valid, so they keep working until they expire, and the address is
 * dropped when they are read.
 */
export type LinkClaims = { locale: Locale; exp: number };

export function signLink(claims: LinkClaims, secret: string): string {
  // Only the two known fields, so nothing else a caller passes can end up readable in the URL.
  const payload = Buffer.from(JSON.stringify({ locale: claims.locale, exp: claims.exp })).toString('base64url');
  return `${payload}.${mac(payload, secret)}`;
}

/** The claims of a genuine, unexpired token; `null` for anything else, whatever the reason. */
export function verifyLink(token: string, secret: string, now: number): LinkClaims | null {
  const [payload, signature, ...rest] = token.split('.');
  if (!payload || !signature || rest.length > 0) return null;
  if (!sameBytes(signature, mac(payload, secret))) return null;

  const claims = parseClaims(Buffer.from(payload, 'base64url').toString('utf8'));
  return claims && claims.exp > now ? claims : null;
}

/**
 * Constant-time comparison of a typed password with the configured one. Both sides are
 * hashed first so the comparison runs on equal lengths and leaks nothing about the length.
 */
export function passwordMatches(given: string, expected: string): boolean {
  return timingSafeEqual(sha256(given), sha256(expected));
}

function mac(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function sha256(text: string): Buffer {
  return createHash('sha256').update(text, 'utf8').digest();
}

function sameBytes(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function parseClaims(json: string): LinkClaims | null {
  try {
    const value: unknown = JSON.parse(json);
    if (typeof value !== 'object' || value === null) return null;
    const { locale, exp } = value as Record<string, unknown>;
    if (typeof exp !== 'number' || typeof locale !== 'string' || !isLocale(locale)) return null;
    return { locale, exp };
  } catch {
    return null;
  }
}
