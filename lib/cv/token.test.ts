import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { passwordMatches, signLink, verifyLink } from './token';

const SECRET = 'a-test-secret-that-is-long-enough-123456';
const NOW = Date.parse('2026-10-10T12:00:00Z');
const claims = { locale: 'it' as const, exp: NOW + 60_000 };

/** A link in the format mailed before #65: the same signature, plus the address in the payload. */
function oldFormatLink(email: string, secret = SECRET, exp = claims.exp): string {
  const payload = Buffer.from(JSON.stringify({ email, locale: claims.locale, exp })).toString('base64url');
  return `${payload}.${createHmac('sha256', secret).update(payload).digest('base64url')}`;
}

describe('signLink / verifyLink', () => {
  it('round-trips the claims of a fresh token', () => {
    expect(verifyLink(signLink(claims, SECRET), SECRET, NOW)).toEqual(claims);
  });

  it('rejects an expired token, including at the exact expiry instant', () => {
    const token = signLink(claims, SECRET);
    expect(verifyLink(token, SECRET, claims.exp)).toBeNull();
    expect(verifyLink(token, SECRET, claims.exp + 1)).toBeNull();
  });

  it('rejects a token signed with another secret', () => {
    expect(verifyLink(signLink(claims, `${SECRET}-other`), SECRET, NOW)).toBeNull();
  });

  it('rejects a payload changed after signing (a longer expiry)', () => {
    const [, signature] = signLink(claims, SECRET).split('.');
    const forged = Buffer.from(JSON.stringify({ ...claims, exp: NOW + 10 ** 12 })).toString('base64url');
    expect(verifyLink(`${forged}.${signature}`, SECRET, NOW)).toBeNull();
  });

  it.each(['', '.', 'abc', 'a.b.c', 'onlypayload.', '.onlysignature'])('rejects the malformed token %j', (token) => {
    expect(verifyLink(token, SECRET, NOW)).toBeNull();
  });

  it('rejects correctly signed claims of the wrong shape', () => {
    expect(verifyLink(signLink({ ...claims, locale: 'pt' } as never, SECRET), SECRET, NOW)).toBeNull();
    expect(verifyLink(signLink({ exp: NOW + 1000 } as never, SECRET), SECRET, NOW)).toBeNull();
  });

  it('puts only the language and the expiry in the payload, whatever the caller passes', () => {
    const token = signLink({ ...claims, email: 'visitor@example.com' } as never, SECRET);
    const payload = Buffer.from(token.split('.')[0]!, 'base64url').toString('utf8');
    expect(JSON.parse(payload)).toEqual({ locale: 'it', exp: claims.exp });
    expect(token).not.toContain('visitor');
  });
});

describe('links mailed before #65 (the address in the payload)', () => {
  it('still open until they expire, and the address is not returned', () => {
    expect(verifyLink(oldFormatLink('visitor@example.com'), SECRET, NOW)).toEqual(claims);
    expect(verifyLink(oldFormatLink('visitor@example.com'), SECRET, claims.exp)).toBeNull();
  });

  it('are refused when tampered with or signed with another secret', () => {
    const [, signature] = oldFormatLink('visitor@example.com').split('.');
    const forged = Buffer.from(JSON.stringify({ email: 'other@example.com', locale: 'it', exp: claims.exp })).toString(
      'base64url',
    );
    expect(verifyLink(`${forged}.${signature}`, SECRET, NOW)).toBeNull();
    expect(verifyLink(oldFormatLink('visitor@example.com', `${SECRET}-other`), SECRET, NOW)).toBeNull();
  });
});

describe('passwordMatches', () => {
  it('accepts the exact password only', () => {
    expect(passwordMatches('correct horse battery', 'correct horse battery')).toBe(true);
    expect(passwordMatches('correct horse batter', 'correct horse battery')).toBe(false);
    expect(passwordMatches('Correct horse battery', 'correct horse battery')).toBe(false);
    expect(passwordMatches('', 'correct horse battery')).toBe(false);
  });
});
