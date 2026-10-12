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
