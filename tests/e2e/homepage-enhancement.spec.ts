import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import { PUBLIC_ROUTES } from '../../src/content/routes';

const evidenceDir = path.resolve('qa/homepage-2026-08-28');

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test(`enhanced homepage preserves SEO and renders real assets at ${viewport.width}px`, async ({ page, request }) => {
    test.setTimeout(90_000);
    await mkdir(evidenceDir, { recursive: true });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.addInitScript(() => {
      const metrics = { cls: 0, lcp: 0 };
      Object.assign(window, { homepageMetrics: metrics });
      let sessionValue = 0;
      let sessionStart = 0;
      let lastShift = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
          if (shift.hadRecentInput) continue;
          if (shift.startTime - lastShift > 1000 || shift.startTime - sessionStart > 5000) {
            sessionValue = 0;
            sessionStart = shift.startTime;
          }
          sessionValue += shift.value;
          lastShift = shift.startTime;
          metrics.cls = Math.max(metrics.cls, sessionValue);
        }
      }).observe({ type: 'layout-shift', buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) metrics.lcp = entry.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    });
    await page.setViewportSize(viewport);
    const response = await page.goto('/en', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('main h1')).toHaveText('KOTAMON Wiki & Guide');
    await expect(page).toHaveTitle('KOTAMON Wiki & Guide: Cards, Achievements & More');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://kotamon.com/en');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'Explore KOTAMON cards, achievements, collectibles, gameplay tips, secret locations, and troubleshooting in this independent fan-made wiki and guide.');

    const hero = page.getByRole('img', { name: /^KOTAMON gameplay/ });
    await expect(hero).toHaveAttribute('loading', 'eager');
    await expect(hero).toHaveAttribute('fetchpriority', 'high');
    const cta = page.getByRole('link', { name: 'Start with gameplay', exact: true });
    await expect(cta).toBeInViewport();
    await page.screenshot({ path: path.join(evidenceDir, `hero-${viewport.width}.png`) });

    await expect(page.locator('main figure img')).toHaveCount(8);
    for (const image of await page.locator('main img').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
      expect(await image.getAttribute('alt')).toBeTruthy();
      const ratioError = await image.evaluate((element: HTMLImageElement) => Math.abs(element.getBoundingClientRect().width / element.getBoundingClientRect().height - element.naturalWidth / element.naturalHeight));
      expect(ratioError).toBeLessThan(0.01);
    }

    const hrefs = await page.locator('main a').evaluateAll((links) => [...new Set(links.map((link) => link.getAttribute('href') ?? ''))]);
    expect(hrefs).not.toContain('');
    expect(hrefs).not.toContain('#');
    for (const href of hrefs.filter((href) => href.startsWith('/'))) {
      expect(PUBLIC_ROUTES).toContain(href);
      expect((await request.get(href)).status(), href).toBe(200);
    }
    for (const route of ['/en/game/artists', '/en/guides/secret-location', '/en/collectibles/figurines', '/en/achievements']) {
      expect(hrefs).toContain(route);
    }
    await expect(page.locator('#latest-guides-title').locator('..').locator('article')).toHaveCount(6);
    const faq = page.locator('details').filter({ has: page.getByText('Who are the KOTAMON artists?', { exact: true }) });
    await faq.locator('summary').click();
    await expect(faq).toHaveAttribute('open', '');
    await expect(faq.locator('p')).toContainText('do not establish a complete list');
    await faq.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(faq).not.toHaveAttribute('open', '');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    await page.screenshot({ path: path.join(evidenceDir, `full-${viewport.width}.png`), fullPage: true });
    for (const id of ['about-kotamon-title', 'home-cards-title', 'home-artists-title', 'home-download-title', 'home-collectibles-title', 'home-faq-title']) {
      // Hide fixed UI only for section crops; full-page evidence stays unmodified.
      await page.locator(`#${id}`).locator('..').screenshot({
        path: path.join(evidenceDir, `${id}-${viewport.width}.png`),
        style: 'header, .skip-link { visibility: hidden !important; }',
      });
    }
    await page.getByRole('button', { name: 'Switch to dark theme' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: path.join(evidenceDir, `dark-${viewport.width}.png`), fullPage: true, animations: 'disabled' });
    const metrics = await page.evaluate(() => (window as typeof window & { homepageMetrics: { cls: number; lcp: number } }).homepageMetrics);
    console.log(`HOME_QA ${viewport.width}: ${JSON.stringify({ ...metrics, errors, internalLinks: hrefs.filter((href) => href.startsWith('/')).length })}`);
    expect(metrics.cls).toBeLessThan(0.1);
    expect(errors).toEqual([]);
  });
}
