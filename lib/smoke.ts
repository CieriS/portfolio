import { ALIAS_HOSTS } from './aliases';

/**
 * What a deployed site must look like, by Vercel environment (issue #82). The smoke suite in
 * `smoke/` runs against the URL Vercel reports after each deployment and checks what only the
 * deployment decides: indexing comes from `VERCEL_ENV`, the CV from the variables set on Vercel,
 * the alias redirects from the production domains. Framework-free so the suite can import it.
 */
export type DeployEnvironment = 'production' | 'preview';

export type DeployExpectations = {
  environment: DeployEnvironment;
  /** The host of SITE_URL: the public host, where production is served. */
  siteHost: string;
  /** `index, follow` in production; previews must stay out of search engines. */
  indexable: boolean;
  /**
   * Status of `GET /api/cv` with a forged token. 403 means the CV is configured and the token was
   * rejected; 503 means the variables are missing, acceptable only where they are not set (previews).
   */
  cvForgedTokenStatuses: readonly number[];
  /** Hosts that must answer 308 towards `SITE_URL`: only production owns the alias domains. */
  redirectingHosts: readonly string[];
};

/** Accepts the names GitHub deployments carry (`Production`, `Preview`) and `VERCEL_ENV` values. */
export function parseDeployEnvironment(value: string | undefined): DeployEnvironment {
  const normalized = value?.trim().toLowerCase();
  if (normalized === 'production' || normalized === 'preview') return normalized;
  throw new Error(`Unknown deployment environment ${JSON.stringify(value)}: expected Production or Preview`);
}

export function deployExpectations(environment: DeployEnvironment, siteUrl: string): DeployExpectations {
  const siteHost = new URL(siteUrl).host;
  const production = environment === 'production';
  return {
    environment,
    siteHost,
    indexable: production,
    cvForgedTokenStatuses: production ? [403] : [403, 503],
    redirectingHosts: production ? ALIAS_HOSTS.filter((host) => host !== siteHost) : [],
  };
}

/**
 * The X-Robots-Tag header a deployment must send. Vercel adds `noindex` by itself on every
 * deployment-specific URL (`<project>-<hash>-<team>.vercel.app`), production included; only the
 * public host of production must be free of it. The robots meta tag is the app's own and is
 * checked separately on every page.
 */
export function robotsHeaderOn(expected: DeployExpectations, baseUrl: string): 'absent' | 'noindex' {
  if (!expected.indexable) return 'noindex';
  return new URL(baseUrl).host === expected.siteHost ? 'absent' : 'noindex';
}
