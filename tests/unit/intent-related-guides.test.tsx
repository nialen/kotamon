import '@testing-library/jest-dom/vitest';

import { render } from '@testing-library/react';
import type { MDXComponents } from 'mdx/types';
import type { ComponentType } from 'react';
import { describe, expect, it } from 'vitest';

import { ArticleLayout } from '@/components/article/article-layout';
import { getArticleStaticParams, getEntry, getRelatedEntries } from '@/content/registry';
import { PUBLIC_ROUTES } from '@/content/routes';
import { buildArticleMetadata } from '@/seo/metadata';
import { useMDXComponents } from '../../mdx-components';
import legacySeo from '../fixtures/legacy-seo.json';

const approvedMatrix = {
  achievements: ['collectibles', 'guides/secret-location', 'cards', 'guides/gameplay'],
  cards: ['guides/card-repair', 'guides/foil-cards', 'guides/cereal-boxes', 'achievements'],
  collectibles: [
    'guides/secret-location',
    'collectibles/figurines',
    'collectibles/audiotapes',
    'achievements',
  ],
  'collectibles/audiotapes': [
    'collectibles',
    'guides/secret-location',
    'collectibles/figurines',
    'achievements',
  ],
  'collectibles/figurines': [
    'collectibles',
    'guides/secret-location',
    'collectibles/audiotapes',
    'achievements',
  ],
  game: ['game/where-to-play', 'game/system-requirements', 'game/artists', 'updates'],
  'game/artists': ['cards', 'game', 'game/where-to-play'],
  'game/system-requirements': [
    'game/where-to-play',
    'game',
    'guides/beginner-guide',
    'updates',
  ],
  'game/where-to-play': [
    'game',
    'game/system-requirements',
    'guides/beginner-guide',
    'updates',
  ],
  guides: [],
  'guides/beginner-guide': ['guides/gameplay', 'guides/money', 'guides/upgrades', 'cards'],
  'guides/card-repair': ['cards', 'guides/foil-cards', 'guides/cereal-boxes', 'guides/gameplay'],
  'guides/cereal-boxes': ['cards', 'guides/card-repair', 'guides/foil-cards', 'guides/money'],
  'guides/foil-cards': ['cards', 'guides/card-repair', 'guides/cereal-boxes', 'achievements'],
  'guides/gameplay': ['guides/beginner-guide', 'guides/money', 'guides/upgrades', 'cards'],
  'guides/money': ['guides/upgrades', 'guides/gameplay', 'guides/beginner-guide', 'guides/cereal-boxes'],
  'guides/save-not-working': ['updates', 'guides', 'guides/gameplay', 'game/where-to-play'],
  'guides/secret-location': [
    'collectibles',
    'collectibles/figurines',
    'collectibles/audiotapes',
    'achievements',
  ],
  'guides/upgrades': ['guides/gameplay', 'guides/money', 'guides/beginner-guide', 'guides/cereal-boxes'],
  updates: ['cards', 'guides/cereal-boxes', 'guides/save-not-working', 'collectibles/figurines'],
} as const;

const expectedHeadings = {
  'guides/beginner-guide': 'Continue Your KOTAMON Journey',
  'guides/secret-location': 'Explore More Hidden Content',
  updates: 'Affected guides',
} as const;

describe('intent-based related guides', () => {
  it.each(Object.entries(approvedMatrix))(
    'uses the approved ordered recommendations for %s',
    (slug, expectedRelated) => {
      const entry = getEntry('en', slug);

      expect(entry, `Missing ${slug}`).toBeDefined();
      expect(entry?.related).toEqual(expectedRelated);
      expect(entry && getRelatedEntries(entry).map((related) => related.slug)).toEqual(
        expectedRelated,
      );
    },
  );

  it('uses intent-specific headings only for the approved pages', () => {
    for (const [slug, heading] of Object.entries(expectedHeadings)) {
      expect(getEntry('en', slug)?.relatedHeading).toBe(heading);
    }

    for (const slug of Object.keys(approvedMatrix)) {
      if (!(slug in expectedHeadings)) {
        expect(getEntry('en', slug)?.relatedHeading).toBeUndefined();
      }
    }
  });

  it('keeps Secret Location’s contextual onward links as the four approved hidden-content destinations', () => {
    const entry = getEntry('en', 'guides/secret-location');
    expect(entry).toBeDefined();
    if (!entry) return;

    const relatedEntries = getRelatedEntries(entry);
    const Content = entry.Component as ComponentType<{ components: MDXComponents }>;
    const { container } = render(
      <ArticleLayout
        entry={entry}
        relatedEntries={relatedEntries}
        sourcePage="/en/guides/secret-location"
      >
        <Content components={useMDXComponents()} />
      </ArticleLayout>,
    );

    expect(container.querySelector('.related-guides')).toHaveTextContent(
      'Explore More Hidden Content',
    );

    const articleBody = container.querySelector('.article-body');
    expect(articleBody).not.toBeNull();
    for (const slug of approvedMatrix['guides/secret-location']) {
      expect(articleBody!.querySelectorAll(`a[href="/en/${slug}"]`)).toHaveLength(1);
      expect(container.querySelector(`.related-guides a[href="/en/${slug}"]`)).not.toBeNull();
    }
  });

  it('preserves the public route and SEO identity invariants', () => {
    expect(getArticleStaticParams()).toHaveLength(20);
    expect(PUBLIC_ROUTES).toHaveLength(21);

    for (const { slug, title, description } of legacySeo) {
      const entry = getEntry('en', slug);
      expect(entry?.title).toBe(title);
      expect(entry?.description).toBe(description);
      expect(buildArticleMetadata(entry!).alternates?.canonical).toBe(
        `https://kotamon.com/en/${slug}`,
      );
    }
  });
});
