/**
 * `/llms-full.txt` (#174): the whole site in one Markdown document, made only of the page
 * renderers of `markdown.ts`, so it holds no text of its own.
 */
export const FULL_TEXT_SEPARATOR = '\n---\n\n';

/** Over this, something is duplicated: the English file is a fraction of it. */
export const FULL_TEXT_BUDGET_BYTES = 60 * 1024;

export function joinPages(pages: string[]): string {
  return pages.join(FULL_TEXT_SEPARATOR);
}
