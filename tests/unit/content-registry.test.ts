import { describe, expect, it } from 'vitest';
import { createRegistry, createRegistryAccessors } from '@/content/registry';
import { PUBLIC_ROUTE_COUNT, PUBLIC_ROUTES } from '@/content/routes';

const valid = {
  title: 'Gameplay Guide',
  description: 'Learn the core loop.',
  slug: 'guides/gameplay',
  category: 'Guides',
  updatedAt: '2026-08-25',
  sourceStatus: 'multi-source',
  draft: false,
  locale: 'en',
  sources: [
    {
      label: 'Steam',
      url: 'https://store.steampowered.com/app/4294490/KOTAMON/',
      kind: 'official',
    },
  ],
};
const Component = () => null;
const canonicalSlugError =
  /Slug must use canonical lowercase slash-separated path segments/;

describe('createRegistry', () => {
  it('rejects duplicate locale and slug pairs', () => {
    expect(() =>
      createRegistry([
        {
          default: Component,
          frontmatter: valid,
          sourcePath: 'content/en/guides/gameplay.mdx',
        },
        {
          default: Component,
          frontmatter: valid,
          sourcePath: 'content/en/guides/gameplay-copy.mdx',
        },
      ]),
    ).toThrow(
      /content\/en\/guides\/gameplay-copy\.mdx.*duplicate.*en.*guides\/gameplay.*content\/en\/guides\/gameplay\.mdx/i,
    );
  });

  it('excludes drafts and unverified-only content', () => {
    const draft = { ...valid, slug: 'guides/draft', draft: true };
    const unsupported = {
      ...valid,
      slug: 'guides/rumor',
      sourceStatus: 'unverified',
      sources: [
        { label: 'Post', url: 'https://example.com/post', kind: 'unverified' },
      ],
    };

    expect(
      createRegistry([
        { default: Component, frontmatter: valid },
        { default: Component, frontmatter: draft },
        { default: Component, frontmatter: unsupported },
      ]).publicEntries,
    ).toHaveLength(1);
  });

  it('rejects publishable content supported only by unverified source kinds', () => {
    const unsupportedSources = {
      ...valid,
      sources: [
        {
          label: 'Unverified post',
          url: 'https://example.com/post',
          kind: 'unverified',
        },
      ],
    };

    expect(() =>
      createRegistry([{ default: Component, frontmatter: unsupportedSources }]),
    ).toThrow(/sources: Publishable content requires at least one source whose kind is not unverified/i);
  });

  it('reports the originating source path for invalid frontmatter', () => {
    expect(() =>
      createRegistry([
        {
          default: Component,
          frontmatter: { ...valid, title: '' },
          sourcePath: 'content/en/guides/broken.mdx',
        },
      ]),
    ).toThrow(/content\/en\/guides\/broken\.mdx.*title/i);
  });

  it('rejects missing related entries with the originating source path', () => {
    expect(() =>
      createRegistry([
        {
          default: Component,
          frontmatter: { ...valid, related: ['guides/missing'] },
          sourcePath: 'content/en/guides/gameplay.mdx',
        },
      ]),
    ).toThrow(
      /content\/en\/guides\/gameplay\.mdx.*related\.0.*guides\/missing.*missing.*locale en/i,
    );
  });

  it('rejects self and duplicate related slugs with the originating source path', () => {
    expect(() =>
      createRegistry([
        {
          default: Component,
          frontmatter: { ...valid, related: ['guides/gameplay'] },
          sourcePath: 'content/en/guides/gameplay.mdx',
        },
      ]),
    ).toThrow(
      /content\/en\/guides\/gameplay\.mdx.*related\.0.*must not reference the entry itself/i,
    );

    expect(() =>
      createRegistry([
        {
          default: Component,
          frontmatter: {
            ...valid,
            related: ['guides/card-repair', 'guides/card-repair'],
          },
          sourcePath: 'content/en/guides/gameplay.mdx',
        },
        {
          default: Component,
          frontmatter: { ...valid, slug: 'guides/card-repair' },
          sourcePath: 'content/en/guides/card-repair.mdx',
        },
      ]),
    ).toThrow(
      /content\/en\/guides\/gameplay\.mdx.*related\.1.*guides\/card-repair.*duplicates related\.0/i,
    );
  });

  it.each([
    ['draft', { draft: true }, /draft entry.*content\/en\/guides\/card-repair\.mdx.*not public/i],
    [
      'unverified',
      { sourceStatus: 'unverified' },
      /unverified entry.*content\/en\/guides\/card-repair\.mdx.*not public/i,
    ],
  ])(
    'rejects a related slug that points to a %s entry',
    (_label, targetFields, expectedMessage) => {
      expect(() =>
        createRegistry([
          {
            default: Component,
            frontmatter: { ...valid, related: ['guides/card-repair'] },
            sourcePath: 'content/en/guides/gameplay.mdx',
          },
          {
            default: Component,
            frontmatter: {
              ...valid,
              slug: 'guides/card-repair',
              ...targetFields,
            },
            sourcePath: 'content/en/guides/card-repair.mdx',
          },
        ]),
      ).toThrow(expectedMessage);
    },
  );

  it.each([
    ['an invalid calendar date', { updatedAt: '2026-02-29' }, /updatedAt: Date must be a valid ISO date/],
    ['a leading-slash slug', { slug: '/guides/gameplay' }, canonicalSlugError],
    ['a query slug', { slug: 'guides/gameplay?preview=true' }, canonicalSlugError],
    ['a fragment slug', { slug: 'guides/gameplay#intro' }, canonicalSlugError],
    ['a double-slash slug', { slug: 'guides//gameplay' }, canonicalSlugError],
    ['a trailing-slash slug', { slug: 'guides/gameplay/' }, canonicalSlugError],
    ['a dot-segment slug', { slug: 'guides/../gameplay' }, canonicalSlugError],
    ['a backslash slug', { slug: 'guides\\gameplay' }, canonicalSlugError],
    ['a colon slug', { slug: 'javascript:alert' }, canonicalSlugError],
    ['an uppercase slug', { slug: 'Guides/gameplay' }, canonicalSlugError],
    ['an invalid related slug', { related: ['guides//card-repair'] }, canonicalSlugError],
    ['a non-English locale', { locale: 'fr' }, /locale: Invalid input/],
    ['an invalid priority', { priority: 'P3' }, /priority: Invalid option/],
    ['an invalid source status', { sourceStatus: 'unsupported' }, /sourceStatus: Invalid option/],
    ['a non-boolean draft flag', { draft: 'false' }, /draft: Invalid input/],
    ['a missing title', { title: undefined }, /title: Invalid input/],
    [
      'a non-HTTPS source URL',
      { sources: [{ ...valid.sources[0], url: 'http://example.com/source' }] },
      /sources\.0\.url: Source URL must use HTTPS/,
    ],
  ])('rejects %s', (_label, invalidFields, message) => {
    expect(() =>
      createRegistry([{ default: Component, frontmatter: { ...valid, ...invalidFields } }]),
    ).toThrow(message);
  });

  it('retains the exact MDX component reference', () => {
    const registry = createRegistry([{ default: Component, frontmatter: valid }]);

    expect(registry.allEntries[0]?.Component).toBe(Component);
  });

  it('provides only public entries through registry accessors', () => {
    const draft = { ...valid, slug: 'guides/draft', draft: true };
    const unsupported = {
      ...valid,
      slug: 'guides/rumor',
      sourceStatus: 'unverified',
      sources: [
        { label: 'Post', url: 'https://example.com/post', kind: 'unverified' },
      ],
    };
    const registry = createRegistry([
      { default: Component, frontmatter: valid },
      { default: Component, frontmatter: draft },
      { default: Component, frontmatter: unsupported },
    ]);
    const { getArticleStaticParams, getEntry, getRelatedEntries } =
      createRegistryAccessors(registry);

    expect(getEntry('en', 'guides/gameplay')?.Component).toBe(Component);
    expect(getEntry('en', 'guides/draft')).toBeUndefined();
    expect(getEntry('en', 'guides/rumor')).toBeUndefined();
    expect(getArticleStaticParams()).toEqual([
      { locale: 'en', slug: ['guides', 'gameplay'] },
    ]);
    expect(getRelatedEntries(registry.publicEntries[0])).toEqual([]);
  });

  it('resolves validated related entries in authored order', () => {
    const gameplay = {
      ...valid,
      related: ['guides/foil-cards', 'guides/card-repair'],
    };
    const cardRepair = { ...valid, slug: 'guides/card-repair' };
    const foilCards = { ...valid, slug: 'guides/foil-cards' };
    const registry = createRegistry([
      { default: Component, frontmatter: gameplay },
      { default: Component, frontmatter: cardRepair },
      { default: Component, frontmatter: foilCards },
    ]);
    const { getRelatedEntries } = createRegistryAccessors(registry);

    expect(getRelatedEntries(registry.publicEntries[0]).map(({ slug }) => slug)).toEqual([
      'guides/foil-cards',
      'guides/card-repair',
    ]);
  });
});

describe('PUBLIC_ROUTES', () => {
  it('contains exactly the approved English routes in order', () => {
    expect(PUBLIC_ROUTE_COUNT).toBe(21);
    expect(PUBLIC_ROUTES).toEqual([
      '/en',
      '/en/guides/gameplay',
      '/en/guides/card-repair',
      '/en/guides/foil-cards',
      '/en/guides/cereal-boxes',
      '/en/guides/save-not-working',
      '/en/guides/secret-location',
      '/en/cards',
      '/en/collectibles/figurines',
      '/en/collectibles/audiotapes',
      '/en/achievements',
      '/en/game/where-to-play',
      '/en/game/artists',
      '/en/guides',
      '/en/guides/beginner-guide',
      '/en/guides/money',
      '/en/guides/upgrades',
      '/en/collectibles',
      '/en/game',
      '/en/game/system-requirements',
      '/en/updates',
    ]);
  });
});
