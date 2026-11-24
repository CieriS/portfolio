import { agentHeaders, renderLlmsTxt } from '@/lib/agents/render';
import { IS_INDEXABLE } from '@/lib/site';

// Built once at `next build` from `data/` (#172). Preview deployments get `noindex`, like every page.
export const dynamic = 'force-static';

export function GET() {
  return new Response(renderLlmsTxt(), { headers: agentHeaders('text/plain', IS_INDEXABLE) });
}
