import { expect, test } from '@playwright/test';
import { fullTextPath, htmlPath, LLMS_TXT_PATH, markdownPath, type MarkdownPage } from '../lib/agents/paths';

/** #172–#174: the files for AI agents on the production build, as an agent fetches them. */
const AGENTS = ['GPTBot/1.2', 'ClaudeBot/1.0', 'PerplexityBot/1.0'];

const SAMPLES: MarkdownPage[] = [
  { locale: 'en', view: 'hero' },
  { locale: 'en', view: 'identity' },
  { locale: 'it', view: 'timeline' },
  { locale: 'it', view: 'projects' },
  { locale: 'en', study: 'yourfinance' },
  { locale: 'it', study: 'ariaer' },
];

for (const userAgent of AGENTS) {
  test(`${userAgent}: /llms.txt is plain text, at the root, not redirected`, async ({ request }) => {
    const response = await request.get(LLMS_TXT_PATH, { headers: { 'User-Agent': userAgent }, maxRedirects: 0 });
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('text/plain; charset=utf-8');
    expect(await response.text()).toMatch(/^# \S/);
  });
}

for (const locale of ['en', 'it'] as const) {
  test(`${fullTextPath(locale)} is the whole site, not indexed`, async ({ request }) => {
    const response = await request.get(fullTextPath(locale), { maxRedirects: 0 });
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('text/plain; charset=utf-8');
    expect(response.headers()['x-robots-tag']).toBe('noindex');
    expect((await response.text()).split('\n---\n').length).toBeGreaterThan(4);
  });
}

for (const page of SAMPLES) {
  test(`${markdownPath(page)} is Markdown, linked from its HTML page`, async ({ request, page: browser }) => {
    const response = await request.get(markdownPath(page), { headers: { 'User-Agent': AGENTS[1]! }, maxRedirects: 0 });
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('text/markdown; charset=utf-8');
    expect(response.headers()['x-robots-tag']).toBe('noindex');
    expect(await response.text()).toContain(`${htmlPath(page)}>`);

    await browser.goto(htmlPath(page));
    const href = await browser.locator('link[rel="alternate"][type="text/markdown"]').getAttribute('href');
    expect(new URL(href!).pathname).toBe(markdownPath(page));
  });
}

test('the Markdown files are not in the sitemap', async ({ request }) => {
  expect(await (await request.get('/sitemap.xml')).text()).not.toContain('.md<');
});

test('an unknown Markdown page is a 404', async ({ request }) => {
  expect((await request.get('/en/nope.md')).status()).toBe(404);
});
