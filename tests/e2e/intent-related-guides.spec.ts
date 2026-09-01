import { expect, test, type Page } from '@playwright/test';

type CapturedGtagCall = {
  command: string;
  eventName: string;
  parameters: Record<string, string>;
};

type InstrumentedWindow = Window & {
  __relatedGuideGtagCalls?: CapturedGtagCall[];
};

const consoleErrors = new WeakMap<Page, string[]>();

test.beforeEach(({ page }) => {
  const errors: string[] = [];
  consoleErrors.set(page, errors);
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
});

test.afterEach(({ page }) => {
  expect(consoleErrors.get(page), 'page console errors').toEqual([]);
});

test('Secret Location exposes four complementary links before Sources and navigates to Figurines', async ({
  page,
}) => {
  await page.goto('/en/guides/secret-location');

  const related = page.getByRole('complementary', {
    name: 'Explore More Hidden Content',
  });
  const links = related.getByRole('link');
  await expect(links).toHaveCount(4);

  const figurines = related.locator('a[href="/en/collectibles/figurines"]');
  await expect(figurines).toHaveCount(1);
  await expect(figurines).toBeVisible();

  expect(
    await related.evaluate((section) => {
      const sources = document.querySelector('.source-list');
      return Boolean(
        sources &&
          section.compareDocumentPosition(sources) &
            Node.DOCUMENT_POSITION_FOLLOWING,
      );
    }),
    'Related Guides should precede Sources',
  ).toBe(true);

  await figurines.click();
  await expect(page).toHaveURL(/\/en\/collectibles\/figurines$/);
});

test('a related card emits one complete related-guide analytics event', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const storageKey = '__test_related_guide_gtag_calls';
    const calls = JSON.parse(
      window.sessionStorage.getItem(storageKey) ?? '[]',
    ) as CapturedGtagCall[];
    (window as InstrumentedWindow).__relatedGuideGtagCalls = calls;
    window.gtag = (command, eventName, parameters) => {
      calls.push({ command, eventName, parameters });
      window.sessionStorage.setItem(storageKey, JSON.stringify(calls));
    };
  });

  await page.goto('/en/guides/secret-location');
  await page
    .getByRole('complementary', { name: 'Explore More Hidden Content' })
    .locator('a[href="/en/collectibles/figurines"]')
    .click();
  await expect(page).toHaveURL(/\/en\/collectibles\/figurines$/);

  const events = await page.evaluate(
    () => (window as InstrumentedWindow).__relatedGuideGtagCalls ?? [],
  );
  expect(events).toEqual([
    {
      command: 'event',
      eventName: 'related_guide_click',
      parameters: {
        source_page: '/en/guides/secret-location',
        target_page: '/en/collectibles/figurines',
        section: 'related_guides',
        link_text: 'KOTAMON Figurine Locations: Route Checklist',
      },
    },
  ]);
});

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`related cards fit the document and remain usable at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto('/en/guides/secret-location');

    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
      'document should not overflow horizontally',
    ).toBe(true);

    const related = page.getByRole('complementary', {
      name: 'Explore More Hidden Content',
    });
    const links = related.getByRole('link');
    await expect(links).toHaveCount(4);
    for (const link of await links.all()) {
      await expect(link).toBeVisible();
      await link.scrollIntoViewIfNeeded();
      await link.click({ trial: true });
    }
  });
}

test('the Guides hub has no related-guides section', async ({ page }) => {
  await page.goto('/en/guides');
  await expect(page.locator('.related-guides')).toHaveCount(0);
});
