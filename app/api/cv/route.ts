import { cvFileName } from '@/lib/cv/common';
import { readCvConfig } from '@/lib/cv/config';
import { cvCopy } from '@/lib/cv/copy';
import { buildCv } from '@/lib/cv/document';
import { resendMailer } from '@/lib/cv/mailer';
import { renderCvPdf } from '@/lib/cv/pdf';
import { openLink, requestCv, type CvOutcome } from '@/lib/cv/service';
import { getPortfolioBundle } from '@/lib/portfolio';
import type { Locale } from '@/lib/routes';
import { SITE_URL } from '@/lib/site';

/**
 * HTTP adapter of the CV download (`lib/cv/service.ts` holds the rules):
 * - POST `{ method: 'password', password, locale }` → the PDF, or 403;
 * - POST `{ method: 'email', email, locale }` → 202 once the signed link is mailed;
 * - GET `?token=…` → the PDF behind a link from that email, or 403 once it has expired.
 * The only part of the site rendered per request: everything else stays prerendered.
 */
export const runtime = 'nodejs';

const { config, problems } = readCvConfig(process.env);
for (const problem of problems) console.warn(`[cv] ${problem}`);

const mailer = config.links ? resendMailer(config.links) : null;
const NO_STORE = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' };

export async function POST(request: Request): Promise<Response> {
  const body: unknown = await request.json().catch(() => null);
  const outcome = await requestCv(body, {
    config,
    mailer,
    now: Date.now(),
    siteUrl: SITE_URL,
    name: getPortfolioBundle().shared.name,
    report: (error) => console.error('[cv]', error),
  });
  return respond(outcome);
}

export async function GET(request: Request): Promise<Response> {
  const token = new URL(request.url).searchParams.get('token');
  const outcome = openLink(token, { config, now: Date.now() });
  if (outcome.kind === 'denied') {
    return new Response(`This link is invalid or has expired. Ask for a new one at ${SITE_URL}`, {
      status: 403,
      headers: { ...NO_STORE, 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
  return respond(outcome);
}

async function respond(outcome: CvOutcome): Promise<Response> {
  if (outcome.kind === 'pdf') return pdfResponse(outcome.locale);
  const status = { sent: 202, invalid: 400, denied: 403, unavailable: 503, failed: 502 }[outcome.kind];
  return Response.json({ status: outcome.kind }, { status, headers: NO_STORE });
}

async function pdfResponse(locale: Locale): Promise<Response> {
  const { shared, contents } = getPortfolioBundle();
  const cv = buildCv({
    shared,
    content: contents[locale],
    copy: cvCopy(locale).pdf,
    contact: config.contact,
    today: new Date().toISOString().slice(0, 10),
    site: SITE_URL,
  });
  const bytes = await renderCvPdf(cv, `${shared.name} — CV`);
  return new Response(Buffer.from(bytes), {
    headers: {
      ...NO_STORE,
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${cvFileName(shared.name)}"`,
    },
  });
}
