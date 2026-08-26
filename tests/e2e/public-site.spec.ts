import { expect, test } from '@playwright/test';
import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

import { PUBLIC_ROUTES } from '../../src/content/routes';

const SITE_ORIGIN = 'https://kotamon.com';
const ROUTE_SCREENSHOT_DIRECTORY = path.resolve(
  process.cwd(),
  'qa',
  'task-14-route-screenshots',
);

function screenshotName(route: (typeof PUBLIC_ROUTES)[number]) {
  return `${route.slice(1).replaceAll('/', '--')}.png`;
}

function parseComputedColor(value: string): [number, number, number] {
  const rgb = value.match(
    /^rgba?\(\s*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)/,
  );
  if (rgb) {
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  }

  const srgb = value.match(
    /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/,
  );
  if (srgb) {
    return [
      Number(srgb[1]) * 255,
      Number(srgb[2]) * 255,
      Number(srgb[3]) * 255,
    ];
  }

  throw new Error(`Unsupported computed color: ${value}`);
}

function relativeLuminance([red, green, blue]: [number, number, number]) {
  const [r, g, b] = [red, green, blue].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(foreground: string, background: string) {
  const foregroundLuminance = relativeLuminance(
    parseComputedColor(foreground),
  );
  const backgroundLuminance = relativeLuminance(
    parseComputedColor(background),
  );

  return (
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
  );
}

test.beforeAll(async () => {
  await mkdir(ROUTE_SCREENSHOT_DIRECTORY, { recursive: true });
});

test('every approved public route satisfies the rendered SEO contract', async ({
  page,
}) => {
  test.slow();
  expect(page.viewportSize()).toEqual({ height: 900, width: 1440 });

  const observedDescriptions = new Map<string, string>();
  const observedTitles = new Map<string, string>();

  for (const route of PUBLIC_ROUTES) {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response?.status(), `${route} response status`).toBe(200);

    const h1 = page.locator('h1');
    await expect(h1, `${route} must render one H1`).toHaveCount(1);
    await expect(h1, `${route} H1 must not be empty`).not.toHaveText(/^\s*$/);

    const title = await page.title();
    expect(title.trim(), `${route} title`).not.toBe('');
    expect(
      [...observedTitles.entries()].find(([, seenTitle]) => seenTitle === title),
      `${route} title duplicates another public route`,
    ).toBeUndefined();
    observedTitles.set(route, title);

    const description = page.locator('meta[name="description"]');
    await expect(description, `${route} description`).toHaveCount(1);
    await expect(description).toHaveAttribute('content', /\S/);
    const descriptionContent = await description.getAttribute('content');
    expect(descriptionContent).not.toBeNull();
    expect(
      [...observedDescriptions.entries()].find(
        ([, seenDescription]) => seenDescription === descriptionContent,
      ),
      `${route} description duplicates another public route`,
    ).toBeUndefined();
    observedDescriptions.set(route, descriptionContent ?? '');

    const expectedUrl = `${SITE_ORIGIN}${route}`;
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      expectedUrl,
    );
    await expect(
      page.locator('link[rel="alternate"][hreflang="en"]'),
    ).toHaveAttribute('href', expectedUrl);
    await expect(
      page.locator('link[rel="alternate"][hreflang="x-default"]'),
    ).toHaveAttribute('href', expectedUrl);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      title,
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      'content',
      expectedUrl,
    );

    const screenshot = await page.screenshot({
      animations: 'disabled',
      caret: 'hide',
      fullPage: true,
      path: path.join(ROUTE_SCREENSHOT_DIRECTORY, screenshotName(route)),
    });
    expect(screenshot.readUInt32BE(16), `${route} screenshot width`).toBe(1440);
    expect(
      screenshot.readUInt32BE(20),
      `${route} full-page screenshot height`,
    ).toBeGreaterThanOrEqual(900);
  }

  expect(observedTitles.size).toBe(PUBLIC_ROUTES.length);
  expect(observedDescriptions.size).toBe(PUBLIC_ROUTES.length);

  const expectedScreenshots = PUBLIC_ROUTES.map(screenshotName).sort();
  const screenshotFiles = (await readdir(ROUTE_SCREENSHOT_DIRECTORY))
    .filter((file) => file.endsWith('.png'))
    .sort();
  expect(screenshotFiles).toEqual(expectedScreenshots);
  for (const screenshot of screenshotFiles) {
    expect(
      (await stat(path.join(ROUTE_SCREENSHOT_DIRECTORY, screenshot))).size,
      `${screenshot} must contain rendered image data`,
    ).toBeGreaterThan(10_000);
  }
});

test('public pages expose logical headings and parseable JSON-LD', async ({
  page,
}) => {
  for (const route of PUBLIC_ROUTES) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });

    const headingLevels = await page
      .locator('main h1, main h2, main h3, main h4, main h5, main h6')
      .evaluateAll((headings) =>
        headings.map((heading) => Number(heading.tagName.slice(1))),
      );
    expect(headingLevels[0], `${route} heading hierarchy`).toBe(1);
    for (let index = 1; index < headingLevels.length; index += 1) {
      expect(
        headingLevels[index] - headingLevels[index - 1],
        `${route} skips a heading level`,
      ).toBeLessThanOrEqual(1);
    }

    const jsonLdBlocks = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    expect(jsonLdBlocks.length, `${route} JSON-LD blocks`).toBeGreaterThan(0);
    for (const jsonLd of jsonLdBlocks) {
      expect(() => JSON.parse(jsonLd), `${route} JSON-LD parses`).not.toThrow();
    }
  }
});

test('long mobile article headings preserve whole words without overflow', async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 });

  for (const route of [
    '/en/guides/save-not-working',
    '/en/achievements',
  ]) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });

    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
      `${route} document width`,
    ).toBe(390);

    const wordLineBoxes = await page.locator('h1').evaluate((heading) => {
      const textNode = heading.firstChild;
      if (!(textNode instanceof Text)) {
        throw new Error('Expected the article H1 to contain a text node');
      }

      return [...textNode.data.matchAll(/\S+/g)].map((match) => {
        const range = document.createRange();
        range.setStart(textNode, match.index);
        range.setEnd(textNode, match.index + match[0].length);

        return { lineBoxes: range.getClientRects().length, word: match[0] };
      });
    });

    for (const word of wordLineBoxes) {
      expect.soft(
        word.lineBoxes,
        `${route} keeps ${word.word} on one visual line`,
      ).toBe(1);
    }
  }
});

test('homepage colored surfaces meet WCAG AA text contrast in both themes', async ({
  page,
}) => {
  await page.goto('/en', { waitUntil: 'domcontentloaded' });

  for (const theme of ['light', 'dark'] as const) {
    await page.evaluate((nextTheme) => {
      document.documentElement.dataset.theme = nextTheme;
      void getComputedStyle(document.body).color;
      for (const animation of document.getAnimations()) {
        animation.finish();
      }
    }, theme);

    const pairs = await page.evaluate(() => {
      const primaryCta = document.querySelector<HTMLAnchorElement>(
        'main a[href="/en/guides/gameplay"]',
      );
      const whereToPlay = document.querySelector<HTMLAnchorElement>(
        'main a[href="/en/game/where-to-play"]',
      );
      const whereToPlayCopy = whereToPlay?.querySelector('p');

      if (!primaryCta || !whereToPlay || !whereToPlayCopy) {
        throw new Error('Expected homepage contrast targets were not rendered');
      }

      return [
        {
          background: getComputedStyle(primaryCta).backgroundColor,
          foreground: getComputedStyle(primaryCta).color,
          name: 'primary CTA',
        },
        {
          background: getComputedStyle(whereToPlay).backgroundColor,
          foreground: getComputedStyle(whereToPlayCopy).color,
          name: 'where-to-play supporting copy',
        },
      ];
    });

    for (const pair of pairs) {
      expect.soft(
        contrastRatio(pair.foreground, pair.background),
        `${theme} ${pair.name} contrast`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  }
});

test('follows live system theme changes when no stored override exists', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.addInitScript(() => {
    window.localStorage.removeItem('kotamon-theme');
  });
  await page.goto('/en', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(
    page.getByRole('button', { name: 'Switch to dark theme' }),
  ).toBeVisible();
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(
    await page.evaluate(() => window.localStorage.getItem('kotamon-theme')),
  ).toBeNull();
});

test('discovery files and favicon assets expose only the approved public set', async ({
  page,
  request,
}) => {
  await page.goto('/en');

  const faviconHrefs = await page
    .locator('link[rel~="icon"], link[rel="apple-touch-icon"]')
    .evaluateAll((links) =>
      links.map((link) => (link as HTMLLinkElement).href),
    );
  expect(faviconHrefs.length).toBeGreaterThanOrEqual(3);
  for (const href of faviconHrefs) {
    const response = await request.get(new URL(href).pathname);
    expect(response.status(), `favicon ${href}`).toBe(200);
  }

  const manifestResponse = await request.get('/manifest.webmanifest');
  expect(manifestResponse.status()).toBe(200);
  const manifest = await manifestResponse.json();
  expect(manifest.icons).toHaveLength(2);
  for (const icon of manifest.icons as Array<{ src: string }>) {
    const response = await request.get(new URL(icon.src).pathname);
    expect(response.status(), `manifest icon ${icon.src}`).toBe(200);
  }

  const sitemapResponse = await request.get('/sitemap.xml');
  expect(sitemapResponse.status()).toBe(200);
  const sitemap = await sitemapResponse.text();
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    ([, url]) => url,
  );
  expect(sitemapUrls).toEqual(
    PUBLIC_ROUTES.map((route) => `${SITE_ORIGIN}${route}`),
  );
  expect(sitemap).not.toMatch(/\/(?:mods?|cheats?|ru|zh|es)(?:\/|<)/i);

  const robotsResponse = await request.get('/robots.txt');
  expect(robotsResponse.status()).toBe(200);
  const robots = await robotsResponse.text();
  expect(robots).toContain('Allow: /');
  expect(robots).toContain(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`);
});

test('root redirects permanently and unsupported scope stays unavailable', async ({
  request,
}) => {
  const rootResponse = await request.get('/', { maxRedirects: 0 });
  expect(rootResponse.status()).toBe(308);
  expect(rootResponse.headers().location).toBe('/en');

  for (const route of ['/en/mods', '/ru']) {
    const response = await request.get(route, { maxRedirects: 0 });
    expect(response.status(), `${route} must stay unavailable`).toBe(404);
  }
});
