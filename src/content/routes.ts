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
  '/en/guides',
  '/en/guides/beginner-guide',
  '/en/guides/money',
  '/en/guides/upgrades',
  '/en/collectibles',
  '/en/game',
  '/en/game/system-requirements',
  '/en/updates',
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
      { label: 'All guides', href: '/en/guides' },
      { label: 'Beginner guide', href: '/en/guides/beginner-guide' },
      { label: 'Gameplay', href: '/en/guides/gameplay' },
      { label: 'Money', href: '/en/guides/money' },
      { label: 'Upgrades', href: '/en/guides/upgrades' },
      { label: 'Save issues', href: '/en/guides/save-not-working' },
    ],
  },
  {
    label: 'Cards',
    items: [
      { label: 'Cards', href: '/en/cards' },
      { label: 'Card repair', href: '/en/guides/card-repair' },
      { label: 'Foil cards', href: '/en/guides/foil-cards' },
      { label: 'Cereal boxes', href: '/en/guides/cereal-boxes' },
    ],
  },
  {
    label: 'Collectibles',
    items: [
      { label: 'All collectibles', href: '/en/collectibles' },
      { label: 'Figurines', href: '/en/collectibles/figurines' },
      { label: 'Audiotapes', href: '/en/collectibles/audiotapes' },
      { label: 'Secret location', href: '/en/guides/secret-location' },
    ],
  },
  {
    label: 'Achievements',
    items: [{ label: 'Achievements', href: '/en/achievements' }],
  },
  {
    label: 'Game',
    items: [
      { label: 'Game overview', href: '/en/game' },
      { label: 'Where to play', href: '/en/game/where-to-play' },
      { label: 'Artists', href: '/en/game/artists' },
      { label: 'System requirements', href: '/en/game/system-requirements' },
      { label: 'Updates', href: '/en/updates' },
    ],
  },
] as const satisfies readonly PublicNavigationGroup[];

export const PRIMARY_NAVIGATION = [
  { label: 'Guides', href: '/en/guides' },
  { label: 'Cards', href: '/en/cards' },
  { label: 'Collectibles', href: '/en/collectibles' },
  { label: 'Achievements', href: '/en/achievements' },
  { label: 'Game', href: '/en/game' },
] as const satisfies readonly PublicNavigationItem[];

export const PUBLIC_ROUTE_COUNT = 21;

export type HeaderNavigationGroup = PublicNavigationItem & {
  readonly items: readonly PublicNavigationItem[];
};

// Header disclosures use the approved display order; footer discovery stays unchanged.
export const HEADER_NAVIGATION = [
  { label: 'Guides', href: '/en/guides', items: [
    { label: 'Beginner Guide', href: '/en/guides/beginner-guide' },
    { label: 'Gameplay', href: '/en/guides/gameplay' },
    { label: 'Money', href: '/en/guides/money' },
    { label: 'Upgrades', href: '/en/guides/upgrades' },
    { label: 'Save Help', href: '/en/guides/save-not-working' },
  ] },
  { label: 'Cards', href: '/en/cards', items: [
    { label: 'Cards Hub', href: '/en/cards' },
    { label: 'Card Repair', href: '/en/guides/card-repair' },
    { label: 'Foil Cards', href: '/en/guides/foil-cards' },
    { label: 'Cereal Boxes', href: '/en/guides/cereal-boxes' },
  ] },
  { label: 'Collectibles', href: '/en/collectibles', items: [
    { label: 'Collectibles Hub', href: '/en/collectibles' },
    { label: 'Secret Location', href: '/en/guides/secret-location' },
    { label: 'Figurines', href: '/en/collectibles/figurines' },
    { label: 'Audiotapes', href: '/en/collectibles/audiotapes' },
  ] },
  { label: 'Achievements', href: '/en/achievements', items: [] },
  { label: 'Game', href: '/en/game', items: [
    { label: 'Game Hub', href: '/en/game' },
    { label: 'Where to Play', href: '/en/game/where-to-play' },
    { label: 'System Requirements', href: '/en/game/system-requirements' },
    { label: 'Artists', href: '/en/game/artists' },
    { label: 'Updates', href: '/en/updates' },
  ] },
] as const satisfies readonly HeaderNavigationGroup[];

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
  new Set(groupedRoutes).size !== groupedRoutes.length ||
  PUBLIC_ROUTES.slice(1).some((route) => !groupedRoutes.some((grouped) => grouped === route))
) {
  throw new Error('PUBLIC_NAVIGATION_GROUPS must match the public article routes');
}
