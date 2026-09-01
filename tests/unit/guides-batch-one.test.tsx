import '@testing-library/jest-dom/vitest';
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ArticleLayout } from '@/components/article/article-layout';
import { TaskGrid } from '@/components/home/task-grid';
import { getEntry, getRelatedEntries, getArticleStaticParams } from '@/content/registry';
import sitemap from '@/app/sitemap';
import { buildArticleJsonLd, buildArticleMetadata, buildBreadcrumbJsonLd } from '@/seo/metadata';
import legacySeo from '../fixtures/legacy-seo.json';
import type { ComponentType } from 'react';
import type { MDXComponents } from 'mdx/types';
import { useMDXComponents } from '../../mdx-components';

afterEach(cleanup);

describe('batch-one public content', () => {
  it.each(legacySeo)('preserves the approved SEO identity of $slug', ({ slug, title, seoTitle, description }) => {
    const entry = getEntry('en', slug)!;
    expect(entry.title).toBe(title);
    expect(entry.description).toBe(description);
    const metadata = buildArticleMetadata(entry);
    expect(metadata.title).toEqual({ absolute: seoTitle ?? `${title} | KOTAMON Wiki & Guide` });
    expect(metadata.alternates?.canonical).toBe(`https://kotamon.com/en/${slug}`);
    const { container } = render(<ArticleLayout entry={entry}>{null}</ArticleLayout>);
    expect(container.querySelector('h1')?.textContent).toBe(title);
  });

  it.each([
    ['guides/beginner-guide', ['guides/gameplay', 'cards', 'guides/card-repair', 'guides/foil-cards', 'collectibles/figurines', 'collectibles/audiotapes']],
    ['guides/money', ['guides/gameplay', 'guides/upgrades', 'cards', 'guides/cereal-boxes']],
    ['guides/upgrades', ['guides/gameplay', 'guides/money', 'guides/cereal-boxes']],
    ['cards', ['guides/card-repair', 'guides/foil-cards', 'guides/cereal-boxes']],
    ['guides/gameplay', ['guides/beginner-guide', 'guides/money', 'guides/upgrades']],
    ['guides/card-repair', ['cards']],
    ['guides/foil-cards', ['cards']],
    ['guides/cereal-boxes', ['cards']],
    ['guides/save-not-working', ['guides']],
  ] as const)('links %s to related destinations in the body, not just navigation', (slug, targets) => {
    const entry = getEntry('en', slug)!;
    const Content = entry.Component as ComponentType<{ components: MDXComponents }>;
    const { container } = render(<Content components={useMDXComponents()} />);
    for (const target of targets) {
      expect(container.querySelector(`a[href="/en/${target}"]`), `${slug} → ${target}`).not.toBeNull();
      expect(getEntry('en', target)).toBeDefined();
    }
  });

  it.each(['guides', 'guides/beginner-guide', 'guides/money', 'guides/upgrades'])(
    'publishes %s in static routes and sitemap with one H1', (slug) => {
      const entry = getEntry('en', slug);
      expect(entry, `Missing public entry ${slug}`).toBeDefined();
      if (!entry) return;
      const Content = entry.Component;
      const { container } = render(<ArticleLayout entry={entry}><Content /></ArticleLayout>);
      expect(container.querySelectorAll('h1')).toHaveLength(1);
      expect(getArticleStaticParams()).toContainEqual({ locale: 'en', slug: slug.split('/') });
      expect(sitemap()).toContainEqual({ url: `https://kotamon.com/en/${slug}` });
    },
  );

  it('makes the Guides directory reachable from homepage content', () => {
    const { container } = render(<TaskGrid />);
    expect(container.querySelector('a[href="/en/guides"]')).not.toBeNull();
  });

  it('groups public guides into useful sections with descriptive cards', () => {
    const entry = getEntry('en', 'guides');
    expect(entry).toBeDefined();
    if (!entry) return;
    const Content = entry.Component;
    const { container } = render(<Content />);
    const groups = {
      'Getting Started': ['guides/beginner-guide', 'guides/gameplay'],
      Progression: ['guides/money', 'guides/upgrades'],
      Cards: ['cards', 'guides/card-repair', 'guides/foil-cards', 'guides/cereal-boxes'],
      Exploration: ['guides/secret-location', 'collectibles/figurines', 'collectibles/audiotapes'],
      'Game Help': ['guides/save-not-working', 'game/where-to-play'],
    };
    for (const [name, slugs] of Object.entries(groups)) {
      const group = within(container).getByRole('region', { name });
      for (const slug of slugs) {
        const link = group.querySelector(`a[href="/en/${slug}"]`);
        expect(link).not.toBeNull();
        expect(link?.querySelector('p')?.textContent?.length).toBeGreaterThan(30);
      }
    }
    expect(buildArticleJsonLd(entry)['@type']).toBe('CollectionPage');
  });

  it.each([
    ['guides/gameplay', 'Guides', '/en/guides'],
    ['guides/save-not-working', 'Guides', '/en/guides'],
    ['guides/card-repair', 'Cards', '/en/cards'],
    ['guides/foil-cards', 'Cards', '/en/cards'],
    ['guides/cereal-boxes', 'Cards', '/en/cards'],
    ['guides/secret-location', 'Collectibles', '/en/collectibles'],
    ['guides/beginner-guide', 'Guides', '/en/guides'],
    ['guides/money', 'Guides', '/en/guides'],
    ['guides/upgrades', 'Guides', '/en/guides'],
  ])('gives %s a real parent in both visible and structured breadcrumbs', (slug, parent, href) => {
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

  it.each(['guides/beginner-guide', 'guides/money', 'guides/upgrades'])(
    'gives %s a curated set of two to four related guides', (slug) => {
      const entry = getEntry('en', slug);
      expect(entry).toBeDefined();
      if (!entry) return;
      expect(getRelatedEntries(entry).length).toBeGreaterThanOrEqual(2);
      expect(getRelatedEntries(entry).length).toBeLessThanOrEqual(4);
    },
  );

  it('supports a separate search title without changing the H1 or canonical', () => {
    const existing = getEntry('en', 'guides/gameplay')!;
    const entry = { ...existing, title: 'KOTAMON Beginner Guide', seoTitle: 'KOTAMON Beginner Guide: What to Do First' };
    const metadata = buildArticleMetadata(entry);
    expect(metadata.title).toEqual({ absolute: 'KOTAMON Beginner Guide: What to Do First' });
    expect(metadata.alternates?.canonical).toBe('https://kotamon.com/en/guides/gameplay');
    const { container } = render(<ArticleLayout entry={entry}>{null}</ArticleLayout>);
    expect(container.querySelector('h1')).toHaveTextContent('KOTAMON Beginner Guide');
  });
});
