import '@testing-library/jest-dom/vitest';

import { act, cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import LocaleLayout from '@/app/[locale]/layout';
import { PUBLIC_ROUTES } from '@/content/routes';

const routeState = vi.hoisted(() => ({ pathname: '/en' }));
const scriptState = vi.hoisted(() => ({
  calls: [] as Array<Record<string, unknown>>,
}));

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
  providerContainer?.append(creative);

  await waitFor(() => {
    expect(ad).toHaveAttribute('data-ad-state', 'filled');
  });
  expect(ad).toHaveAttribute('aria-hidden', 'false');
  expect(container.querySelector('.native-ad__label')).toHaveTextContent(
    'Advertisement',
  );
});

it('hides the complete ad region again when the provider creative is removed', async () => {
  const layout = await LocaleLayout({
    children: <section>Page content</section>,
    params: Promise.resolve({ locale: 'en' }),
  });
  const { container } = render(layout);
  const ad = container.querySelector('[data-adsterra-native]');
  const providerContainer = container.querySelector(
    '#container-10de3692fca1aa56ca3ff0485ea3e9e6',
  );

  providerContainer!.innerHTML = '<div data-provider-ad>Loaded creative</div>';
  await waitFor(() => {
    expect(ad).toHaveAttribute('data-ad-state', 'filled');
  });

  providerContainer!.replaceChildren();
  await waitFor(() => {
    expect(ad).toHaveAttribute('data-ad-state', 'empty');
  });
  expect(ad).toHaveAttribute('aria-hidden', 'true');
  expect(container.querySelector('.native-ad__label')).not.toBeInTheDocument();
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

  expect(container.querySelectorAll('[data-adsterra-native]')).toHaveLength(1);
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
