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
