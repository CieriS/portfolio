/**
 * The first check on `POST /api/cv`, before the body is read (#113). A `text/plain` or form POST
 * needs no CORS preflight, so without this any web page could make a visitor's browser ask for
 * a CV email. JSON only (415), and an `Origin`, when there is one, must be the site or the
 * address the request was sent to, which keeps previews and localhost working (403).
 */
export type CvGuardInput = { contentType: string | null; origin: string | null; requestUrl: string; siteUrl: string };

export function guardCvPost({ contentType, origin, requestUrl, siteUrl }: CvGuardInput): 'ok' | 403 | 415 {
  const mediaType = (contentType ?? '').split(';')[0].trim().toLowerCase();
  if (mediaType !== 'application/json') return 415;
  if (origin === null) return 'ok';
  // Browsers send the serialized origin (`https://host[:port]`), so an exact match is enough.
  return origin === originOf(siteUrl) || origin === originOf(requestUrl) ? 'ok' : 403;
}

function originOf(url: string): string | null {
  try {
    const { origin } = new URL(url);
    return origin === 'null' ? null : origin;
  } catch {
    return null;
  }
}
