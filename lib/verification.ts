const TOKEN = /^[A-Za-z0-9_-]+$/;
const META_TAG = /^<meta\s[^>]*\bcontent=(["'])([^"']+)\1[^>]*>$/i;

/**
 * Search Console hands out a whole `<meta>` tag, while Next wants the token alone: pasting the
 * tag into the environment variable used to publish it HTML-escaped inside `content`, which
 * Google never matches. Accepts either form and returns the bare token; anything else throws,
 * so a malformed value fails the build instead of silently shipping a useless tag.
 */
export function googleVerificationToken(raw: string | undefined): string | undefined {
  const value = raw?.trim();
  if (!value) return undefined;

  const token = META_TAG.exec(value)?.[2] ?? value;
  if (!TOKEN.test(token)) {
    throw new Error('GOOGLE_SITE_VERIFICATION must be the verification token or the <meta> tag from Search Console');
  }
  return token;
}
