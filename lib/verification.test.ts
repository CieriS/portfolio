import { describe, expect, it } from 'vitest';
import { googleVerificationToken } from './verification';

const TOKEN = 'aB3_x-9ZkQ';

describe('googleVerificationToken', () => {
  it('is undefined when the variable is missing or blank', () => {
    expect(googleVerificationToken(undefined)).toBeUndefined();
    expect(googleVerificationToken('')).toBeUndefined();
    expect(googleVerificationToken('   ')).toBeUndefined();
  });

  it('returns a bare token, trimmed', () => {
    expect(googleVerificationToken(TOKEN)).toBe(TOKEN);
    expect(googleVerificationToken(`  ${TOKEN}\n`)).toBe(TOKEN);
  });

  it('extracts the token from the tag Search Console gives out', () => {
    expect(googleVerificationToken(`<meta name="google-site-verification" content="${TOKEN}" />`)).toBe(TOKEN);
    expect(googleVerificationToken(`<meta name='google-site-verification' content='${TOKEN}'>`)).toBe(TOKEN);
    expect(googleVerificationToken(`<META content="${TOKEN}" name="google-site-verification"/>`)).toBe(TOKEN);
  });

  it('throws on anything that is neither a token nor a tag', () => {
    expect(() => googleVerificationToken('not a token')).toThrow(/GOOGLE_SITE_VERIFICATION/);
    expect(() => googleVerificationToken(`content="${TOKEN}"`)).toThrow();
    expect(() => googleVerificationToken('<meta name="google-site-verification" />')).toThrow();
    expect(() => googleVerificationToken(`<meta content="${TOKEN}" /><script>`)).toThrow();
    expect(() => googleVerificationToken('<meta content="has space" />')).toThrow();
  });
});
