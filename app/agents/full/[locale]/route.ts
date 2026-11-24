import { agentHeaders, renderFullText } from '@/lib/agents/render';
import { isLocale, LOCALES } from '@/lib/routes';

// Reached through the rewrites of `next.config.ts` (`/llms-full.txt`, `/it/llms-full.txt`, #174).
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function GET(_request: Request, { params }: RouteContext<'/agents/full/[locale]'>) {
  const { locale } = await params;
  if (!isLocale(locale)) return new Response('Not found', { status: 404 });
  return new Response(renderFullText(locale), { headers: agentHeaders('text/plain', false) });
}
