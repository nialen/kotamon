import {
  PRIMARY_NAVIGATION,
  PUBLIC_NAVIGATION_GROUPS,
} from '@/content/routes';
import { SITE } from '@/lib/site';
import Image from 'next/image';

import { MobileNav } from './mobile-nav';
import { ThemeToggle } from './theme-toggle';

export function SiteHeader() {
  return (
    <header className="site-header">
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

        <nav aria-label="Primary navigation" className="primary-nav">
          <ul>
            {PRIMARY_NAVIGATION.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__actions">
          <ThemeToggle />
          <MobileNav groups={PUBLIC_NAVIGATION_GROUPS} />
        </div>
      </div>
    </header>
  );
}
