import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { PUBLIC_ROUTES } from '../../src/content/routes';

const SCREENSHOTS = 'qa/batch-one';
test.beforeAll(async () => { await mkdir(SCREENSHOTS, { recursive: true }); });

test('guide steps retain visible numbering and readable list spacing', async ({ page }) => {
  await page.goto('/en/guides/beginner-guide');
  const steps = page.locator('.article-body > ol').first();
  await expect(steps).toHaveCSS('list-style-type', 'decimal');
  expect(await steps.evaluate((el) => parseFloat(getComputedStyle(el).paddingLeft))).toBeGreaterThanOrEqual(20);
  await expect(page.locator('.article-body > ul').first()).toHaveCSS('list-style-type', 'disc');
  expect(await steps.locator('li').nth(1).evaluate((el) => parseFloat(getComputedStyle(el).marginTop))).toBeGreaterThanOrEqual(8);
});

test('all visible breadcrumbs agree with the structured hierarchy', async ({ page }) => {
  for (const route of PUBLIC_ROUTES.filter((route) => route !== '/en')) {
    await page.goto(route);
    const items = await page.locator('nav[aria-label="Breadcrumb"] li').evaluateAll((nodes) => nodes.map((node) => ({
      name: node.textContent?.trim(),
      path: node.querySelector('a')?.getAttribute('href'),
    })));
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const schema = blocks.map((block) => JSON.parse(block)).find((block) => block['@type'] === 'BreadcrumbList');
    expect(schema.itemListElement).toEqual(items.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.name,
      item: `https://kotamon.com${item.path ?? route}`,
    })));
    await expect(page.locator('nav[aria-label="Breadcrumb"] [aria-current="page"]')).toHaveCount(1);
  }
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test(`batch-one pages and cards fit ${viewport.width}px with usable navigation`, async ({ page }) => {
    await page.setViewportSize(viewport);
    for (const route of ['/en', '/en/guides', '/en/guides/beginner-guide', '/en/guides/money', '/en/guides/upgrades', '/en/cards', '/en/guides/save-not-working']) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth), route).toBe(viewport.width);
      await page.screenshot({ path: `${SCREENSHOTS}/${route.slice(1).replaceAll('/', '-')}-${viewport.width}.png`, fullPage: true });
    }
    await page.goto('/en/guides');
    await page.screenshot({ path: `${SCREENSHOTS}/guides-top-${viewport.width}.png`, animations: 'disabled' });
    const cards = await page.locator('.guide-directory__card').evaluateAll((nodes) => nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom, action: node.querySelector('span')!.getBoundingClientRect().bottom };
    }));
    expect(cards).toHaveLength(16);
    for (let index = 1; index < cards.length; index++) {
      if (Math.abs(cards[index].top - cards[index - 1].top) < 1) {
        expect(Math.abs(cards[index].bottom - cards[index - 1].bottom)).toBeLessThan(1);
        expect(Math.abs(cards[index].action - cards[index - 1].action)).toBeLessThan(1);
      }
    }
    const first = page.locator('.guide-directory__card').first();
    await first.hover();
    await expect(first).toHaveCSS('text-decoration-line', 'none');
    await first.focus();
    await expect(first).toBeFocused();
    await first.press('Enter');
    await expect(page).toHaveURL(/\/en\/guides\/beginner-guide$/);
    await page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Guides', exact: true }).click();
    await expect(page).toHaveURL(/\/en\/guides$/);
    await page.getByRole('button', { name: 'Switch to dark theme' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.screenshot({ path: `${SCREENSHOTS}/guides-dark-${viewport.width}.png`, animations: 'disabled' });
    if (viewport.width === 390) {
      await page.getByRole('button', { name: 'Open navigation' }).click();
      const nav = page.getByRole('navigation', { name: 'Mobile navigation' });
      await expect(nav.getByRole('link', { name: 'Guides', exact: true })).toHaveAttribute('aria-current', 'page');
      await nav.getByRole('link', { name: 'Money', exact: true }).click();
      await expect(page).toHaveURL(/\/en\/guides\/money$/);
      await expect(page.getByRole('button', { name: 'Open navigation' })).toBeVisible();
    }
  });
}

test('public main-content links have no missing destinations or anchors', async ({ page, request }) => {
  const destinations = new Set<string>();
  for (const route of PUBLIC_ROUTES) {
    await page.goto(route);
    for (const href of await page.locator('main a[href]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')!))) {
      if (href.startsWith('/')) destinations.add(href);
    }
  }
  for (const href of destinations) {
    const url = new URL(href, 'http://127.0.0.1:3213');
    expect(PUBLIC_ROUTES, href).toContain(url.pathname);
    expect((await request.get(url.pathname)).status(), href).toBe(200);
    if (url.hash) {
      await page.goto(url.pathname);
      expect(await page.evaluate((id) => Boolean(document.getElementById(id)), decodeURIComponent(url.hash.slice(1))), href).toBe(true);
    }
  }
  for (const path of ['/en/guides/orders', '/en/mods', '/en/cheats']) {
    expect((await request.get(path)).status(), `${path} remains deferred`).toBe(404);
  }
});
