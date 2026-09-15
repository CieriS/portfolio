/**
 * Canonical origin for canonical URLs, hreflang, sitemap, Open Graph and JSON-LD.
 * Resolution: explicit `SITE_URL` (custom domain) → Vercel production URL
 * (`VERCEL_PROJECT_PRODUCTION_URL`, set on every Vercel build, previews included) → localhost.
 */
function resolveSiteUrl(): string {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return 'http://localhost:3000';
}

export const SITE_URL = resolveSiteUrl().replace(/\/+$/, '');

/** Only production is indexable: Vercel preview/branch deployments must not compete with it in search. */
export const IS_INDEXABLE = !process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'production';

export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE_URL}/`).toString();
}
