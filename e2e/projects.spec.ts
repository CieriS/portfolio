import { expect, test } from '@playwright/test';
import { LOCALES } from '../lib/routes';
import { locales, shared } from './content';
import { expectView, gotoView, pathFor } from './helpers';

const copy = locales.en.projects;

test('a private project shows its highlights and never links to a repository', async ({ page }) => {
  await gotoView(page, 'en', 'projects');

  const panel = page.locator('#project-yourfinance');
  await page.getByRole('button', { name: /yourFinance/ }).click();
  await expect(panel.getByRole('heading', { name: copy.labels.highlights })).toBeVisible();
  await expect(panel.getByRole('listitem').filter({ hasText: copy.items.yourfinance.highlights[0] })).toBeVisible();

  await expect(panel.locator('a[href*="github.com"]')).toHaveCount(0);
  await expect(panel.getByRole('link', { name: copy.labels.private })).toHaveAttribute('href', pathFor('en', 'identity'));
});

test('the private source link swaps to the contacts view in place', async ({ page }) => {
  await gotoView(page, 'en', 'projects');
  await page.getByRole('button', { name: /yourFinance/ }).click();
  await page.locator('#project-yourfinance').getByRole('link', { name: copy.labels.private }).click();

  await expectView(page, 'en', 'identity');
  expect(new URL(page.url()).pathname).toBe(pathFor('en', 'identity'));
});

test('only public projects publish a codeRepository in the JSON-LD', async ({ page }) => {
  await page.goto(pathFor('en', 'projects'));
  const raw = await page.locator('script[type="application/ld+json"]').innerHTML();
  expect(raw).toContain('SoftwareSourceCode');
  expect(raw).toContain('"codeRepository":"https://github.com/CieriS/aria-er"');
  expect(raw.match(/codeRepository/g)).toHaveLength(1);
});

test('a public project links to its repository in a new tab', async ({ page }) => {
  await gotoView(page, 'en', 'projects');
  const panel = page.locator('#project-ariaer');
  await page.getByRole('button', { name: /aria-er/ }).click();
  const repo = panel.getByRole('link', { name: copy.labels.repo });
  await expect(repo).toHaveAttribute('href', 'https://github.com/CieriS/aria-er');
  await expect(repo).toHaveAttribute('target', '_blank');
});

test('a released version is shown, linked to its tag only where the code is public', async ({ page }) => {
  await gotoView(page, 'en', 'projects');

  await page.getByRole('button', { name: /aria-er/ }).click();
  const open = shared.projects.find((project) => project.id === 'ariaer');
  const release = page.locator('#project-ariaer [data-version] a');
  await expect(release).toHaveText(new RegExp(`v${open?.version}`));
  await expect(release).toHaveAttribute('href', `https://github.com/CieriS/aria-er/releases/tag/v${open?.version}`);

  await page.getByRole('button', { name: /yourFinance/ }).click();
  const closed = shared.projects.find((project) => project.id === 'yourfinance');
  await expect(page.locator('#project-yourfinance [data-version]')).toContainText(`v${closed?.version}`);
  await expect(page.locator('#project-yourfinance [data-version] a')).toHaveCount(0);
});

test('the served HTML carries every project in full, collapsed ones included', async ({ request }) => {
  // No browser, no JavaScript: this is what a crawler receives before rendering anything.
  const decode = (html: string) =>
    html
      .replace(/&#x27;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"');

  for (const locale of LOCALES) {
    const html = decode(await (await request.get(pathFor(locale, 'projects'))).text());
    for (const project of shared.projects) {
      const item = locales[locale].projects.items[project.id as keyof typeof copy.items];
      for (const text of [item.summary, item.bridge, ...item.highlights]) expect(html).toContain(text);
      if (project.source.visibility === 'public') expect(html).toContain(`<a href="${project.source.url}"`);
    }
  }
});

test('a collapsed project is inert until it is opened', async ({ page }) => {
  await gotoView(page, 'en', 'projects');
  const panel = page.locator('#project-ariaer');
  // The repository link itself: the panel also links to the release of the current version.
  const repo = panel.locator('a[href$="/aria-er"]');

  // In the DOM for crawlers, out of reach for keyboard and assistive tech.
  await expect(repo).toHaveCount(1);
  await expect(panel).toHaveAttribute('inert', '');
  const takesFocus = () =>
    repo.evaluate((link: HTMLElement) => {
      link.focus();
      return document.activeElement === link;
    });
  expect(await takesFocus()).toBe(false);

  await page.getByRole('button', { name: /aria-er/ }).click();
  await expect(panel).not.toHaveAttribute('inert');
  await expect(repo).toBeVisible();
  expect(await takesFocus()).toBe(true);

  await page.getByRole('button', { name: /aria-er/ }).click();
  await expect(panel).toHaveAttribute('inert', '');
  await expect(panel).toHaveCSS('height', '0px');
});

test('every project starts collapsed and opens one at a time', async ({ page }) => {
  await gotoView(page, 'en', 'projects');
  const buttons = page.locator('main button[aria-expanded]');
  await expect(buttons).toHaveCount(shared.projects.length);
  for (const button of await buttons.all()) await expect(button).toHaveAttribute('aria-expanded', 'false');
  for (const project of shared.projects) await expect(page.locator(`#project-${project.id}`)).toHaveAttribute('inert', '');

  await buttons.nth(0).click();
  await expect(buttons.nth(0)).toHaveAttribute('aria-expanded', 'true');
  await buttons.nth(1).click();
  await expect(buttons.nth(1)).toHaveAttribute('aria-expanded', 'true');
  await expect(buttons.nth(0)).toHaveAttribute('aria-expanded', 'false');
});

test('hovering a row moves only that row, and never dims the others', async ({ page, isMobile }) => {
  test.skip(isMobile, 'touch devices have no hover');
  await gotoView(page, 'en', 'projects');

  const rows = page.getByRole('main').locator('li:has(> h2)');
  const title = (index: number) => rows.nth(index).locator('h2 button > span').nth(1);
  await expect(rows).toHaveCount(shared.projects.length);

  // An open project is the one being read: pointing at another row must leave it untouched.
  await rows.nth(0).getByRole('button').click();
  await rows.nth(1).getByRole('button').hover();
  await expect(title(1)).not.toHaveCSS('translate', 'none');
  await expect(title(0)).toHaveCSS('translate', 'none');

  // Moving on, the row left behind settles back instead of staying half highlighted.
  await rows.nth(0).getByRole('button').hover();
  await expect(title(1)).toHaveCSS('translate', 'none');
  for (const row of await rows.all()) await expect(row).toHaveCSS('opacity', '1');
});

test('the home links each project: one click to aria-er, with its panel open', async ({ page }) => {
  await gotoView(page, 'en', 'hero');
  const link = page.getByRole('main').getByRole('link', { name: 'aria-er', exact: true });
  await expect(link).toHaveAttribute('href', `${pathFor('en', 'projects')}#ariaer`);

  await link.click();
  await expectView(page, 'en', 'projects');
  expect(new URL(page.url()).pathname + new URL(page.url()).hash).toBe(`${pathFor('en', 'projects')}#ariaer`);
  const toggle = page.getByRole('button', { name: /aria-er/ });
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(toggle).toBeFocused();
  // Only the project that was asked for: the other stays closed.
  await expect(page.getByRole('button', { name: /yourFinance/ })).toHaveAttribute('aria-expanded', 'false');

  // The panel named by the address is a starting point, not a lock.
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('the home links yourFinance to its case study', async ({ page }) => {
  await gotoView(page, 'it', 'hero');
  const link = page.getByRole('main').getByRole('link', { name: 'yourFinance', exact: true });
  await expect(link).toHaveAttribute('href', `${pathFor('it', 'projects')}/yourfinance`);
  await link.click();
  await expect(page).toHaveURL(/\/it\/sistemi\/yourfinance$/);
  await expect(page.locator('h1')).toHaveText('yourFinance');
});

test('an address that names a project opens that panel on load, and back returns to the home', async ({ page }) => {
  await page.goto(`${pathFor('fr', 'projects')}#ariaer`);
  await expect(page.getByRole('button', { name: /aria-er/ })).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#project-ariaer')).not.toHaveAttribute('inert');

  // An unknown fragment opens nothing.
  await page.goto(`${pathFor('fr', 'projects')}#nope`);
  await expect(page.getByRole('button', { name: /aria-er/ })).toHaveAttribute('aria-expanded', 'false');

  await gotoView(page, 'en', 'hero');
  await page.getByRole('main').getByRole('link', { name: 'aria-er', exact: true }).click();
  await expectView(page, 'en', 'projects');
  await page.goBack();
  await expectView(page, 'en', 'hero');
});
