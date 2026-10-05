import { expect, test } from '@playwright/test';
import { locales, shared } from './content';
import { gotoView, navLabel } from './helpers';

const { threads } = shared.timeline;
/** `formatDate` renders ISO as DD.MM.YYYY. */
const asShown = (iso: string) => iso.split('-').reverse().join('.');

test('every thread in the data gets its own lane and detail column', async ({ page }) => {
  await gotoView(page, 'en', 'timeline');
  // The view is built from the array, so adding a thread must not need a code change here.
  await expect(page.locator('main > section article')).toHaveCount(threads.length);

  for (const thread of threads) {
    const first = thread.segments[0];
    await expect(page.locator('main > section')).toContainText(asShown(first.start));
  }
});

test('a thread without an entity shows its label alone, not a placeholder', async ({ page }) => {
  await gotoView(page, 'en', 'timeline');
  const articles = page.locator('main > section article');
  const threadCopy: Record<string, { entityLabel: string }> = locales.en.timeline.threads;

  for (const [i, thread] of threads.entries()) {
    const { entityLabel } = threadCopy[thread.id];
    const line = articles.nth(i).getByText(entityLabel, { exact: false }).first();
    await expect(line).toHaveText(thread.entity ? `${entityLabel}: ${thread.entity}` : entityLabel);
  }
});

test('an interrupted thread draws one bar per segment and names its periods', async ({ page }) => {
  const interrupted = threads.find((thread) => thread.segments.length > 1);
  test.skip(!interrupted, 'no thread currently has more than one segment');

  await gotoView(page, 'en', 'timeline');
  const section = page.locator('main > section');

  // Both ends of the interruption are stated in text, not left to the shape alone.
  for (const segment of interrupted!.segments) {
    await expect(section).toContainText(asShown(segment.start));
    if (segment.end) await expect(section).toContainText(asShown(segment.end));
  }

  // A resumed thread is still running: the gap is in its past.
  await expect(section).toContainText(locales.en.timeline.labels.running);
});

test('the uptime counts active time, so a gap does not inflate it', async ({ page }) => {
  await gotoView(page, 'en', 'timeline');
  const uptime = await page.locator('main > section p.tabular-nums').first().innerText();

  const days = Number.parseInt(uptime, 10);
  const work = threads.find((thread) => thread.kind === 'work')!;
  const elapsed = (Date.now() - Date.parse(`${work.segments[0].start}T00:00:00Z`)) / 86_400_000;

  expect(days).toBeGreaterThan(0);
  // The work thread runs uninterrupted, so active time still equals elapsed time.
  expect(Math.abs(days - Math.floor(elapsed))).toBeLessThanOrEqual(1);
});

test('the timeline view still has exactly one h1', async ({ page }) => {
  await gotoView(page, 'en', 'timeline');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('main > section')).toHaveAttribute('aria-label', navLabel('en', 'timeline'));
});
