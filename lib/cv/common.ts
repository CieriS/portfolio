/**
 * The pieces of the CV download that both the browser form and the server need. Nothing
 * here may import zod, node modules or the content files: it ships with the client bundle.
 */

/** How long an emailed download link works. */
export const LINK_HOURS = 24;

/** `Samuele Cieri` → `Samuele-Cieri-CV.pdf`: ASCII only, safe inside a quoted header value. */
export function cvFileName(name: string): string {
  const base = name
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return `${base || 'Curriculum'}-CV.pdf`;
}

/** `attachment; filename="Samuele-Cieri-CV.pdf"` → `Samuele-Cieri-CV.pdf`. */
export function fileNameFrom(disposition: string | null): string {
  return disposition?.match(/filename="([^"]+)"/)?.[1] ?? 'CV.pdf';
}

export type CvInputProblem = 'emptyEmail' | 'badEmail' | 'emptyPassword';

/** Something before the at sign, something after it, and a dot in the domain: the rest is the server's call. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * What is wrong with the field before anything is sent, or `null`. It replaces the browser's
 * own bubble ("Please fill in this field"), which cannot say what the field is for and speaks
 * the browser's language rather than the page's.
 */
export function checkCvInput(method: 'email' | 'password', value: string): CvInputProblem | null {
  if (method === 'password') return value.trim() === '' ? 'emptyPassword' : null;
  const email = value.trim();
  if (email === '') return 'emptyEmail';
  return EMAIL_SHAPE.test(email) ? null : 'badEmail';
}

/** What the form says for each answer of `POST /api/cv` (see app/api/cv/route.ts). */
export type CvAnswer = 'sent' | 'invalid' | 'denied' | 'unavailable' | 'notSent' | 'tooMany' | 'failed';

const ANSWERS: Record<number, CvAnswer> = {
  202: 'sent',
  400: 'invalid',
  403: 'denied',
  // The mail provider refused the message: retrying gives the same result, so the message points elsewhere (#136).
  502: 'notSent',
  503: 'unavailable',
  // The firewall's rate limit (#112).
  429: 'tooMany',
};

export function statusFromCode(code: number): CvAnswer {
  return ANSWERS[code] ?? 'failed';
}

/** `'Write on {linkedin}.'` → `['Write on ', '.']`, so a link can sit where the placeholder was; `null` after when it is missing. */
export function splitAtPlaceholder(text: string, name: string): [string, string | null] {
  const token = `{${name}}`;
  const at = text.indexOf(token);
  return at === -1 ? [text, null] : [text.slice(0, at), text.slice(at + token.length)];
}
