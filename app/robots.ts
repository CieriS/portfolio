import type { MetadataRoute } from 'next';
import { buildRobotsRules } from '@/lib/agents/crawlers';
import { absoluteUrl, IS_INDEXABLE } from '@/lib/site';

// AI crawlers written out by group (#175); preview deployments stay out of search results entirely.
export default function robots(): MetadataRoute.Robots {
  const rules = buildRobotsRules(IS_INDEXABLE);
  return IS_INDEXABLE ? { rules, sitemap: absoluteUrl('/sitemap.xml') } : { rules };
}
