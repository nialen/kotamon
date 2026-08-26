import { ArrowSquareOut } from '@phosphor-icons/react/dist/ssr';

import { PUBLIC_NAVIGATION_GROUPS } from '@/content/routes';
import { SITE } from '@/lib/site';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell-container site-footer__grid">
        <div className="site-footer__identity">
          <a className="site-footer__brand" href={`/${SITE.locale}`}>
            {SITE.name}
          </a>
          <p>{SITE.positioning}</p>
          <a
            className="site-footer__steam-link"
            href={SITE.steamUrl}
            rel="noreferrer noopener"
            target="_blank"
          >
            View KOTAMON on Steam
            <ArrowSquareOut aria-hidden="true" size={17} weight="bold" />
          </a>
        </div>

        <nav aria-label="Footer navigation" className="site-footer__navigation">
          {PUBLIC_NAVIGATION_GROUPS.map((group) => (
            <section key={group.label}>
              <h2>{group.label}</h2>
              <ul>
                {group.items.map((item) => (
                  <li key={item.href}>
                    <a href={item.href}>{item.label}</a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>

        <p className="site-footer__legal">{SITE.legalDisclaimer}</p>
      </div>
    </footer>
  );
}
