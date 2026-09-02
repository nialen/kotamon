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

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`places the delayed secret-location ad after the quick answer at ${viewport.width}px`, async ({
    page,
  }) => {
    const errors: string[] = [];
    let releaseScript = () => {};
    const scriptGate = new Promise<void>((resolve) => {
      releaseScript = resolve;
    });
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.route(AD_SCRIPT, async (route) => {
      await scriptGate;
      await route.fulfill({
        body: `
const container = document.querySelector('${AD_CONTAINER}');
container.innerHTML = '<div data-provider-ad style="height:400px"></div>';
`,
        contentType: 'application/javascript',
        status: 200,
      });
    });

    await page.setViewportSize(viewport);
    await page.goto('/en/guides/secret-location', {
      waitUntil: 'domcontentloaded',
    });

    const ad = page.locator('[data-adsterra-native]');
    const slot = page.locator('[data-secret-location-ad-slot]');
    await expect(ad).toHaveCount(1);
    await expect(page.locator(AD_CONTAINER)).toHaveCount(1);
    await expect(slot.locator(':scope > [data-adsterra-native]')).toHaveCount(1);
    expect(
      await slot.evaluate((node) =>
        node.previousElementSibling?.classList.contains('article-header'),
      ),
    ).toBe(true);
    expect(
      await slot.evaluate((node) =>
        node.nextElementSibling?.classList.contains('article-layout__content'),
      ),
    ).toBe(true);
    await expect(ad).toHaveAttribute('data-ad-state', 'empty');
    await expect(ad.locator('.native-ad__label')).toHaveCount(0);
    expect((await ad.boundingBox())?.height ?? 0).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
      viewport.width,
    );

    await page.waitForTimeout(2_000);
    await expect(ad).toHaveAttribute('data-ad-state', 'empty');
    expect((await ad.boundingBox())?.height ?? 0).toBeLessThanOrEqual(1);

    releaseScript();
    await expect(page.locator('[data-provider-ad]')).toHaveCount(1);
    await expect(ad).toHaveAttribute('data-ad-state', 'filled');
    await expect(ad.locator('.native-ad__label')).toHaveText('Advertisement');
    expect((await ad.boundingBox())?.height ?? 0).toBeGreaterThan(400);

    await page.locator(AD_CONTAINER).evaluate((container) =>
      container.replaceChildren(),
    );
    await expect(ad).toHaveAttribute('data-ad-state', 'filled');
    await expect(ad.locator('.native-ad__label')).toHaveText('Advertisement');
    expect(await page.locator(`script[src="${AD_SCRIPT}"]`).count()).toBe(1);
    expect(await page.locator(AD_CONTAINER).count()).toBe(1);
    expect(errors).toEqual([]);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(slot.locator(':scope > [data-adsterra-native]')).toHaveCount(1);
    await expect(page.locator(`script[src="${AD_SCRIPT}"]`)).toHaveCount(1);
    expect(await page.locator(AD_CONTAINER).count()).toBe(1);
    expect(errors).toEqual([]);
  });
}

test('preserves the loaded ad while SPA navigation moves it into the secret article', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.assign(window, { adsterraSpaLoads: 0 });
  });
  await page.route(AD_SCRIPT, (route) =>
    route.fulfill({
      body: `
window.adsterraSpaLoads += 1;
const container = document.querySelector('${AD_CONTAINER}');
container.innerHTML = '<div data-provider-ad data-instance="stable" style="height:400px"></div>';
`,
      contentType: 'application/javascript',
      status: 200,
    }),
  );

  await page.goto('/en/guides', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-provider-ad][data-instance="stable"]')).toHaveCount(1);
  await page.locator('main a[href="/en/guides/secret-location"]').first().click();
  await expect(page).toHaveURL(/\/en\/guides\/secret-location$/);

  const slot = page.locator('[data-secret-location-ad-slot]');
  await expect(slot.locator(':scope > [data-adsterra-native]')).toHaveCount(1);
  await expect(page.locator('[data-provider-ad][data-instance="stable"]')).toHaveCount(1);
  expect(await page.evaluate(() => (window as typeof window & { adsterraSpaLoads: number }).adsterraSpaLoads)).toBe(1);
  expect(await page.locator(`script[src="${AD_SCRIPT}"]`).count()).toBe(1);
  expect(await page.locator(AD_CONTAINER).count()).toBe(1);
  expect(errors).toEqual([]);
});

test('keeps the secret-location wrapper collapsed when the provider returns no fill', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route(AD_SCRIPT, (route) =>
    route.fulfill({
      body: `
const container = document.querySelector('${AD_CONTAINER}');
container.innerHTML = '<div data-provider-placeholder style="height:0;width:0"></div>';
`,
      contentType: 'application/javascript',
      status: 200,
    }),
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/guides/secret-location', { waitUntil: 'networkidle' });
  const ad = page.locator('[data-adsterra-native]');
  await expect(ad).toHaveAttribute('data-ad-state', 'empty');
  await expect(ad.locator('.native-ad__label')).toHaveCount(0);
  expect((await ad.boundingBox())?.height ?? 0).toBeLessThanOrEqual(1);
  expect(await page.locator('[data-adsterra-native]').count()).toBe(1);
  expect(await page.locator(AD_CONTAINER).count()).toBe(1);
  expect(await page.locator(`script[src="${AD_SCRIPT}"]`).count()).toBe(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  expect(errors).toEqual([]);
});
