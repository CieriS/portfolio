import { describe, expect, it } from 'vitest';
import { ALIAS_HOSTS, aliasRedirects } from './aliases';

describe('aliasRedirects', () => {
  it('sends every other production host to the same path on the site origin, permanently', () => {
    const rules = aliasRedirects('https://cierisamuele.vercel.app');
    expect(rules).toHaveLength(ALIAS_HOSTS.length - 1);
    for (const rule of rules) {
      expect(rule.source).toBe('/:path*');
      expect(rule.destination).toBe('https://cierisamuele.vercel.app/:path*');
      expect(rule.permanent).toBe(true);
    }
  });

  it.each(ALIAS_HOSTS)('serves only %s when SITE_URL names it', (site) => {
    const redirected = aliasRedirects(`https://${site}`).map((rule) => rule.has[0]!.value);
    const expected = ALIAS_HOSTS.filter((host) => host !== site).map((host) => `^${host.replace(/\./g, '\\.')}$`);
    expect(redirected).toEqual(expected);
  });

  it('matches each host exactly, dots included', () => {
    const [rule] = aliasRedirects('https://example.com', ['cieri.vercel.app']);
    const pattern = new RegExp(rule!.has[0]!.value);
    expect(pattern.test('cieri.vercel.app')).toBe(true);
    expect(pattern.test('cieriXvercel.app')).toBe(false);
    expect(pattern.test('cieri.vercel.app.evil.com')).toBe(false);
    expect(pattern.test('cieri-git-branch-cieris-projects.vercel.app')).toBe(false);
  });

  it('never redirects the site to itself', () => {
    expect(aliasRedirects('https://cieri.vercel.app', ['cieri.vercel.app', 'samuelecieri.vercel.app'])).toEqual([
      expect.objectContaining({ has: [{ type: 'host', value: '^samuelecieri\\.vercel\\.app$' }] }),
    ]);
  });

  it('drops a trailing slash or path from the site URL', () => {
    const [rule] = aliasRedirects('https://cierisamuele.vercel.app/en/', ['cieri.vercel.app']);
    expect(rule!.destination).toBe('https://cierisamuele.vercel.app/:path*');
  });

  it('leaves preview, local and test hosts alone', () => {
    const hosts = aliasRedirects('https://cierisamuele.vercel.app').map((rule) => new RegExp(rule.has[0]!.value));
    for (const host of ['localhost:3210', '127.0.0.1:3000', 'portfolio-abc123-cieris-projects.vercel.app']) {
      expect(hosts.some((pattern) => pattern.test(host))).toBe(false);
    }
  });
});
