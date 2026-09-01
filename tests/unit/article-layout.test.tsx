import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { ArticleLayout } from '@/components/article/article-layout';
import { SourceList } from '@/components/article/source-list';
import { AchievementGroups } from '@/components/content/achievement-groups';
import { CardGroups } from '@/components/content/card-groups';
import { LocationChecklist } from '@/components/content/location-checklist';

it('renders one H1 and public trust fields', () => {
  render(
    <ArticleLayout
      entry={{
        title: 'Gameplay Guide',
        description: 'Core loop.',
        slug: 'guides/gameplay',
        category: 'Guides',
        updatedAt: '2026-08-25',
        sourceStatus: 'official',
        draft: false,
        locale: 'en',
        sources: [
          {
            label: 'Steam',
            url: 'https://store.steampowered.com/app/4294490/KOTAMON/',
            kind: 'official',
          },
        ],
      }}
    >
      <p>Body</p>
    </ArticleLayout>,
  );

  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  expect(screen.getByText(/Official source/)).toBeVisible();
  expect(screen.getByText(/Updated August 25, 2026/)).toBeVisible();
});

it('renders the body, custom related guides, and sources in sequence', () => {
  const { container } = render(
    <ArticleLayout
      entry={{
        title: 'Gameplay Guide',
        description: 'Core loop.',
        slug: 'guides/gameplay',
        category: 'Guides',
        updatedAt: '2026-08-25',
        sourceStatus: 'official',
        draft: false,
        locale: 'en',
        relatedHeading: 'Explore More Hidden Content',
        sources: [
          {
            label: 'Steam',
            url: 'https://store.steampowered.com/app/4294490/KOTAMON/',
            kind: 'official',
          },
        ],
      }}
      relatedEntries={[
        {
          title: 'Card Repair',
          description: 'Repair worn cards.',
          slug: 'guides/card-repair',
          category: 'Guides',
          updatedAt: '2026-08-25',
          sourceStatus: 'official',
          draft: false,
          locale: 'en',
          sources: [
            {
              label: 'Steam',
              url: 'https://store.steampowered.com/app/4294490/KOTAMON/',
              kind: 'official',
            },
          ],
          Component: () => null,
        },
      ]}
      sourcePage="/en/guides/gameplay"
    >
      <p>Body</p>
    </ArticleLayout>,
  );

  const body = container.querySelector('.article-body');
  const related = container.querySelector('.related-guides');
  const sources = container.querySelector('.source-list');

  expect(screen.getByRole('heading', { name: 'Explore More Hidden Content' })).toBeVisible();
  expect(body?.compareDocumentPosition(related!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  expect(related?.compareDocumentPosition(sources!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
});

it('renders sources as safe external links', () => {
  render(
    <SourceList
      sources={[
        {
          label: 'Steam',
          url: 'https://store.steampowered.com/app/4294490/KOTAMON/',
          kind: 'official',
        },
      ]}
    />,
  );

  expect(screen.getByRole('link', { name: /Steam/ })).toHaveAttribute(
    'target',
    '_blank',
  );
  expect(screen.getByRole('link', { name: /Steam/ })).toHaveAttribute(
    'rel',
    'noreferrer noopener',
  );
});

it('renders structured content as grouped lists', () => {
  render(
    <>
      <CardGroups
        groups={[
          {
            title: 'Blue set',
            entries: [{ name: 'Bubble', description: 'A documented card.' }],
          },
        ]}
      />
      <AchievementGroups
        groups={[
          {
            title: 'Cards and binder',
            entries: [
              {
                name: 'First Page',
                description: 'Add a card to the binder.',
              },
            ],
          },
        ]}
      />
      <LocationChecklist
        items={[
          {
            name: 'Workshop shelf',
            description: 'Check the shelf beside the repair bench.',
          },
        ]}
      />
    </>,
  );

  expect(screen.getByRole('heading', { name: 'Blue set' })).toBeVisible();
  expect(screen.getByText('First Page')).toBeVisible();
  expect(screen.getByText('Workshop shelf')).toBeVisible();
  expect(screen.getAllByRole('list')).toHaveLength(3);
});
