import en from '../data/locales/en.json';
import fr from '../data/locales/fr.json';
import it from '../data/locales/it.json';

/** The content files, read directly: the suite asserts against the same copy the app renders. */
export { default as shared } from '../data/shared.json';
export const locales = { en, it, fr };
