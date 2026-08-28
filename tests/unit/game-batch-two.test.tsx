import '@testing-library/jest-dom/vitest';
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import type { ComponentType } from 'react';
import type { MDXComponents } from 'mdx/types';
import { useMDXComponents } from '../../mdx-components';
import { ArticleLayout } from '@/components/article/article-layout';
import { TaskGrid } from '@/components/home/task-grid';
import { GameOverview } from '@/components/home/game-overview';
import { getEntry, getArticleStaticParams } from '@/content/registry';
import { buildArticleMetadata, buildArticleJsonLd, buildBreadcrumbJsonLd } from '@/seo/metadata';
import sitemap from '@/app/sitemap';

afterEach(cleanup);

it.each(['collectibles', 'game', 'game/system-requirements', 'updates'])(
  'publishes %s with a single H1, canonical and static discovery', (slug) => {
    const entry = getEntry('en', slug);
    expect(entry).toBeDefined();
    if (!entry) return;
    const Content = entry.Component;
    const { container } = render(<ArticleLayout entry={entry}><Content /></ArticleLayout>);
    expect(container.querySelectorAll('h1')).toHaveLength(1);
    expect(buildArticleMetadata(entry).alternates?.canonical).toBe(`https://kotamon.com/en/${slug}`);
    expect(sitemap()).toContainEqual({ url: `https://kotamon.com/en/${slug}` });
    expect(getArticleStaticParams()).toContainEqual({ locale: 'en', slug: slug.split('/') });
  },
);

it.each([
  ['collectibles/figurines', 'Collectibles', '/en/collectibles'],
  ['collectibles/audiotapes', 'Collectibles', '/en/collectibles'],
  ['guides/secret-location', 'Collectibles', '/en/collectibles'],
  ['game/where-to-play', 'Game', '/en/game'],
  ['game/artists', 'Game', '/en/game'],
  ['game/system-requirements', 'Game', '/en/game'],
  ['updates', 'Game', '/en/game'],
])('parents %s identically in visible and structured breadcrumbs', (slug, parent, href) => {
  const entry = getEntry('en', slug);
  expect(entry).toBeDefined();
  if (!entry) return;
  const { container } = render(<ArticleLayout entry={entry}>{null}</ArticleLayout>);
  const nav = within(container).getByRole('navigation', { name: 'Breadcrumb' });
  expect(within(nav).getByRole('link', { name: parent })).toHaveAttribute('href', href);
  expect(buildBreadcrumbJsonLd(entry).itemListElement).toEqual([
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://kotamon.com/en' },
    { '@type': 'ListItem', position: 2, name: parent, item: `https://kotamon.com${href}` },
    { '@type': 'ListItem', position: 3, name: entry.title, item: `https://kotamon.com/en/${slug}` },
  ]);
});

it.each([
  ['collectibles', ['collectibles/figurines', 'collectibles/audiotapes', 'guides/secret-location']],
  ['game', ['game/where-to-play', 'game/artists', 'game/system-requirements', 'updates']],
] as const)('renders %s as a useful collection page with described child cards', (slug, targets) => {
  const entry = getEntry('en', slug);
  expect(entry).toBeDefined();
  if (!entry) return;
  const Content = entry.Component;
  const { container } = render(<Content />);
  for (const target of targets) {
    const link = container.querySelector(`.guide-directory__card[href="/en/${target}"]`);
    expect(link).not.toBeNull();
    expect(link?.querySelector('p')?.textContent?.length).toBeGreaterThan(30);
  }
  expect(buildArticleJsonLd(entry)['@type']).toBe('CollectionPage');
});

it.each([
  ['guides', ['collectibles', 'game', 'updates']],
  ['collectibles/figurines', ['collectibles']],
  ['collectibles/audiotapes', ['collectibles']],
  ['guides/secret-location', ['collectibles']],
  ['game/where-to-play', ['game', 'game/system-requirements']],
  ['game/artists', ['game']],
  ['game/system-requirements', ['game', 'game/where-to-play', 'guides/gameplay']],
  ['updates', ['game', 'cards', 'guides/cereal-boxes', 'guides/save-not-working']],
] as const)('gives %s contextual discovery beyond the global menu', (slug, targets) => {
  const entry = getEntry('en', slug);
  expect(entry).toBeDefined();
  if (!entry) return;
  const Content = entry.Component as ComponentType<{ components: MDXComponents }>;
  const { container } = render(<Content components={useMDXComponents()} />);
  for (const target of targets) {
    expect(container.querySelector(`a[href="/en/${target}"]`), `${slug} -> ${target}`).not.toBeNull();
  }
});

it('makes the new hubs reachable from homepage body content', () => {
  const { container } = render(<><TaskGrid /><GameOverview /></>);
  for (const href of ['/en/collectibles', '/en/game', '/en/updates']) {
    expect(container.querySelector(`a[href="${href}"]`)).not.toBeNull();
  }
});
