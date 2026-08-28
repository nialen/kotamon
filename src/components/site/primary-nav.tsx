'use client';

import { usePathname } from 'next/navigation';

import { PRIMARY_NAVIGATION } from '@/content/routes';

// Topic membership is explicit: some card and collectible guides live under /guides.
const SECTION_ROUTES: Record<string, readonly string[]> = {
  Gameplay: ['/en/guides/gameplay', '/en/guides/save-not-working'],
  Cards: ['/en/cards', '/en/guides/card-repair', '/en/guides/foil-cards', '/en/guides/cereal-boxes'],
  Collectibles: ['/en/collectibles/figurines', '/en/collectibles/audiotapes', '/en/guides/secret-location'],
  Achievements: ['/en/achievements'],
  Game: ['/en/game/where-to-play', '/en/game/artists'],
};

export function PrimaryNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation" className="primary-nav">
      <ul>
        {PRIMARY_NAVIGATION.map((item) => (
          <li key={item.href}>
            <a
              aria-current={pathname === item.href ? 'page' : SECTION_ROUTES[item.label]?.includes(pathname) ? 'location' : undefined}
              href={item.href}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
