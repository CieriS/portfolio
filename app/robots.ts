import type { MetadataRoute } from 'next';
import { absoluteUrl, IS_INDEXABLE, SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  // Preview deployments stay out of search results entirely.
  if (!IS_INDEXABLE) return { rules: [{ userAgent: '*', disallow: '/' }] };

  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE_URL,
  };
}
