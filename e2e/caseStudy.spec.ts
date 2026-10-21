import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import ariaer from '../data/case-studies/ariaer.json';
import yourfinance from '../data/case-studies/yourfinance.json';
import { caseStudyPath, CASE_STUDY_IDS, LOCALES, type CaseStudyId } from '../lib/routes';
import { locales, shared } from './content';
import { CASE_STUDY_PAGES, expectView, gotoView, pathFor } from './helpers';

/**
 * The case studies: prerendered pages below the projects view. yourFinance is private, so its
 * tests find no way to its repository; aria-er is public, so its page leads to the repository.
 */
const STUDIES = { yourfinance, ariaer } as const;

/**
 * The daily export aria-er publishes on GitHub Pages, replaced by a small fixture: the suite
 * never depends on the network. `generatedAt` sets how old the data look; `fail` makes every
 * file answer 503.
 */
async function serveExport(page: Page, { generatedAt = new Date().toISOString(), fail = false } = {}) {
  const row = (station: string, year: number, exceedances: number) => ({
    station_name: station,
    municipality: 'BOLOGNA',
    pollutant_code: 'PM10',
    metric: 'daily_mean',
    year,
    exceedances,
    max_exceedances_per_year: 35,
    year_coverage: 0.98,
  });
  const files: Record<string, unknown> = {
    'meta.json': { schema_version: 1, generated_at: generatedAt, period: { from: '2016-01-01', to: '2026-10-20' } },
    'exceedances.json': [
      row('PORTA SAN FELICE', 2024, 26),
      row('PORTA SAN FELICE', 2025, 20),
      row('VIA CHIARINI', 2025, 7),
      { ...row('LM-PR', 2025, 1), municipality: null },
    ],
    'pollutant-trend.json': [
      { municipality: 'BOLOGNA', pollutant_code: 'PM10', year: 2024, annual_mean_ugm3: 25, is_representative: true },
      { municipality: 'BOLOGNA', pollutant_code: 'PM10', year: 2025, annual_mean_ugm3: 24, is_representative: true },
      { municipality: 'BOLOGNA', pollutant_code: 'NO2', year: 2025, annual_mean_ugm3: 31, is_representative: true },
    ],
  };
  await page.route(`${ariaer.live.source}*`, (route) => {
    const name = new URL(route.request().url()).pathname.split('/').pop() ?? '';
    if (fail || !(name in files)) return route.fulfill({ status: 503 });
    return route.fulfill({ json: files[name], headers: { 'access-control-allow-origin': '*' } });
  });
}

test.beforeEach(async ({ page }) => {
  await serveExport(page);
});

function projectOf(id: CaseStudyId) {
  const project = shared.projects.find((item) => item.id === id);
  if (!project) throw new Error(`No project "${id}"`);
  return project;
}

for (const { locale, id, path } of CASE_STUDY_PAGES) {
  const study = STUDIES[id];
  const copy = study.copy[locale];
  const project = projectOf(id);
  const firstDecision = (copy.decisions.items as Record<string, { title: string }>)[study.decisions[0]];

  test(`${path} is prerendered with its own heading, metadata and alternates`, async ({ page, request, baseURL }) => {
    // Served HTML, before any script: what a crawler reads.
    const html = await (await request.get(path)).text();
    expect(html).toContain(copy.problem.title.replace(/'/g, '&#x27;'));
    expect(html).toContain(firstDecision.title.replace(/'/g, '&#x27;'));

    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText(project.name);
    await expect(page).toHaveTitle(new RegExp(`^${copy.meta.title}`));
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', copy.meta.description);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${baseURL}${path}`);
    for (const other of LOCALES) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${other}"]`)).toHaveAttribute(
        'href',
        `${baseURL}${caseStudyPath(other, id)}`,
      );
    }
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
      'href',
      `${baseURL}${caseStudyPath('en', id)}`,
    );
  });

  if (project.source.visibility === 'private') {
    test(`${path} never leads to the private repository`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('a[href*="github.com"]')).toHaveCount(0);
      expect(await page.content()).not.toContain('your-finance');

      const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
      expect(jsonLd).toContain('TechArticle');
      expect(jsonLd).not.toContain('codeRepository');
      // The way to the code is the same as in the accordion: ask.
      await expect(page.locator('a[data-source="private"]')).toHaveAttribute('href', pathFor(locale, 'identity'));
    });
  } else {
    test(`${path} leads to the public repository`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('a[data-source="public"]')).toHaveAttribute('href', project.source.url ?? '');
      await expect(page.locator('a[data-source="private"]')).toHaveCount(0);

      const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
      expect(jsonLd).toContain(`"codeRepository":"${project.source.url}"`);
    });
  }
}

for (const id of CASE_STUDY_IDS) {
  test(`${id}: the version is the project's own, with the month it came out`, async ({ page }) => {
    await page.goto(caseStudyPath('it', id));
    const fact = page.locator('[data-fact="version"] dd');
    await expect(fact).toContainText(`${projectOf(id).version},`);
    await expect(fact).toContainText(/\d{4}$/);
  });

  test(`${id}: every screenshot is described and loads`, async ({ page }) => {
    const study = STUDIES[id];
    const items = study.copy.en.screens.items as Record<string, { alt: string; caption: string }>;
    await page.goto(caseStudyPath('en', id));
    const images = page.locator('main figure img');
    await expect(images).toHaveCount(study.screens.length);

    for (const [index, screen] of study.screens.entries()) {
      const image = images.nth(index);
      await expect(image).toHaveAttribute('alt', items[screen.id].alt);
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0))
        .toBe(true);
      await expect(page.locator('main figure:has(img) figcaption').nth(index)).toHaveText(items[screen.id].caption);
    }
  });

  test(`${id}: the accordion links to the case study, and the page leads back to the projects view`, async ({ page }) => {
    const name = projectOf(id).name;
    await gotoView(page, 'it', 'projects');
    await page.getByRole('button', { name: new RegExp(name) }).click();
    await page.locator(`#project-${id}`).getByRole('link', { name: locales.it.projects.labels.caseStudy }).click();

    await expect(page).toHaveURL(new RegExp(`${caseStudyPath('it', id)}$`));
    await expect(page.locator('h1')).toHaveText(name);

    await page.locator('main').getByRole('link', { name: STUDIES[id].copy.it.back }).click();
    await expect(page).toHaveURL(new RegExp(`${pathFor('it', 'projects')}$`));
    await expectView(page, 'it', 'projects');
  });
}

test('the way back stays on screen however far the page is scrolled', async ({ page }) => {
  await page.goto(caseStudyPath('it', 'yourfinance'));
  const back = page.locator('header a[data-back]');
  await expect(back).toBeInViewport();
  await expect(back).toHaveAttribute('href', pathFor('it', 'projects'));

  // Halfway down and at the very end: the header does not scroll with the page.
  const main = page.locator('main');
  for (const fraction of [0.5, 1]) {
    await main.evaluate((element, part) => element.scrollTo(0, element.scrollHeight * part), fraction);
    await expect(back).toBeInViewport();
  }

  await back.click();
  await expect(page).toHaveURL(new RegExp(`${pathFor('it', 'projects')}$`));
  await expectView(page, 'it', 'projects');
});

test('the header link names where it leads, in full where there is room', async ({ page, isMobile }) => {
  await page.goto(caseStudyPath('en', 'yourfinance'));
  const back = page.locator('header a[data-back]');
  await expect(back).toHaveAccessibleName(isMobile ? locales.en.ui.nav.projects : yourfinance.copy.en.back);
});

test('only projects with a case study link to one', async ({ page }) => {
  await gotoView(page, 'en', 'projects');
  await expect(page.locator('a[data-case-study]')).toHaveCount(CASE_STUDY_IDS.length);
  for (const id of CASE_STUDY_IDS) await expect(page.locator(`#project-${id} a[data-case-study]`)).toHaveCount(1);
});

test('browser back from the case study returns to the view it was opened from', async ({ page }) => {
  // The view was reached by a keypress, so its history entry was pushed without a navigation.
  await gotoView(page, 'en', 'hero');
  await page.keyboard.press('4');
  await expectView(page, 'en', 'projects');
  await page.getByRole('button', { name: /yourFinance/ }).click();
  await page.locator('#project-yourfinance').getByRole('link', { name: locales.en.projects.labels.caseStudy }).click();
  await expect(page.locator('h1')).toHaveText('yourFinance');

  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`${pathFor('en', 'projects')}$`));
  await expectView(page, 'en', 'projects');
});

test('the language links keep the reader on the case study', async ({ page }) => {
  await page.goto(caseStudyPath('en', 'yourfinance'));
  const languages = page.getByRole('navigation', { name: locales.en.ui.locale.label });
  await expect(languages.getByRole('link', { name: 'EN' })).toHaveAttribute('aria-current', 'page');

  await languages.getByRole('link', { name: 'DE' }).click();
  await expect(page).toHaveURL(new RegExp(`${caseStudyPath('de', 'yourfinance')}$`));
  await expect(page.getByRole('heading', { level: 2, name: yourfinance.copy.de.problem.title })).toBeVisible();
});

test('a case study exists only under the projects view, and only for known projects', async ({ request }) => {
  expect((await request.get(`${pathFor('en', 'identity')}/yourfinance`)).status()).toBe(404);
  expect((await request.get(`${pathFor('en', 'projects')}/another-project`)).status()).toBe(404);
});

test('a link written in another language opens the case study in the address language', async ({ request }) => {
  const response = await request.get('/en/sistemi/yourfinance', { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers()['location']).toMatch(new RegExp(`${caseStudyPath('en', 'yourfinance')}$`));
});

test('an address without a language opens the case study in the reader language', async ({ browser }) => {
  // What the repository links to: the English slug, no locale.
  const context = await browser.newContext({ locale: 'it-IT', extraHTTPHeaders: { 'accept-language': 'it-IT,it;q=0.9' } });
  const page = await context.newPage();
  await serveExport(page);
  await page.goto('/systems/ariaer');
  await expect(page).toHaveURL(new RegExp(`${caseStudyPath('it', 'ariaer')}$`));
  await expect(page.locator('h1')).toHaveText('aria-er');
  await context.close();
});

test('the case study has its own share card', async ({ page, request }) => {
  await page.goto(caseStudyPath('fr', 'yourfinance'));
  const image = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(image).toContain(`${caseStudyPath('fr', 'yourfinance')}/opengraph-image`);
  const response = await request.get(new URL(image ?? '').pathname + new URL(image ?? '').search);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toBe('image/png');
});

for (const id of CASE_STUDY_IDS) {
  test(`${id}: no WCAG A/AA violations, and the page scrolls with the keyboard`, async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 600 });
    await page.goto(caseStudyPath('en', id));
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(violations.map((v) => `${v.id} (${v.nodes.length}): ${v.help}`)).toEqual([]);

    const main = page.locator('main');
    await main.focus();
    await page.keyboard.press('End');
    await expect.poll(() => main.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  });
}

test.describe('aria-er live results', () => {
  const copy = ariaer.copy.en.live;

  test('draws the charts from the export, with the date of the data', async ({ page }) => {
    await page.goto(caseStudyPath('en', 'ariaer'));
    const live = page.locator('[data-live="ready"]');
    await expect(live).toBeVisible();
    await expect(live.locator('[data-stale="false"]')).toContainText(/^Data of /);
    // Two stations of Bologna; the station without a municipality is left out.
    await expect(page.locator('[data-chart="exceedances"] rect')).toHaveCount(3);
    await expect(page.locator('[data-chart="exceedances"]')).toContainText('PORTA SAN FELICE');
    await expect(page.locator('[data-chart="exceedances"]')).not.toContainText('LM-PR');
    await expect(page.locator('[data-chart="exceedances"]')).toContainText(copy.exceedances.allowed.replace('{n}', '35'));
    await expect(page.locator('[data-chart="trend"] circle')).toHaveCount(3);
    await expect(page.getByRole('heading', { level: 3, name: copy.trend.title })).toBeVisible();
    await expect(live).toContainText(copy.credits);
    await expect(live.locator('a[data-open-data]')).toHaveAttribute('href', ariaer.live.page);
  });

  test('says when the data are older than two days', async ({ page }) => {
    await page.unrouteAll();
    await serveExport(page, { generatedAt: '2026-01-01T06:30:00+00:00' });
    await page.goto(caseStudyPath('it', 'ariaer'));
    await expect(page.locator('[data-stale="true"]')).toContainText('1 gennaio 2026');
  });

  test('keeps the page whole when the export cannot be reached', async ({ page }) => {
    await page.unrouteAll();
    await serveExport(page, { fail: true });
    await page.goto(caseStudyPath('en', 'ariaer'));
    await expect(page.locator('[data-live="error"]')).toHaveText(copy.error);
    await expect(page.locator('main figure img')).toHaveCount(ariaer.screens.length);
    await expect(page.getByRole('heading', { level: 2, name: ariaer.copy.en.screens.title })).toBeVisible();
  });

  test('is not shown on a case study without live results', async ({ page }) => {
    await page.goto(caseStudyPath('en', 'yourfinance'));
    await expect(page.locator('[data-live]')).toHaveCount(0);
  });
});
