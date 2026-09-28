import { locales } from './content';
import { LOCALES, pathFor, VIEW_IDS, type Locale, type ViewId } from '../lib/routes';

/**
 * Locales, views and slugs come from the app's own framework-free `lib/routes.ts`, so the
 * suite tests exactly what is served; `seo.spec.ts` still compares them with sitemap.xml.
 */
export { LOCALES, VIEW_IDS as VIEWS, pathFor, type Locale, type ViewId } from '../lib/routes';

/** Every locale × view pair, as the app prerenders them. */
export const ALL_PAGES = LOCALES.flatMap((locale) => VIEW_IDS.map((view) => ({ locale, view, path: pathFor(locale, view) })));

/** The label the shell puts on the active view's <section>, straight from the content file. */
export function navLabel(locale: Locale, view: ViewId): string {
  return locales[locale].ui.nav[view];
}

export function localeSwitchLabel(locale: Locale): string {
  return locales.en.ui.locale[locale];
}

/**
 * Opens a view and waits until the app is interactive.
 *
 * `page.goto` resolves on `load`, which is well before React has hydrated — a keypress sent
 * in that window finds no listener and is silently lost, which made the keyboard tests flaky.
 * The theme toggle renders a blank label until `useMounted()` flips after hydration, so a
 * non-empty label means handlers are attached. The canvas would be the more obvious signal,
 * but WebKit headless has no WebGL and never attaches one.
 */
export async function gotoView(page: import('@playwright/test').Page, locale: Locale, view: ViewId) {
  await page.goto(pathFor(locale, view));
  await page.waitForFunction(() => (document.querySelector('header button')?.textContent ?? '').trim().length > 0, undefined, {
    timeout: 15_000,
    polling: 100,
  });
}

/**
 * Waits for the view swap to settle: AnimatePresence only mounts the new view once the old
 * one has finished its exit. Polls on a timer rather than the default requestAnimationFrame,
 * which stalls whenever the page is not being painted and would hang the wait.
 */
export async function expectView(page: import('@playwright/test').Page, locale: Locale, view: ViewId) {
  await page.waitForFunction(
    (label) => document.querySelector('main > section')?.getAttribute('aria-label') === label,
    navLabel(locale, view),
    { timeout: 10_000, polling: 100 },
  );
}
