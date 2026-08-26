export const PUBLIC_ROUTES = [
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
] as const;

export type PublicNavigationItem = {
  readonly label: string;
  readonly href: (typeof PUBLIC_ROUTES)[number];
};

export type PublicNavigationGroup = {
  readonly label: string;
  readonly items: readonly PublicNavigationItem[];
};

export const PUBLIC_NAVIGATION_GROUPS = [
  {
    label: 'Guides',
    items: [
      { label: 'Gameplay', href: '/en/guides/gameplay' },
      { label: 'Card repair', href: '/en/guides/card-repair' },
      { label: 'Foil cards', href: '/en/guides/foil-cards' },
      { label: 'Cereal boxes', href: '/en/guides/cereal-boxes' },
      { label: 'Save issues', href: '/en/guides/save-not-working' },
      { label: 'Secret location', href: '/en/guides/secret-location' },
    ],
  },
  {
    label: 'Collection',
    items: [
      { label: 'Cards', href: '/en/cards' },
      { label: 'Figurines', href: '/en/collectibles/figurines' },
      { label: 'Audiotapes', href: '/en/collectibles/audiotapes' },
      { label: 'Achievements', href: '/en/achievements' },
    ],
  },
  {
    label: 'Game',
    items: [
      { label: 'Where to play', href: '/en/game/where-to-play' },
      { label: 'Artists', href: '/en/game/artists' },
    ],
  },
] as const satisfies readonly PublicNavigationGroup[];

export const PRIMARY_NAVIGATION = [
  { label: 'Gameplay', href: '/en/guides/gameplay' },
  { label: 'Cards', href: '/en/cards' },
  { label: 'Collectibles', href: '/en/collectibles/figurines' },
  { label: 'Achievements', href: '/en/achievements' },
  { label: 'Game', href: '/en/game/where-to-play' },
] as const satisfies readonly PublicNavigationItem[];

export const PUBLIC_ROUTE_COUNT = 13;

if (PUBLIC_ROUTES.length !== PUBLIC_ROUTE_COUNT) {
  throw new Error(
    `Expected ${PUBLIC_ROUTE_COUNT} public routes, received ${PUBLIC_ROUTES.length}`,
  );
}

if (new Set(PUBLIC_ROUTES).size !== PUBLIC_ROUTES.length) {
  throw new Error('PUBLIC_ROUTES must not contain duplicate routes');
}

const groupedRoutes = PUBLIC_NAVIGATION_GROUPS.flatMap((group) =>
  group.items.map((item) => item.href),
);

if (
  groupedRoutes.length !== PUBLIC_ROUTES.length - 1 ||
  groupedRoutes.some((route, index) => route !== PUBLIC_ROUTES[index + 1])
) {
  throw new Error('PUBLIC_NAVIGATION_GROUPS must match the public article routes');
}
