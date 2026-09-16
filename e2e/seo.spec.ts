import { expect, test } from '@playwright/test';
import { ALL_PAGES, pathFor } from './helpers';

async function jsonLd(page: import('@playwright/test').Page) {
  const raw = await page.locator('script[type="application/ld+json"]').textContent();
  return JSON.parse(raw ?? '{}') as { '@graph': Array<Record<string, unknown>> };
}
const typesIn = (graph: { '@graph': Array<Record<string, unknown>> }) => graph['@graph'].map((n) => n['@type']);

test('the index carries WebSite, Person and ProfilePage', async ({ page }) => {
  await page.goto(pathFor('en', 'hero'));
  const graph = await jsonLd(page);
  expect(typesIn(graph)).toEqual(expect.arrayContaining(['WebSite', 'Person', 'ProfilePage']));

  const person = graph['@graph'].find((n) => n['@type'] === 'Person');
  expect(person?.name).toBeTruthy();
  expect(Array.isArray(person?.sameAs)).toBe(true);
  // Facts that live in `shared` and should not be restated for search engines.
  expect(person?.knowsLanguage).toBeTruthy();
  expect(person?.worksFor).toBeTruthy();
  expect(person?.alumniOf).toBeTruthy();
});

test('inner views add a breadcrumb, and projects adds an ItemList', async ({ page }) => {
  await page.goto(pathFor('en', 'identity'));
  expect(typesIn(await jsonLd(page))).toContain('BreadcrumbList');

  await page.goto(pathFor('en', 'projects'));
  expect(typesIn(await jsonLd(page))).toContain('ItemList');
});

test('the JSON-LD block cannot break out of its script tag', async ({ page }) => {
  await page.goto(pathFor('en', 'projects'));
  const raw = await page.locator('script[type="application/ld+json"]').innerHTML();
  expect(raw).not.toContain('</script');
  expect(() => JSON.parse(raw)).not.toThrow();
});

test('the sitemap lists exactly the pages this suite knows about', async ({ request, baseURL }) => {
  const response = await request.get('/sitemap.xml');
  expect(response.status()).toBe(200);
  const xml = await response.text();

  const listed = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname).sort();
  const expected = ALL_PAGES.map((p) => p.path).sort();

  // Guards the hardcoded slug table in helpers.ts: a locale or view added to the app
  // without updating it shows up here rather than quietly going untested.
  expect(listed).toEqual(expected);
  expect(xml).toContain(`${baseURL}${pathFor('fr', 'projects')}`);
});

test('robots.txt points at the sitemap', async ({ request }) => {
  const response = await request.get('/robots.txt');
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('/sitemap.xml');
});

test('the manifest is complete', async ({ request }) => {
  const response = await request.get('/manifest.webmanifest');
  expect(response.status()).toBe(200);
  const manifest = await response.json();
  expect(manifest).toMatchObject({ id: '/', scope: '/', start_url: '/', dir: 'ltr' });
  expect(manifest.icons.length).toBeGreaterThan(0);
});

test('legacy PHP URLs still redirect', async ({ request }) => {
  for (const [from, to] of [
    ['/index.php', '/'],
    ['/projDev/anything', '/it/sistemi'],
  ]) {
    const response = await request.get(from, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers()['location']).toBe(to);
  }
});
