import { expect, test, type Locator } from '@playwright/test';

async function hasNoUnderline(link: Locator) {
  await link.hover();
  expect(await link.evaluate((el) => [el, ...el.querySelectorAll('*')].some((node) => getComputedStyle(node).textDecorationLine.includes('underline')))).toBe(false);
}

test('hover removes link underlines without clearing the selected navigation state', async ({ page }) => {
  await page.goto('/en');
  for (const link of [
    page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Cards', exact: true }),
    page.getByRole('link', { name: 'Learn the gameplay loop' }),
    page.locator('#task-grid-title').locator('..').getByRole('link').first(),
    page.locator('#latest-guides-title').locator('..').locator('h3 a').first(),
    page.getByRole('navigation', { name: 'Footer navigation' }).getByRole('link').first(),
  ]) await hasNoUnderline(link);
  await page.mouse.move(0, 0);
  await page.evaluate(() => { for (const animation of document.getAnimations()) animation.finish(); });
  const guideTitle = page.locator('#latest-guides-title').locator('..').locator('h3 a').first();
  const readableColor = await guideTitle.evaluate((el) => getComputedStyle(el).color);
  await guideTitle.hover();
  await page.evaluate(() => { for (const animation of document.getAnimations()) animation.finish(); });
  expect(await guideTitle.evaluate((el) => getComputedStyle(el).color)).toBe(readableColor);
  await page.goto('/en/cards');
  const selected = page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Cards', exact: true });
  await hasNoUnderline(selected);
  await expect(selected).toHaveAttribute('aria-current', 'page');
  expect(await selected.evaluate((a) => getComputedStyle(a).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await hasNoUnderline(page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Cards', exact: true }));
});
