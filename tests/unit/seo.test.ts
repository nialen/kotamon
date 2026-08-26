import { expect, it } from 'vitest';
import { buildArticleMetadata } from '@/seo/metadata';

it('builds canonical, English alternate, x-default, and Open Graph data', () => {
  const result = buildArticleMetadata({
    title: 'Gameplay Guide',
    description: 'Learn the core loop.',
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
  });

  expect(result.alternates?.canonical).toBe(
    'https://kotamon.com/en/guides/gameplay',
  );
  expect(result.alternates?.languages).toEqual({
    en: 'https://kotamon.com/en/guides/gameplay',
    'x-default': 'https://kotamon.com/en/guides/gameplay',
  });
  expect(result.openGraph?.url).toBe(
    'https://kotamon.com/en/guides/gameplay',
  );
});
