'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

const MONETIZED_ROUTES = new Set([
  '/en',
  '/en/guides',
  '/en/guides/beginner-guide',
  '/en/guides/gameplay',
  '/en/guides/money',
  '/en/guides/upgrades',
  '/en/guides/card-repair',
  '/en/guides/foil-cards',
  '/en/guides/cereal-boxes',
  '/en/guides/save-not-working',
  '/en/guides/secret-location',
  '/en/cards',
  '/en/collectibles',
  '/en/collectibles/figurines',
  '/en/collectibles/audiotapes',
  '/en/achievements',
  '/en/game',
  '/en/game/where-to-play',
  '/en/game/artists',
  '/en/game/system-requirements',
  '/en/updates',
]);

export function AdsterraNativeBanner() {
  const pathname = usePathname();
  const isMonetized = MONETIZED_ROUTES.has(pathname);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasCreative, setHasCreative] = useState(false);
  const isVisible = isMonetized && hasCreative;

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !isMonetized) {
      setHasCreative(false);
      return;
    }

    const updateCreativeState = () => {
      setHasCreative(container.childElementCount > 0);
    };

    updateCreativeState();

    const observer = new MutationObserver(updateCreativeState);
    observer.observe(container, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [isMonetized]);

  return (
    <aside
      aria-hidden={!isVisible}
      aria-label="Advertisement"
      className="native-ad shell-container"
      data-ad-state={isVisible ? 'filled' : 'empty'}
      data-adsterra-native
      hidden={!isMonetized}
    >
      <div className="native-ad__frame">
        {isVisible ? <p className="native-ad__label">Advertisement</p> : null}
        <div
          id="container-10de3692fca1aa56ca3ff0485ea3e9e6"
          ref={containerRef}
        />
      </div>
      {isMonetized ? (
        <Script
          async
          data-cfasync="false"
          id="adsterra-native-banner"
          src="https://pl31104288.profitableratecpmnetwork.com/10de3692fca1aa56ca3ff0485ea3e9e6/invoke.js"
          strategy="lazyOnload"
        />
      ) : null}
    </aside>
  );
}
