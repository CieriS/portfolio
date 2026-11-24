import { markdownKey, markdownPages, pageFromKey } from '@/lib/agents/paths';
import { agentHeaders, renderPage } from '@/lib/agents/render';

// Reached through the rewrites of `next.config.ts` (`/en/identity.md` → `/agents/md/en-identity`, #173).
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return markdownPages().map((page) => ({ page: markdownKey(page) }));
}

export async function GET(_request: Request, { params }: RouteContext<'/agents/md/[page]'>) {
  const page = pageFromKey((await params).page);
  if (!page) return new Response('Not found', { status: 404 });
  return new Response(renderPage(page), { headers: agentHeaders('text/markdown', false) });
}
