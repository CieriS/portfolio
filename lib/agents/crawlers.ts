/**
 * Robots policy for AI crawlers (#175, option A decided on 2026-11-24): every AI user agent is
 * allowed, written out by group so the intent is visible; `/api/` is closed to every agent
 * (the CV endpoint is not content). Reopen if the site gets paid content or a vendor changes
 * what its bot does.
 *
 * Names checked on 2026-11-24 against each vendor's documentation (links in `docs/ai-agents.md`).
 * Google-Extended and Applebot-Extended are control tokens, not crawlers: listing them still
 * states the choice for model training.
 */
export type CrawlerGroup = 'search' | 'user-fetch' | 'training';

export type Crawler = { userAgent: string; group: CrawlerGroup; allow: boolean };

export const AI_CRAWLERS: readonly Crawler[] = [
  { userAgent: 'OAI-SearchBot', group: 'search', allow: true },
  { userAgent: 'Claude-SearchBot', group: 'search', allow: true },
  { userAgent: 'PerplexityBot', group: 'search', allow: true },
  { userAgent: 'ChatGPT-User', group: 'user-fetch', allow: true },
  { userAgent: 'Claude-User', group: 'user-fetch', allow: true },
  { userAgent: 'Perplexity-User', group: 'user-fetch', allow: true },
  { userAgent: 'GPTBot', group: 'training', allow: true },
  { userAgent: 'ClaudeBot', group: 'training', allow: true },
  { userAgent: 'Google-Extended', group: 'training', allow: true },
  { userAgent: 'Applebot-Extended', group: 'training', allow: true },
  { userAgent: 'CCBot', group: 'training', allow: true },
];

export const CRAWLER_GROUPS: readonly CrawlerGroup[] = ['search', 'user-fetch', 'training'];

export type RobotsRule = { userAgent: string | string[]; allow?: string; disallow: string };

/** One rule per group, then everyone else. Previews are closed to everyone. */
export function buildRobotsRules(indexable: boolean, crawlers: readonly Crawler[] = AI_CRAWLERS): RobotsRule[] {
  if (!indexable) return [{ userAgent: '*', disallow: '/' }];
  const groups = CRAWLER_GROUPS.flatMap((group) => {
    const members = crawlers.filter((crawler) => crawler.group === group);
    return [true, false].flatMap((allow) => {
      const agents = members.filter((crawler) => crawler.allow === allow).map((crawler) => crawler.userAgent);
      if (agents.length === 0) return [];
      return [allow ? { userAgent: agents, allow: '/', disallow: '/api/' } : { userAgent: agents, disallow: '/' }];
    });
  });
  return [...groups, { userAgent: '*', allow: '/', disallow: '/api/' }];
}
