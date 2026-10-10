import { expect, test } from '@playwright/test';
import { LOCALES } from '../lib/routes';
import { locales, shared } from './content';
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
  // Name variants and place tie the site to the same person as the profiles in `sameAs`.
  expect(person?.alternateName).toEqual(shared.alternateNames);
  expect(person?.address).toEqual({
    '@type': 'PostalAddress',
    addressLocality: shared.address.locality,
    addressCountry: shared.address.country,
  });
});

test('the home page states employer, studies and projects in its served HTML', async ({ request }) => {
  // No browser: the page that ranks for the name must carry these facts as plain text.
  const decode = (html: string) => html.replace(/&#x27;/g, "'").replace(/&amp;/g, '&');

  for (const locale of LOCALES) {
    const html = decode(await (await request.get(pathFor(locale, 'hero'))).text());
    const { lead, detail } = locales[locale].hero;
    expect(html).toContain(lead);
    expect(html).toContain(detail);
    for (const fact of ['Tas', 'Angular', 'Rust', 'PostgreSQL', 'yourFinance', 'aria-er']) expect(detail).toContain(fact);
  }
});

test('the Person keeps one url in every language', async ({ page, baseURL }) => {
  for (const locale of LOCALES) {
    await page.goto(pathFor(locale, 'identity'));
    const person = (await jsonLd(page))['@graph'].find((n) => n['@type'] === 'Person');
    expect(person?.url).toBe(`${baseURL}/`);
    expect(person?.['@id']).toBe(`${baseURL}/#person`);
  }
});

test('every page is indexable and carries the bare Search Console token', async ({ page }) => {
  for (const { path } of ALL_PAGES) {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
    await expect(page.locator('meta[name="google-site-verification"]')).toHaveAttribute('content', 'e2e-token');
  }
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

test('every manifest icon is served at the size it declares', async ({ request }) => {
  const manifest = await (await request.get('/manifest.webmanifest')).json();
  expect(manifest.icons.map((icon: { sizes: string }) => icon.sizes)).toContain('512x512');

  for (const icon of manifest.icons as { src: string; sizes: string }[]) {
    const response = await request.get(icon.src);
    expect(response.status(), icon.src).toBe(200);
    // A PNG stores width and height as two big-endian integers right after the IHDR tag.
    const body = await response.body();
    expect(`${body.readUInt32BE(16)}x${body.readUInt32BE(20)}`, icon.src).toBe(icon.sizes);
  }
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
