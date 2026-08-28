import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const evidenceDir = 'qa/images-navigation-2026-08-28';
const cases = [
  ['/en/guides', 'Guides'],
  ['/en/guides/gameplay', 'Guides'],
  ['/en/guides/save-not-working', 'Guides'],
  ['/en/guides/beginner-guide', 'Guides'],
  ['/en/guides/money', 'Guides'],
  ['/en/guides/upgrades', 'Guides'],
  ['/en/collectibles', 'Collectibles'],
  ['/en/game', 'Game'],
  ['/en/game/system-requirements', 'Game'],
  ['/en/updates', 'Game'],
  ['/en/cards', 'Cards'],
  ['/en/guides/card-repair', 'Cards'],
  ['/en/guides/foil-cards', 'Cards'],
  ['/en/guides/cereal-boxes', 'Cards'],
  ['/en/collectibles/figurines', 'Collectibles'],
  ['/en/collectibles/audiotapes', 'Collectibles'],
  ['/en/guides/secret-location', 'Collectibles'],
  ['/en/achievements', 'Achievements'],
  ['/en/game/where-to-play', 'Game'],
  ['/en/game/artists', 'Game'],
] as const;

test('desktop navigation follows all article sections and keeps the homepage neutral', async ({ page }) => {
  await mkdir(evidenceDir, { recursive: true });
  for (const [route, label] of cases) {
    await page.goto(route);
    const nav = page.getByRole('navigation', { name: 'Primary navigation' });
    await expect(nav.locator('.primary-nav__section-link[aria-current]')).toHaveCount(1);
    await expect(nav.locator('.primary-nav__section-link[aria-current]')).toHaveText(label);
    const selected = nav.getByRole('link', { name: label, exact: true });
    expect(await selected.evaluate((a) => getComputedStyle(a).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
  }
  await page.screenshot({ path: `${evidenceDir}/desktop-game-selected.png`, animations: 'disabled' });
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await page.screenshot({ path: `${evidenceDir}/desktop-game-selected-dark.png`, animations: 'disabled' });
  await page.goto('/en');
  await expect(page.getByRole('navigation', { name: 'Primary navigation' }).locator('[aria-current]')).toHaveCount(0);
});

test('mobile menu selects only the current page and preserves keyboard dismissal', async ({ page }) => {
  await mkdir(evidenceDir, { recursive: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/guides/foil-cards');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  const nav = page.getByRole('navigation', { name: 'Mobile navigation' });
  await expect(nav.locator('[aria-current="page"]')).toHaveText('Foil Cards');
  await expect(nav.locator('[aria-current]')).toHaveCount(1);
  await page.screenshot({ path: `${evidenceDir}/mobile-foil-selected.png`, animations: 'disabled' });
  await nav.getByRole('button', { name: 'Toggle Game submenu' }).click();
  await nav.getByRole('link', { name: 'Artists' }).click();
  await expect(page).toHaveURL(/\/en\/game\/artists$/);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(nav.locator('[aria-current="page"]')).toHaveText('Artists');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.screenshot({ path: `${evidenceDir}/mobile-artists-selected-dark.png`, animations: 'disabled' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});
