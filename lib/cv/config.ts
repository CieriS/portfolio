/**
 * Server-side settings of the CV download, read from environment variables so that nothing
 * private (phone number, passwords, API keys) ever lands in this public repository.
 * Each half of the feature switches on independently: a missing or weak value disables
 * that half and is reported once, instead of failing the build or every request.
 */
export type CvConfig = {
  /** Unlocks the download at once. */
  adminPassword: string | null;
  /** Visitors receive a signed link by email; needs the signing secret and a mail sender. */
  links: { secret: string; apiKey: string; from: string; notify: string | null } | null;
  /** Printed in the PDF only: the reason the CV is not public. */
  contact: { email: string | null; phone: string | null };
};

type Env = Record<string, string | undefined>;

export const MIN_PASSWORD_LENGTH = 16;
export const MIN_SECRET_LENGTH = 32;

export function readCvConfig(env: Env): { config: CvConfig; problems: string[] } {
  const problems: string[] = [];
  const value = (name: string) => env[name]?.trim() || null;

  let adminPassword = value('CV_ADMIN_PASSWORD');
  if (adminPassword && adminPassword.length < MIN_PASSWORD_LENGTH) {
    problems.push(`CV_ADMIN_PASSWORD is shorter than ${MIN_PASSWORD_LENGTH} characters: password download disabled`);
    adminPassword = null;
  }

  const secret = value('CV_LINK_SECRET');
  const apiKey = value('RESEND_API_KEY');
  const from = value('CV_MAIL_FROM');
  let links: CvConfig['links'] = null;
  if (secret && secret.length < MIN_SECRET_LENGTH) {
    problems.push(`CV_LINK_SECRET is shorter than ${MIN_SECRET_LENGTH} characters: email links disabled`);
  } else if (secret && apiKey && from) {
    links = { secret, apiKey, from, notify: value('CV_NOTIFY_EMAIL') };
  } else if (secret || apiKey || from) {
    problems.push('email links need CV_LINK_SECRET, RESEND_API_KEY and CV_MAIL_FROM together: email links disabled');
  }

  return { config: { adminPassword, links, contact: { email: value('CV_EMAIL'), phone: value('CV_PHONE') } }, problems };
}
