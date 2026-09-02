import '@testing-library/jest-dom/vitest';

import { act, cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import LocaleLayout from '@/app/[locale]/layout';
import { ArticleLayout } from '@/components/article/article-layout';
import { getEntry } from '@/content/registry';
import { PUBLIC_ROUTES } from '@/content/routes';

const routeState = vi.hoisted(() => ({ pathname: '/en' }));
const scriptState = vi.hoisted(() => ({
  calls: [] as Array<Record<string, unknown>>,
}));

function makeRenderable(element: HTMLElement) {
  const rect = {
    bottom: 250,
    height: 250,
    left: 0,
    right: 300,
    toJSON: () => ({}),
    top: 0,
    width: 300,
    x: 0,
    y: 0,
  } as DOMRect;
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(rect);
  vi.spyOn(element, 'getClientRects').mockReturnValue({
    0: rect,
    item: (index: number) => (index === 0 ? rect : null),
    length: 1,
    [Symbol.iterator]: function* () {
      yield rect;
    },
  } as DOMRectList);
}

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
  usePathname: () => routeState.pathname,
}));
vi.mock('next/script', () => ({
  default: (props: Record<string, unknown>) => {
    scriptState.calls.push(props);
    return null;
  },
}));

afterEach(() => {
  cleanup();
  routeState.pathname = '/en';
  scriptState.calls = [];
  document
    .querySelectorAll(
      'script[src="https://pl31104288.profitableratecpmnetwork.com/10de3692fca1aa56ca3ff0485ea3e9e6/invoke.js"]',
    )
    .forEach((script) => script.remove());
});

it('places one native ad after main content and immediately before the footer', async () => {
  const layout = await LocaleLayout({
    children: <section>Page content</section>,
    params: Promise.resolve({ locale: 'en' }),
  });
  const { container } = render(layout);
  const main = container.querySelector('main');
  const ad = container.querySelector('[data-adsterra-native]');
  const footer = container.querySelector('footer');

  expect(ad).toBeInTheDocument();
  expect(container.querySelectorAll('[data-adsterra-native]')).toHaveLength(1);
  expect(main?.contains(ad)).toBe(false);
  expect(main?.nextElementSibling).toBe(ad);
  expect(ad?.nextElementSibling).toBe(footer);
});

it('provides an ad slot only after the secret-location quick-answer header', () => {
  const secretEntry = getEntry('en', 'guides/secret-location');
  const gameplayEntry = getEntry('en', 'guides/gameplay');
  expect(secretEntry).toBeDefined();
  expect(gameplayEntry).toBeDefined();

  const secret = render(
    <ArticleLayout entry={secretEntry!}>
      <h2>How to reach the hidden area</h2>
    </ArticleLayout>,
  );
  const secretHeader = secret.container.querySelector('.article-header');
  const slot = secret.container.querySelector('[data-secret-location-ad-slot]');
  expect(secretHeader?.nextElementSibling).toBe(slot);
  expect(slot?.nextElementSibling).toHaveClass('article-layout__content');
  secret.unmount();

  const gameplay = render(
    <ArticleLayout entry={gameplayEntry!}>
      <h2>Gameplay details</h2>
    </ArticleLayout>,
  );
  expect(
    gameplay.container.querySelector('[data-secret-location-ad-slot]'),
  ).not.toBeInTheDocument();
});

it('keeps the ad region hidden until the provider injects a creative', async () => {
  const layout = await LocaleLayout({
    children: <section>Page content</section>,
    params: Promise.resolve({ locale: 'en' }),
  });
  const { container } = render(layout);
  const ad = container.querySelector('[data-adsterra-native]');
  const providerContainer = container.querySelector(
    '#container-10de3692fca1aa56ca3ff0485ea3e9e6',
  );

  expect(ad).toHaveAttribute('data-ad-state', 'empty');
  expect(ad).toHaveAttribute('aria-hidden', 'true');
  expect(container.querySelector('.native-ad__label')).not.toBeInTheDocument();

  const creative = document.createElement('iframe');
  creative.dataset.providerAd = 'loaded';
  makeRenderable(creative);
  providerContainer?.append(creative);

  await waitFor(() => {
    expect(ad).toHaveAttribute('data-ad-state', 'filled');
  });
  expect(ad).toHaveAttribute('aria-hidden', 'false');
  expect(container.querySelector('.native-ad__label')).toHaveTextContent(
    'Advertisement',
  );
});

it('keeps loader and zero-size provider nodes in the no-fill state', async () => {
  const layout = await LocaleLayout({
    children: <section>Page content</section>,
    params: Promise.resolve({ locale: 'en' }),
  });
  const { container } = render(layout);
  const ad = container.querySelector('[data-adsterra-native]');
  const providerContainer = container.querySelector(
    '#container-10de3692fca1aa56ca3ff0485ea3e9e6',
  );
  const loader = document.createElement('script');
  const hiddenWrapper = document.createElement('div');
  const zeroSizePlaceholder = document.createElement('div');
  hiddenWrapper.hidden = true;
  zeroSizePlaceholder.style.height = '0';
  zeroSizePlaceholder.style.width = '0';

  providerContainer?.append(loader, hiddenWrapper, zeroSizePlaceholder);

  await waitFor(() => {
    expect(ad).toHaveAttribute('data-ad-state', 'empty');
  });
  expect(ad).toHaveAttribute('aria-hidden', 'true');
  expect(container.querySelector('.native-ad__label')).not.toBeInTheDocument();
});

it('keeps the ad visible after a real creative has rendered once', async () => {
  const layout = await LocaleLayout({
    children: <section>Page content</section>,
    params: Promise.resolve({ locale: 'en' }),
  });
  const { container } = render(layout);
  const ad = container.querySelector('[data-adsterra-native]');
  const providerContainer = container.querySelector(
    '#container-10de3692fca1aa56ca3ff0485ea3e9e6',
  );

  const creative = document.createElement('div');
  creative.dataset.providerAd = 'loaded';
  creative.textContent = 'Loaded creative';
  makeRenderable(creative);
  providerContainer!.append(creative);
  await waitFor(() => {
    expect(ad).toHaveAttribute('data-ad-state', 'filled');
  });

  providerContainer!.replaceChildren();
  await waitFor(() => {
    expect(ad).toHaveAttribute('data-ad-state', 'filled');
  });
  expect(ad).toHaveAttribute('aria-hidden', 'false');
  expect(container.querySelector('.native-ad__label')).toHaveTextContent(
    'Advertisement',
  );
});

it('moves the single ad after the secret-location quick answer', async () => {
  routeState.pathname = '/en/guides/secret-location';
  const layout = await LocaleLayout({
    children: (
      <article>
        <aside>Quick answer</aside>
        <div data-secret-location-ad-slot />
        <h2>How to reach the hidden area</h2>
      </article>
    ),
    params: Promise.resolve({ locale: 'en' }),
  });
  const { container } = render(layout);
  const ad = container.querySelector('[data-adsterra-native]');
  const slot = container.querySelector('[data-secret-location-ad-slot]');

  await waitFor(() => expect(slot?.firstElementChild).toBe(ad));
  expect(container.querySelectorAll('[data-adsterra-native]')).toHaveLength(1);
  expect(
    container.querySelectorAll(
      '#container-10de3692fca1aa56ca3ff0485ea3e9e6',
    ),
  ).toHaveLength(1);
  expect(scriptState.calls).toHaveLength(1);
  expect(ad?.closest('article')).toBe(container.querySelector('article'));
  expect(slot?.nextElementSibling?.tagName).toBe('H2');
});

it('preserves the provider container while SPA navigation moves the ad into the secret article', async () => {
  const initialLayout = await LocaleLayout({
    children: <section>Guides</section>,
    params: Promise.resolve({ locale: 'en' }),
  });
  const { container, rerender } = render(initialLayout);
  const originalAd = container.querySelector('[data-adsterra-native]');
  const originalProviderContainer = container.querySelector(
    '#container-10de3692fca1aa56ca3ff0485ea3e9e6',
  );

  routeState.pathname = '/en/guides/secret-location';
  rerender(
    await LocaleLayout({
      children: (
        <article>
          <aside>Quick answer</aside>
          <div data-secret-location-ad-slot />
          <h2>How to reach the hidden area</h2>
        </article>
      ),
      params: Promise.resolve({ locale: 'en' }),
    }),
  );

  const slot = container.querySelector('[data-secret-location-ad-slot]');
  await waitFor(() => expect(slot?.firstElementChild).toBe(originalAd));
  expect(
    container.querySelector(
      '#container-10de3692fca1aa56ca3ff0485ea3e9e6',
    ),
  ).toBe(originalProviderContainer);
  expect(container.querySelectorAll('[data-adsterra-native]')).toHaveLength(1);
});

it('omits the ad from routes that are not explicitly approved for monetization', async () => {
  routeState.pathname = '/en/special';
  const layout = await LocaleLayout({
    children: <section>Special page</section>,
    params: Promise.resolve({ locale: 'en' }),
  });
  const { container } = render(layout);

  expect(container.querySelector('[data-adsterra-native]')).toHaveAttribute('hidden');
  expect(scriptState.calls).toEqual([]);
});

it('preserves an initialized provider container while an omitted route hides it', async () => {
  const approvedLayout = await LocaleLayout({
    children: <section>Approved content</section>,
    params: Promise.resolve({ locale: 'en' }),
  });
  const { container, rerender } = render(approvedLayout);
  const providerContainer = container.querySelector(
    '#container-10de3692fca1aa56ca3ff0485ea3e9e6',
  );
  await act(async () => {
    providerContainer!.innerHTML = '<span data-loaded-ad>Loaded creative</span>';
  });

  routeState.pathname = '/en/special';
  rerender(
    await LocaleLayout({
      children: <section>Special page</section>,
      params: Promise.resolve({ locale: 'en' }),
    }),
  );
  expect(container.querySelector('[data-adsterra-native]')).toHaveAttribute('hidden');

  routeState.pathname = '/en/guides';
  rerender(
    await LocaleLayout({
      children: <section>Guides</section>,
      params: Promise.resolve({ locale: 'en' }),
    }),
  );
  expect(container.querySelector('[data-loaded-ad]')).toBeInTheDocument();
  expect(
    container.querySelector('#container-10de3692fca1aa56ca3ff0485ea3e9e6'),
  ).toBe(providerContainer);
});

it.each(PUBLIC_ROUTES)('includes the approved ad placement on %s', async (pathname) => {
  routeState.pathname = pathname;
  const layout = await LocaleLayout({
    children: <section>Approved content</section>,
    params: Promise.resolve({ locale: 'en' }),
  });
  const { container } = render(layout);

  const ad = container.querySelector('[data-adsterra-native]');
  expect(container.querySelectorAll('[data-adsterra-native]')).toHaveLength(1);
  expect(ad).not.toHaveAttribute('hidden');
  expect(scriptState.calls).toHaveLength(1);
});

it('loads the exact Adsterra script once for the single provider container', async () => {
  const layout = await LocaleLayout({
    children: <section>Page content</section>,
    params: Promise.resolve({ locale: 'en' }),
  });
  const { container } = render(layout);

  expect(
    container.querySelectorAll(
      '#container-10de3692fca1aa56ca3ff0485ea3e9e6',
    ),
  ).toHaveLength(1);

  expect(scriptState.calls).toEqual([
    expect.objectContaining({
      async: true,
      'data-cfasync': 'false',
      id: 'adsterra-native-banner',
      src: 'https://pl31104288.profitableratecpmnetwork.com/10de3692fca1aa56ca3ff0485ea3e9e6/invoke.js',
      strategy: 'lazyOnload',
    }),
  ]);
});
