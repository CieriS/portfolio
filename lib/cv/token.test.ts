import { describe, expect, it } from 'vitest';
import { passwordMatches, signLink, verifyLink } from './token';

const SECRET = 'a-test-secret-that-is-long-enough-123456';
const NOW = Date.parse('2026-10-10T12:00:00Z');
const claims = { email: 'visitor@example.com', locale: 'it' as const, exp: NOW + 60_000 };

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
    expect(verifyLink(signLink({ ...claims, locale: 'es' } as never, SECRET), SECRET, NOW)).toBeNull();
    expect(verifyLink(signLink({ email: 'x@example.com' } as never, SECRET), SECRET, NOW)).toBeNull();
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
