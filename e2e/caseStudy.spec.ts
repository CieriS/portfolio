import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import study from '../data/case-studies/yourfinance.json';
import { caseStudyPath, LOCALES } from '../lib/routes';
import { locales } from './content';
import { CASE_STUDY_PAGES, expectView, gotoView, pathFor } from './helpers';

/**
 * The yourFinance case study: a prerendered page below the projects view. The project is
 * private, so the tests that matter most are the ones that find no way to its repository.
 */
for (const { locale, path } of CASE_STUDY_PAGES) {
  const copy = study.copy[locale];

  test(`${path} is prerendered with its own heading, metadata and alternates`, async ({ page, request, baseURL }) => {
    // Served HTML, before any script: what a crawler reads.
    const html = await (await request.get(path)).text();
    expect(html).toContain(copy.problem.title);
    expect(html).toContain(copy.decisions.items.postings.title.replace(/'/g, '&#x27;'));

    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('yourFinance');
    await expect(page).toHaveTitle(new RegExp(`^${copy.meta.title}`));
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', copy.meta.description);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${baseURL}${path}`);
    for (const other of LOCALES) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${other}"]`)).toHaveAttribute(
        'href',
        `${baseURL}${caseStudyPath(other, 'yourfinance')}`,
      );
    }
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
      'href',
      `${baseURL}${caseStudyPath('en', 'yourfinance')}`,
    );
  });

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
}

test('every screenshot is described and loads', async ({ page }) => {
  await page.goto(caseStudyPath('en', 'yourfinance'));
  const images = page.locator('main figure img');
  await expect(images).toHaveCount(study.screens.length);

  for (const [index, screen] of study.screens.entries()) {
    const image = images.nth(index);
    const item = study.copy.en.screens.items[screen.id as keyof typeof study.copy.en.screens.items];
    await expect(image).toHaveAttribute('alt', item.alt);
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0))
      .toBe(true);
    await expect(page.locator('main figure figcaption').nth(index)).toHaveText(item.caption);
  }
});

test('the accordion links to the case study, and the page leads back to the projects view', async ({ page }) => {
  await gotoView(page, 'it', 'projects');
  await page.getByRole('button', { name: /yourFinance/ }).click();
  await page.locator('#project-yourfinance').getByRole('link', { name: locales.it.projects.labels.caseStudy }).click();

  await expect(page).toHaveURL(new RegExp(`${caseStudyPath('it', 'yourfinance')}$`));
  await expect(page.locator('h1')).toHaveText('yourFinance');

  await page.locator('main').getByRole('link', { name: study.copy.it.back }).click();
  await expect(page).toHaveURL(new RegExp(`${pathFor('it', 'projects')}$`));
  await expectView(page, 'it', 'projects');
});

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
  await expect(back).toHaveAccessibleName(isMobile ? locales.en.ui.nav.projects : study.copy.en.back);
});

test('only projects with a case study link to one', async ({ page }) => {
  await gotoView(page, 'en', 'projects');
  await expect(page.locator('a[data-case-study]')).toHaveCount(1);
  await expect(page.locator('#project-ariaer a[data-case-study]')).toHaveCount(0);
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
  await expect(page.getByRole('heading', { level: 2, name: study.copy.de.problem.title })).toBeVisible();
});

test('a case study exists only under the projects view, and only for known projects', async ({ request }) => {
  expect((await request.get(`${pathFor('en', 'identity')}/yourfinance`)).status()).toBe(404);
  expect((await request.get(`${pathFor('en', 'projects')}/ariaer`)).status()).toBe(404);
  // The Italian slug is not valid under the English locale.
  expect((await request.get('/en/sistemi/yourfinance')).status()).toBe(404);
});

test('the case study has its own share card', async ({ page, request }) => {
  await page.goto(caseStudyPath('fr', 'yourfinance'));
  const image = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(image).toContain(`${caseStudyPath('fr', 'yourfinance')}/opengraph-image`);
  const response = await request.get(new URL(image ?? '').pathname + new URL(image ?? '').search);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toBe('image/png');
});

test('the case study has no WCAG A/AA violations and scrolls with the keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 600 });
  await page.goto(caseStudyPath('en', 'yourfinance'));
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(violations.map((v) => `${v.id} (${v.nodes.length}): ${v.help}`)).toEqual([]);

  const main = page.locator('main');
  await main.focus();
  await page.keyboard.press('End');
  await expect.poll(() => main.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
});
