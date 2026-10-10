import { z } from 'zod';
import { LOCALES, type Locale } from '@/lib/routes';
import type { CvConfig } from './config';
import { LINK_HOURS } from './common';
import { cvCopy, fill } from './copy';
import type { Mailer } from './mailer';
import { passwordMatches, signLink, verifyLink } from './token';

/**
 * The two ways to the CV, as use cases free of HTTP and of PDF rendering:
 * - the owner's password downloads it at once;
 * - anyone else proves an email address by receiving a signed, expiring link to it.
 * The route handler maps each outcome to a response and renders the PDF on `pdf`.
 */

export type CvOutcome =
  | { kind: 'pdf'; locale: Locale }
  | { kind: 'sent' }
  | { kind: 'invalid' }
  | { kind: 'denied' }
  | { kind: 'unavailable' }
  | { kind: 'failed' };

export type CvDeps = {
  config: CvConfig;
  /** `null` when email links are not configured. */
  mailer: Mailer | null;
  now: number;
  siteUrl: string;
  name: string;
  report: (error: unknown) => void;
};

const locale = z.enum(LOCALES);

export const CvRequestSchema = z.discriminatedUnion('method', [
  z.object({ method: z.literal('password'), locale, password: z.string().min(1).max(256) }),
  z.object({
    method: z.literal('email'),
    locale,
    email: z.email().max(254),
    /** Honeypot: hidden from people, filled in by form-spamming bots. */
    website: z.string().max(2048).optional(),
  }),
]);

export async function requestCv(body: unknown, deps: CvDeps): Promise<CvOutcome> {
  const parsed = CvRequestSchema.safeParse(body);
  if (!parsed.success) return { kind: 'invalid' };
  const request = parsed.data;

  if (request.method === 'password') {
    if (!deps.config.adminPassword) return { kind: 'unavailable' };
    return passwordMatches(request.password, deps.config.adminPassword)
      ? { kind: 'pdf', locale: request.locale }
      : { kind: 'denied' };
  }

  const links = deps.config.links;
  if (!links || !deps.mailer) return { kind: 'unavailable' };
  // A bot gets the same answer as a person, so it has no reason to try again differently.
  if (request.website) return { kind: 'sent' };

  const token = signLink({ email: request.email, locale: request.locale, exp: deps.now + LINK_HOURS * 3_600_000 }, links.secret);
  const copy = cvCopy(request.locale).email;
  const values = { name: deps.name, hours: LINK_HOURS, link: `${deps.siteUrl}/api/cv?token=${token}` };
  try {
    await deps.mailer({ to: request.email, subject: fill(copy.subject, values), text: fill(copy.body, values) });
  } catch (error) {
    deps.report(error);
    return { kind: 'failed' };
  }

  if (links.notify) {
    // Best effort: the visitor already has the link, a lost notice must not turn into an error.
    await deps
      .mailer({
        to: links.notify,
        subject: `CV requested by ${request.email}`,
        text: `${request.email} asked for the CV (${request.locale}).`,
      })
      .catch(deps.report);
  }
  return { kind: 'sent' };
}

/** Opens a link from the email: the CV in the language it was asked in, or nothing. */
export function openLink(token: string | null, deps: Pick<CvDeps, 'config' | 'now'>): CvOutcome {
  const links = deps.config.links;
  if (!links) return { kind: 'unavailable' };
  const claims = token ? verifyLink(token, links.secret, deps.now) : null;
  return claims ? { kind: 'pdf', locale: claims.locale } : { kind: 'denied' };
}
