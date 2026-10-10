import cv from '@/data/cv.json';
import type { Locale } from '@/lib/routes';

/**
 * Copy of the PDF and of the email, kept out of the locale files: those ship to the browser
 * with every page, while these strings are only ever read on the server.
 */
export type CvCopy = (typeof cv)['en'];

const COPY: Record<Locale, CvCopy> = cv;

export function cvCopy(locale: Locale): CvCopy {
  return COPY[locale];
}

/** Replaces `{name}` placeholders; an unknown placeholder is left visible rather than dropped. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (Object.hasOwn(values, key) ? String(values[key]) : match));
}
