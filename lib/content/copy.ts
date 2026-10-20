import { z } from 'zod';

/**
 * Value rules for the per-locale copy (`data/locales/*.json`). The shape comes from the
 * reference locale itself (English): every other locale must have exactly its keys, its list
 * lengths and its `{placeholders}`, and every string must be real text. Built from the file
 * instead of written out by hand, so adding a key to `en.json` needs no second edit here; the
 * static type stays `typeof en` in `lib/portfolio.ts`.
 *
 * Build-only, like the rest of `lib/content`: it pulls in zod, which must not reach the browser.
 */

/** What Google shows of a meta description before cutting it. */
export const MAX_DESCRIPTION = 160;
/** A document title past this is cut in results and crowded in a browser tab. */
export const MAX_TITLE = 65;
/** Copy this long that is identical to English was most likely never translated. */
export const MIN_UNTRANSLATED = 60;

const PLACEHOLDER = /\{(\w+)\}/g;
const placeholders = (text: string) => [...text.matchAll(PLACEHOLDER)].map((match) => match[1]).sort();

/** Strict zod schema with the shape of `reference`: same keys, same list lengths, same placeholders. */
export function copySchema(reference: unknown): z.ZodType {
  if (typeof reference === 'string') {
    const expected = placeholders(reference).join(', ');
    return z
      .string()
      .refine((text) => text.trim().length > 0, 'is empty')
      .refine((text) => text === text.trim(), 'has leading or trailing whitespace')
      .refine((text) => placeholders(text).join(', ') === expected, `must use the placeholders {${expected}}`);
  }
  if (Array.isArray(reference)) return z.tuple(reference.map(copySchema) as [z.ZodType, ...z.ZodType[]]);
  if (reference !== null && typeof reference === 'object') {
    return z.strictObject(Object.fromEntries(Object.entries(reference).map(([key, value]) => [key, copySchema(value)])));
  }
  throw new Error(`Unsupported value in the reference copy: ${JSON.stringify(reference)}`);
}

/** The slice of a locale the length rules read. */
type Meta = {
  siteName: string;
  title: string;
  description: string;
  views: Record<string, { title: string; description: string }>;
};

/**
 * Every problem in one locale's copy, as `locale.path: message`. `reference` is the English
 * copy; English itself is checked against its own shape, so its values are held to the same rules.
 */
export function findCopyIssues(locale: string, copy: unknown, reference: unknown, referenceLocale = 'en'): string[] {
  const parsed = copySchema(reference).safeParse(copy);
  const issues = parsed.success
    ? []
    : parsed.error.issues.map((issue) => `${[locale, ...issue.path].join('.')}: ${issue.message}`);
  if (!parsed.success) return issues;

  const meta = (copy as { ui: { meta: Meta } }).ui.meta;
  const at = (path: string) => `${locale}.ui.meta.${path}`;
  const long = (path: string, text: string, max: number) => {
    if (text.length > max) issues.push(`${at(path)}: ${text.length} characters, at most ${max}`);
  };
  long('description', meta.description, MAX_DESCRIPTION);
  long('title', meta.title, MAX_TITLE);
  for (const [view, { title, description }] of Object.entries(meta.views)) {
    long(`views.${view}.description`, description, MAX_DESCRIPTION);
    // As the tab shows it: inner views carry the site name (`documentTitle` in lib/views.ts).
    long(`views.${view}.title`, view === 'hero' ? title : `${title} — ${meta.siteName}`, MAX_TITLE);
  }

  if (locale !== referenceLocale) {
    for (const [path, text] of strings(copy)) {
      if (text.length >= MIN_UNTRANSLATED && text === stringAt(reference, path)) {
        issues.push(`${[locale, ...path].join('.')}: identical to ${referenceLocale}, not translated`);
      }
    }
  }
  return issues;
}

function* strings(value: unknown, path: (string | number)[] = []): Generator<[(string | number)[], string]> {
  if (typeof value === 'string') yield [path, value];
  else if (Array.isArray(value)) for (const [i, item] of value.entries()) yield* strings(item, [...path, i]);
  else if (value !== null && typeof value === 'object')
    for (const [key, item] of Object.entries(value)) yield* strings(item, [...path, key]);
}

function stringAt(value: unknown, path: (string | number)[]): unknown {
  return path.reduce<unknown>((node, key) => (node as Record<string | number, unknown> | undefined)?.[key], value);
}
