/**
 * Every production host of this Vercel project. Whichever one `SITE_URL` names is served; the
 * others redirect to it, so moving the site between them only means changing `SITE_URL` (issue #69).
 * The canonical tag alone is only a hint: Google indexed `cieri.vercel.app` anyway (issue #67).
 * A permanent redirect is a directive. Exact hosts only — a rule like "any host but SITE_URL"
 * would also catch preview deployments, localhost and the test server.
 */
export const ALIAS_HOSTS = ['cieri.vercel.app', 'cierisamuele.vercel.app', 'samuelecieri.vercel.app'] as const;

export type HostRedirect = {
  source: string;
  has: { type: 'host'; value: string }[];
  destination: string;
  permanent: true;
};

/** One 308 per alias to the same path on `siteUrl`; the alias that is `siteUrl` itself is skipped. */
export function aliasRedirects(siteUrl: string, aliases: readonly string[] = ALIAS_HOSTS): HostRedirect[] {
  const origin = new URL(siteUrl);
  return aliases
    .filter((host) => host !== origin.host)
    .map((host) => ({
      source: '/:path*',
      has: [{ type: 'host', value: escapeHost(host) }],
      destination: `${origin.origin}/:path*`,
      permanent: true,
    }));
}

// `has.value` is a regular expression: an unescaped dot would match any character.
function escapeHost(host: string): string {
  return `^${host.replace(/\./g, '\\.')}$`;
}
