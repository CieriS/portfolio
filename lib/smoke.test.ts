import { describe, expect, it } from 'vitest';
import { ALIAS_HOSTS } from './aliases';
import { deployExpectations, parseDeployEnvironment } from './smoke';

describe('issue #82: parseDeployEnvironment', () => {
  it('accepts the GitHub deployment names and the VERCEL_ENV values', () => {
    expect(parseDeployEnvironment('Production')).toBe('production');
    expect(parseDeployEnvironment('Preview')).toBe('preview');
    expect(parseDeployEnvironment(' production ')).toBe('production');
    expect(parseDeployEnvironment('preview')).toBe('preview');
  });

  it('rejects anything else instead of guessing', () => {
    // A custom Vercel environment or a typo must not silently run the preview checks.
    for (const value of [undefined, '', 'development', 'staging', 'prod']) {
      expect(() => parseDeployEnvironment(value)).toThrow(/Unknown deployment environment/);
    }
  });
});

describe('issue #82: deployExpectations', () => {
  const siteUrl = 'https://cieri.vercel.app';

  it('wants production indexable, with the CV configured and every other alias redirecting', () => {
    const expected = deployExpectations('production', siteUrl);
    expect(expected.indexable).toBe(true);
    expect(expected.cvForgedTokenStatuses).toEqual([403]);
    expect(expected.redirectingHosts).toEqual(['cierisamuele.vercel.app', 'samuelecieri.vercel.app']);
  });

  it('wants previews out of search engines, tolerates an unconfigured CV and checks no aliases', () => {
    const expected = deployExpectations('preview', siteUrl);
    expect(expected.indexable).toBe(false);
    expect(expected.cvForgedTokenStatuses).toEqual([403, 503]);
    expect(expected.redirectingHosts).toEqual([]);
  });

  it('follows SITE_URL when it moves to another alias', () => {
    const expected = deployExpectations('production', 'https://samuelecieri.vercel.app/');
    expect(expected.redirectingHosts).toEqual(['cieri.vercel.app', 'cierisamuele.vercel.app']);
  });

  it('keeps every alias redirecting once SITE_URL is a personal domain', () => {
    expect(deployExpectations('production', 'https://example.dev').redirectingHosts).toEqual([...ALIAS_HOSTS]);
  });

  it('never accepts a server error from the CV endpoint', () => {
    for (const environment of ['production', 'preview'] as const) {
      expect(deployExpectations(environment, siteUrl).cvForgedTokenStatuses).not.toContain(500);
    }
  });
});
