import { expect, test } from '@playwright/test';

const AD_SCRIPT =
  'https://pl31104288.profitableratecpmnetwork.com/10de3692fca1aa56ca3ff0485ea3e9e6/invoke.js';
const AD_CONTAINER = '#container-10de3692fca1aa56ca3ff0485ea3e9e6';

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`keeps the native ad stable and singular across navigation at ${viewport.width}px`, async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    let releaseScript = () => {};
    const scriptGate = new Promise<void>((resolve) => {
      releaseScript = resolve;
    });

    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => consoleErrors.push(error.message));
    await page.addInitScript(() => {
      const state = { cls: 0, loads: 0 };
      Object.assign(window, { adsterraQa: state });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & {
            hadRecentInput: boolean;
            value: number;
          };
          if (!shift.hadRecentInput) state.cls += shift.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.route(AD_SCRIPT, async (route) => {
      await scriptGate;
      await route.fulfill({
        body: `
window.adsterraQa.loads += 1;
document.querySelector('${AD_CONTAINER}').innerHTML = '<div data-provider-ad style="height:400px"></div>';
`,
        contentType: 'application/javascript',
        status: 200,
      });
    });

    await page.setViewportSize(viewport);
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    const ad = page.locator('[data-adsterra-native]');
    const slot = page.locator(AD_CONTAINER);
    const assertPlacement = async () => {
      await expect(ad).toHaveCount(1);
      await expect(slot).toHaveCount(1);
      expect((await ad.boundingBox())?.y ?? 0).toBeGreaterThan(viewport.height);
      const main = page.locator('main');
      expect(await main.evaluate((node) => node.nextElementSibling?.hasAttribute('data-adsterra-native'))).toBe(true);
      expect(await ad.evaluate((node) => node.nextElementSibling?.tagName)).toBe('FOOTER');
    };

    await assertPlacement();
    await expect(ad).toHaveAttribute('data-ad-state', 'empty');
    await expect(ad.locator('.native-ad__label')).toHaveCount(0);
    expect((await ad.boundingBox())?.height ?? 0).toBeLessThanOrEqual(1);

    releaseScript();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as typeof window & {
              adsterraQa: { loads: number };
            }).adsterraQa.loads,
        ),
      )
      .toBe(1);
    await expect(page.locator('[data-provider-ad]')).toHaveCount(1);
    await expect(ad).toHaveAttribute('data-ad-state', 'filled');
    await expect(ad.locator('.native-ad__label')).toHaveText('Advertisement');
    expect((await ad.boundingBox())?.height ?? 0).toBeGreaterThan(400);
    await page.locator('main a[href="/en/guides"]').first().click();
    await expect(page).toHaveURL(/\/en\/guides$/);
    await assertPlacement();
    await page.locator('main a[href="/en/guides/beginner-guide"]').first().click();
    await expect(page).toHaveURL(/\/en\/guides\/beginner-guide$/);
    await assertPlacement();
    expect(await page.locator(`script[src="${AD_SCRIPT}"]`).count()).toBe(1);
    await expect(page.locator(AD_CONTAINER)).toHaveCount(1);
    expect(
      await page.evaluate(
        () =>
          (window as typeof window & {
            adsterraQa: { cls: number; loads: number };
          }).adsterraQa,
      ),
    ).toMatchObject({ loads: 1 });
    const cls = await page.evaluate(
      () =>
        (window as typeof window & {
          adsterraQa: { cls: number };
        }).adsterraQa.cls,
    );
    expect(cls).toBeLessThan(0.1);
    expect(consoleErrors).toEqual([]);

    await page.goto('/en/game/artists', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/en\/game\/artists$/);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as typeof window & {
              adsterraQa: { loads: number };
            }).adsterraQa.loads,
        ),
      )
      .toBe(1);
    await assertPlacement();
    const artistsCls = await page.evaluate(
      () =>
        (
          window as typeof window & {
            adsterraQa: { cls: number };
          }
        ).adsterraQa.cls,
    );
    expect(artistsCls).toBeLessThan(0.1);
    expect(await page.locator(`script[src="${AD_SCRIPT}"]`).count()).toBe(1);
    expect(consoleErrors).toEqual([]);
  });
}

test('collapses the entire native ad region when the provider returns no creative', async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  await page.route(AD_SCRIPT, (route) =>
    route.fulfill({
      body: `
const container = document.querySelector('${AD_CONTAINER}');
container.innerHTML = [
  '<script data-provider-loader type="application/json">{}</script>',
  '<div data-provider-hidden hidden></div>',
  '<div data-provider-placeholder style="height:0;width:0"></div>',
].join('');
`,
      contentType: 'application/javascript',
      status: 200,
    }),
  );

  await page.goto('/en', { waitUntil: 'networkidle' });

  const ad = page.locator('[data-adsterra-native]');
  await expect(ad).toHaveAttribute('data-ad-state', 'empty');
  await expect(ad.locator('.native-ad__label')).toHaveCount(0);
  await expect(page.locator('[data-provider-loader]')).toHaveCount(1);
  await expect(page.locator('[data-provider-hidden]')).toHaveCount(1);
  await expect(page.locator('[data-provider-placeholder]')).toHaveCount(1);
  expect((await ad.boundingBox())?.height ?? 0).toBeLessThanOrEqual(1);

  await page.locator('main a[href="/en/guides"]').first().click();
  await expect(page).toHaveURL(/\/en\/guides$/);
  await expect(ad).toHaveAttribute('data-ad-state', 'empty');
  expect((await ad.boundingBox())?.height ?? 0).toBeLessThanOrEqual(1);
  expect(await page.locator(`script[src="${AD_SCRIPT}"]`).count()).toBe(1);
  await expect(page.locator(AD_CONTAINER)).toHaveCount(1);
  expect(consoleErrors).toEqual([]);
});
