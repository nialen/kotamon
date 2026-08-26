import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import HomePage, { metadata } from '@/app/[locale]/page';
import { SITE } from '@/lib/site';

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
