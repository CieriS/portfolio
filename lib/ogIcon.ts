/**
 * The brand mark drawn on the share cards: `app/icon.png` scaled down to the size it is drawn
 * at. The cards are always 1200×630, so a larger source would only be decoded and thrown
 * away once per card. Regenerate it whenever `app/icon.png` changes.
 */
export const OG_ICON_FILE = 'lib/og-icon.png';
export const OG_ICON_SIZE = 56;
