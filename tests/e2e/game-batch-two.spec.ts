import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const directory = 'qa/batch-two';
const routes = ['/en/collectibles', '/en/game', '/en/game/system-requirements', '/en/updates'];

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test(`batch-two hubs, requirements and updates are usable at ${viewport.width}px`, async ({ page }) => {
    await mkdir(directory, { recursive: true });
    await page.setViewportSize(viewport);
    for (const route of routes) {
      expect((await page.goto(route))?.status()).toBe(200);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth), route).toBe(viewport.width);
      const cards = await page.locator('.guide-directory__card').evaluateAll((nodes) => nodes.map((node) => ({
        top: node.getBoundingClientRect().top,
        bottom: node.getBoundingClientRect().bottom,
        action: node.querySelector('span')!.getBoundingClientRect().bottom,
      })));
      for (let index = 1; index < cards.length; index++) {
        if (Math.abs(cards[index].top - cards[index - 1].top) < 1) {
          expect(Math.abs(cards[index].bottom - cards[index - 1].bottom)).toBeLessThan(1);
          expect(Math.abs(cards[index].action - cards[index - 1].action)).toBeLessThan(1);
        }
      }
      await page.screenshot({ path: `${directory}/${route.slice(1).replaceAll('/', '-')}-${viewport.width}.png`, fullPage: true });
    }
    await page
      .getByRole('navigation', { name: 'Table of contents' })
      .getByRole('link', { name: 'August 27: card exchanges and fixes' })
      .click();
    await expect(page).toHaveURL(/#august-27-2026$/);
    await expect(page.locator('#august-27-2026')).toBeInViewport();
    await page.goto('/en/game/system-requirements');
    const table = page.getByRole('table', { name: 'KOTAMON Windows requirements listed on Steam' });
    await expect(table.getByRole('columnheader')).toHaveCount(3);
    await expect(table.getByRole('row')).toHaveCount(7);
    const recommended = table.getByRole('columnheader', { name: 'Recommended', exact: true });
    expect(await recommended.evaluate((node) => {
      const range = document.createRange();
      range.selectNodeContents(node);
      return range.getClientRects().length;
    }), 'Recommended should not split into an orphan letter').toBe(1);
    expect(await table.evaluate((node) => node.scrollWidth <= node.getBoundingClientRect().width + 1)).toBe(true);
    await table.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${directory}/requirements-table-${viewport.width}.png` });
    await page.evaluate(() => window.scrollBy({ top: -80, behavior: 'instant' }));
    await page.getByRole('button', { name: 'Switch to dark theme' }).click();
    await page.screenshot({ path: `${directory}/requirements-dark-${viewport.width}.png` });
    if (viewport.width === 390) {
      await page.getByRole('button', { name: 'Open navigation' }).click();
      const nav = page.getByRole('navigation', { name: 'Mobile navigation' });
      await expect(nav.locator('[aria-current="page"]')).toHaveText('System Requirements');
      await nav.getByRole('link', { name: 'Collectibles', exact: true }).click();
      await expect(page).toHaveURL(/\/en\/collectibles$/);
    }
  });
}

test('hub cards support keyboard travel and return to their editorial parent', async ({ page }) => {
  await page.goto('/en/collectibles');
  const secret = page.locator('.guide-directory__card[href="/en/guides/secret-location"]');
  await secret.focus();
  await expect(secret).toBeFocused();
  await secret.press('Enter');
  await expect(page).toHaveURL(/\/en\/guides\/secret-location$/);
  await page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Collectibles', exact: true }).click();
  await expect(page).toHaveURL(/\/en\/collectibles$/);
  await page.goto('/en/game');
  const updates = page.locator('.guide-directory__card[href="/en/updates"]');
  await updates.hover();
  await expect(updates).toHaveCSS('text-decoration-line', 'none');
  await updates.click();
  await expect(page).toHaveURL(/\/en\/updates$/);
  await page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Game', exact: true }).click();
  await expect(page).toHaveURL(/\/en\/game$/);
});
