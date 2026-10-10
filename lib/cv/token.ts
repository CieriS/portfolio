import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { isLocale, type Locale } from '@/lib/routes';

/**
 * Stateless download links. The site has no database, so the link carries its own claims —
 * who asked, in which language, until when — signed with HMAC-SHA256. Without the secret a
 * token can be neither forged nor extended, and a tampered one fails the signature check.
 */
export type LinkClaims = { email: string; locale: Locale; exp: number };

export function signLink(claims: LinkClaims, secret: string): string {
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
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
    const { email, locale, exp } = value as Record<string, unknown>;
    if (typeof email !== 'string' || typeof exp !== 'number' || typeof locale !== 'string' || !isLocale(locale)) return null;
    return { email, locale, exp };
  } catch {
    return null;
  }
}
