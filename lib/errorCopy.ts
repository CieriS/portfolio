import errors from '../data/errors.json';
import type { Locale } from './routes';

export type ErrorCopy = { title: string; body: string; cta: string };

/**
 * Copy for the two error boundaries, kept apart from the rest of the content on purpose.
 * Error boundaries are client components: reading their three strings through
 * `lib/portfolio.ts` used to drag the zod schema and all four locale files into the browser
 * bundle of every page. This module imports nothing but its own small file.
 */
const COPY: Record<Locale, ErrorCopy> = errors;

export function errorCopy(locale: Locale): ErrorCopy {
  return COPY[locale];
}
