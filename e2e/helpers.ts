import portfolio from '../data/portfolio.json';

/**
 * The suite deliberately does not import `i18n/routing.ts` or `lib/views.ts`: those pull in
 * next-intl and only resolve inside the Next bundler. Slugs are therefore restated here —
 * and `seo.spec.ts` compares this list against the real sitemap.xml, so a locale or view
 * added to the app without touching this file fails the run instead of going untested.
 */
export const LOCALES = ['en', 'it', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];

export const VIEWS = ['hero', 'identity', 'timeline', 'projects', 'discipline'] as const;
export type ViewId = (typeof VIEWS)[number];

export const SLUGS: Record<Locale, Record<ViewId, string>> = {
  en: { hero: '', identity: 'identity', timeline: 'execution', projects: 'systems', discipline: 'optimization' },
  it: { hero: '', identity: 'identita', timeline: 'esecuzione', projects: 'sistemi', discipline: 'ottimizzazione' },
  fr: { hero: '', identity: 'identite', timeline: 'execution', projects: 'systemes', discipline: 'optimisation' },
};

export function pathFor(locale: Locale, view: ViewId): string {
  const slug = SLUGS[locale][view];
  return slug ? `/${locale}/${slug}` : `/${locale}`;
}

/** Every locale × view pair, as the app prerenders them. */
export const ALL_PAGES = LOCALES.flatMap((locale) => VIEWS.map((view) => ({ locale, view, path: pathFor(locale, view) })));

/** The label the shell puts on the active view's <section>, straight from the content file. */
export function navLabel(locale: Locale, view: ViewId): string {
  return portfolio.locales[locale].ui.nav[view];
}

export function localeSwitchLabel(locale: Locale): string {
  return portfolio.locales.en.ui.locale[locale];
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
  await page.waitForFunction(
    () => (document.querySelector('header button')?.textContent ?? '').trim().length > 0,
    undefined,
    { timeout: 15_000, polling: 100 },
  );
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
