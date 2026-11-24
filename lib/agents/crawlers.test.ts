import { describe, expect, it } from 'vitest';
import { AI_CRAWLERS, buildRobotsRules, CRAWLER_GROUPS, type Crawler } from './crawlers';

const agentsOf = (rule: { userAgent: string | string[] }) => [rule.userAgent].flat();

describe('robots rules for AI crawlers (#175)', () => {
  const rules = buildRobotsRules(true);

  it('allows every listed crawler, one rule per group, then everyone else', () => {
    expect(rules).toHaveLength(CRAWLER_GROUPS.length + 1);
    for (const crawler of AI_CRAWLERS) {
      const rule = rules.find((candidate) => agentsOf(candidate).includes(crawler.userAgent));
      expect(rule, crawler.userAgent).toMatchObject({ allow: '/' });
    }
    expect(rules.at(-1)).toEqual({ userAgent: '*', allow: '/', disallow: '/api/' });
  });

  it('closes /api/ to every agent', () => {
    for (const rule of rules) expect(rule.disallow).toBe('/api/');
  });

  it('lists no user agent twice', () => {
    const names = AI_CRAWLERS.map((crawler) => crawler.userAgent.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  it('a crawler set to disallow gets its own Disallow: / rule', () => {
    const list: Crawler[] = [
      { userAgent: 'GPTBot', group: 'training', allow: false },
      { userAgent: 'ClaudeBot', group: 'training', allow: true },
    ];
    expect(buildRobotsRules(true, list)).toEqual([
      { userAgent: ['ClaudeBot'], allow: '/', disallow: '/api/' },
      { userAgent: ['GPTBot'], disallow: '/' },
      { userAgent: '*', allow: '/', disallow: '/api/' },
    ]);
  });

  it('closes everything on previews', () => {
    expect(buildRobotsRules(false)).toEqual([{ userAgent: '*', disallow: '/' }]);
  });
});
