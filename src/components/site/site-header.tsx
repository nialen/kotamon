'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { HEADER_NAVIGATION } from '@/content/routes';
import { SITE } from '@/lib/site';
import Image from 'next/image';

import { MobileNav } from './mobile-nav';
import { PrimaryNav } from './primary-nav';
import { ThemeToggle } from './theme-toggle';
import { useHeaderScroll } from './use-header-scroll';

export function SiteHeader() {
  const pathname = usePathname();
  return <HeaderContent key={pathname} />;
}

function HeaderContent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { compact, hidden } = useHeaderScroll(menuOpen);
  return (
    <div className="site-header-slot">
    <header className="site-header" data-compact={compact} data-scroll-hidden={hidden}>
      <div className="shell-container site-header__inner">
        <a className="site-brand" href={`/${SITE.locale}`}>
          <span aria-hidden="true" className="site-brand__mark">
            <span className="site-brand__mark-fallback">K</span>
            <Image
              alt="KOTAMON logo"
              className="site-brand__mark-image"
              height="38"
              src="/brand/icon-192.png"
              unoptimized
              width="38"
            />
          </span>
          <span className="site-brand__name">{SITE.name}</span>
          <span className="site-brand__locale" lang="en">
            EN
          </span>
        </a>

        <PrimaryNav />

        <div className="site-header__actions">
          <ThemeToggle />
          <MobileNav groups={HEADER_NAVIGATION} onOpenChange={setMenuOpen} />
        </div>
      </div>
    </header>
    </div>
  );
}
