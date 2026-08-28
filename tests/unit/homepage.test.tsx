import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import HomePage, { metadata } from '@/app/[locale]/page';
import { SITE } from '@/lib/site';
import { PUBLIC_ROUTES } from '@/content/routes';

it('illustrates the homepage with eight distinct captioned game screenshots', () => {
  const { container } = render(<HomePage />);
  const screenshots = [...container.querySelectorAll('figure img')];
  expect(screenshots).toHaveLength(8);
  expect(new Set(screenshots.map((image) => image.getAttribute('src'))).size).toBe(8);
  for (const image of screenshots) {
    expect(image.getAttribute('alt')?.length).toBeGreaterThan(15);
    expect(image.closest('figure')?.querySelector('figcaption')).toHaveTextContent(/\S/);
    expect(Number(image.getAttribute('width'))).toBeGreaterThan(0);
    expect(Number(image.getAttribute('height'))).toBeGreaterThan(0);
  }
});

it('exposes the new research sections and real guide destinations', () => {
  const { container } = render(<HomePage />);
  for (const name of [
    'What is KOTAMON?', 'KOTAMON Quick Facts', 'Explore KOTAMON',
    'KOTAMON Cards', 'KOTAMON Artists', 'KOTAMON Demo & Download',
    'Latest KOTAMON Guides', 'KOTAMON FAQ',
  ]) {
    expect(screen.getByRole('heading', { level: 2, name })).toBeVisible();
  }
  expect(screen.getByRole('link', { name: 'Explore KOTAMON Artists' }))
    .toHaveAttribute('href', '/en/game/artists');
  expect(screen.getByRole('link', { name: 'Source: August 27 developer announcement' }))
    .toHaveAttribute('href', 'https://store.steampowered.com/news/app/4294490/view/692018855848968607');
  for (const link of container.querySelectorAll('a')) {
    const href = link.getAttribute('href');
    expect(href).toBeTruthy();
    if (href?.startsWith('/')) expect(PUBLIC_ROUTES).toContain(href);
    expect(href).not.toMatch(/^(?:#|javascript:)/);
  }
});

it('uses a recognizable Steam gameplay image without lazy-loading the hero', () => {
  render(<HomePage />);
  const hero = screen.getByRole('img', { name: /KOTAMON gameplay/i });
  expect(hero.getAttribute('src')).toContain('kotamon-gameplay');
  expect(hero).not.toHaveAttribute('loading', 'lazy');
  expect(hero).toHaveAttribute('width', '1600');
  expect(hero).toHaveAttribute('height', '900');
});

it('keeps the existing homepage search identity unchanged', () => {
  expect(metadata.title).toEqual({ absolute: 'KOTAMON Wiki & Guide: Cards, Achievements & More' });
  expect(metadata.description).toBe('Explore KOTAMON cards, achievements, collectibles, gameplay tips, secret locations, and troubleshooting in this independent fan-made wiki and guide.');
});

it('renders the canonical homepage position with one H1', () => {
  render(<HomePage />);

  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  expect(
    screen.getByRole('heading', { level: 1, name: 'KOTAMON Wiki & Guide' }),
  ).toBeVisible();
  expect(
    screen.getByText('An unofficial fan-made resource for KOTAMON players.'),
  ).toBeVisible();
});

it('links the two hero actions to gameplay and cards', () => {
  render(<HomePage />);

  expect(
    screen.getByRole('link', { name: 'Start with gameplay' }),
  ).toHaveAttribute('href', '/en/guides/gameplay');
  expect(screen.getByRole('link', { name: 'Browse cards' })).toHaveAttribute(
    'href',
    '/en/cards',
  );
});

it('links the save protection notice to the preservation-first guide', () => {
  render(<HomePage />);

  expect(screen.getByRole('link', { name: 'Read the save guide' })).toHaveAttribute(
    'href',
    '/en/guides/save-not-working',
  );
});

it('publishes a descriptive homepage title for the primary search tasks', () => {
  const homepageTitle = (metadata.title as { absolute: string }).absolute;

  expect(homepageTitle).toContain('KOTAMON Wiki & Guide');
  expect(homepageTitle).toContain('Cards');
  expect(homepageTitle).toContain('Achievements');
  expect(homepageTitle.length).toBeGreaterThanOrEqual(40);
  expect(homepageTitle.length).toBeLessThanOrEqual(60);
  expect(metadata.openGraph).toMatchObject({ title: homepageTitle });
});

it('publishes a useful homepage description without snippet stuffing', () => {
  const homepageDescription = metadata.description as string;

  expect(homepageDescription).toContain('KOTAMON');
  expect(homepageDescription).toContain('collectibles');
  expect(homepageDescription).toContain('troubleshooting');
  expect(homepageDescription.length).toBeGreaterThanOrEqual(140);
  expect(homepageDescription.length).toBeLessThanOrEqual(160);
});

it('publishes canonical homepage metadata and supported WebSite JSON-LD', () => {
  const { container } = render(<HomePage />);
  const jsonLd = container.querySelector('script[type="application/ld+json"]');

  expect(metadata.alternates).toEqual({
    canonical: `${SITE.url}/en`,
    languages: {
      en: `${SITE.url}/en`,
      'x-default': `${SITE.url}/en`,
    },
  });
  expect(jsonLd).not.toBeNull();
  expect(JSON.parse(jsonLd?.textContent ?? '{}')).toMatchObject({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    description: SITE.positioning,
    inLanguage: SITE.locale,
  });
});
