'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

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

const NON_CREATIVE_ELEMENTS = 'link, meta, script, style, template';
const SECRET_LOCATION_PATH = '/en/guides/secret-location';
const SECRET_LOCATION_SLOT = '[data-secret-location-ad-slot]';

function hasRenderableCreative(container: HTMLElement) {
  return [...container.querySelectorAll('*')].some((element) => {
    if (
      element.matches(NON_CREATIVE_ELEMENTS) ||
      element.getAttribute('aria-hidden') === 'true' ||
      (element instanceof HTMLElement && element.hidden)
    ) {
      return false;
    }

    const style = getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return false;
    }

    const bounds = element.getBoundingClientRect();
    return (
      element.getClientRects().length > 0 &&
      bounds.width > 0 &&
      bounds.height > 0
    );
  });
}

export function AdsterraNativeBanner() {
  const pathname = usePathname();
  const isMonetized = MONETIZED_ROUTES.has(pathname);
  const adRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const creativeRenderedRef = useRef(false);
  const [hasCreative, setHasCreative] = useState(false);
  const isVisible = isMonetized && hasCreative;

  useLayoutEffect(() => {
    const ad = adRef.current;
    const originalParent = ad?.parentNode;
    const originalNextSibling = ad?.nextSibling ?? null;

    if (!ad || !originalParent || pathname !== SECRET_LOCATION_PATH) {
      return;
    }

    const slot = document.querySelector(SECRET_LOCATION_SLOT);
    if (!slot) {
      return;
    }

    slot.append(ad);

    return () => {
      if (!originalParent.isConnected) {
        return;
      }

      originalParent.insertBefore(
        ad,
        originalNextSibling?.parentNode === originalParent
          ? originalNextSibling
          : null,
      );
    };
  }, [pathname]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !isMonetized) {
      return;
    }

    const updateCreativeState = () => {
      if (
        !creativeRenderedRef.current &&
        hasRenderableCreative(container)
      ) {
        creativeRenderedRef.current = true;
        setHasCreative(true);
      }
    };

    updateCreativeState();

    const observer = new MutationObserver(updateCreativeState);
    observer.observe(container, {
      attributeFilter: ['aria-hidden', 'class', 'hidden', 'style'],
      attributes: true,
      childList: true,
      subtree: true,
    });
    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(updateCreativeState);
    resizeObserver?.observe(container);

    return () => {
      observer.disconnect();
      resizeObserver?.disconnect();
    };
  }, [isMonetized]);

  return (
    <aside
      aria-hidden={!isVisible}
      aria-label="Advertisement"
      className="native-ad shell-container"
      data-ad-state={isVisible ? 'filled' : 'empty'}
      data-adsterra-native
      hidden={!isMonetized}
      ref={adRef}
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
