import { expect, test, type Locator } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const mixedRows = [
  ['about-kotamon-title', 0],
  ['home-cards-title', 0],
  ['home-artists-title', 0],
  ['home-collectibles-title', 0],
  ['home-collectibles-title', 1],
] as const;

async function box(locator: Locator) {
  const bounds = await locator.boundingBox();
  expect(bounds).not.toBeNull();
  return bounds!;
}

for (const width of [1440, 1024, 390]) {
  test(`homepage aligns mixed rows and card actions at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/en');
    await page.evaluate(() => document.fonts.ready);
    for (const image of await page.locator('main img').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    }
    for (const [id, index] of mixedRows) {
      const row = page.locator(`#${id}`).locator('..').locator(':scope > div.grid').nth(index);
      const first = await box(row.locator(':scope > *').nth(0));
      const second = await box(row.locator(':scope > *').nth(1));
      if (width >= 1024) {
        expect.soft(Math.abs(first.y + first.height / 2 - second.y - second.height / 2), `${id} row ${index} vertical centers`).toBeLessThan(2);
      } else {
        expect.soft(second.y - first.y - first.height, `${id} mobile stack gap`).toBeGreaterThanOrEqual(20);
      }
    }
    if (width >= 1024) {
      const cards = page.locator('#home-cards-title').locator('..').locator(':scope > div.grid').nth(1).locator(':scope > figure');
      const a = await box(cards.nth(0));
      const b = await box(cards.nth(1));
      expect.soft(Math.abs(a.y + a.height - b.y - b.height), 'paired image-card bottoms').toBeLessThan(2);
      const actionA = await box(cards.nth(0).locator('figcaption').getByRole('link').first());
      const actionB = await box(cards.nth(1).locator('figcaption').getByRole('link').first());
      expect.soft(Math.abs(actionA.y + actionA.height - actionB.y - actionB.height), 'image-card action bottoms').toBeLessThan(2);
      const demo = await box(page.getByRole('link', { name: 'Check demo availability on Steam' }));
      const download = await box(page.getByText('Open KOTAMON on Steam', { exact: true }));
      expect.soft(Math.abs(demo.y + demo.height - download.y - download.height), 'download action bottoms').toBeLessThan(2);
      const guides = page.locator('#latest-guides-title').locator('..').locator('article');
      for (let i = 0; i < 6; i += 2) {
        const left = await box(guides.nth(i).getByRole('link', { name: /^Read guide:/ }));
        const right = await box(guides.nth(i + 1).getByRole('link', { name: /^Read guide:/ }));
        expect.soft(Math.abs(left.y + left.height - right.y - right.height), `guide row ${i / 2} action bottoms`).toBeLessThan(2);
      }
    }
    for (const guide of await page.locator('#latest-guides-title').locator('..').locator('article').all()) {
      const date = await box(guide.locator('.updated-at'));
      const action = await box(guide.getByRole('link', { name: /^Read guide:/ }));
      expect.soft(action.y - date.y - date.height, 'guide date and action have separate lines').toBeGreaterThanOrEqual(8);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    const evidence = 'qa/alignment-2026-08-28';
    await mkdir(evidence, { recursive: true });
    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
      for (const id of ['about-kotamon-title', 'home-cards-title', 'home-artists-title', 'home-collectibles-title', 'home-download-title', 'latest-guides-title']) {
        await page.locator(`#${id}`).locator('..').screenshot({ path: `${evidence}/${id}-${width}-${theme}.png`, animations: 'disabled', style: 'header, .skip-link { visibility: hidden !important; }' });
      }
    }
  });
}
