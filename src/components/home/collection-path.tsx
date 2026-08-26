import {
  CardsThree,
  CassetteTape,
  Package,
  PersonSimple,
  Trophy,
} from '@phosphor-icons/react/dist/ssr';
import type { Icon } from '@phosphor-icons/react';
import Link from 'next/link';

import type { PublicNavigationItem } from '@/content/routes';

const COLLECTION_STOPS: ReadonlyArray<{
  readonly label: string;
  readonly href: PublicNavigationItem['href'];
  readonly icon: Icon;
}> = [
  { label: 'Cards', href: '/en/cards', icon: CardsThree },
  {
    label: 'Figurines',
    href: '/en/collectibles/figurines',
    icon: PersonSimple,
  },
  {
    label: 'Audiotapes',
    href: '/en/collectibles/audiotapes',
    icon: CassetteTape,
  },
  {
    label: 'Cereal boxes',
    href: '/en/guides/cereal-boxes',
    icon: Package,
  },
  { label: 'Achievements', href: '/en/achievements', icon: Trophy },
];

export function CollectionPath() {
  return (
    <section
      aria-labelledby="collection-path-title"
      className="border-y-2 border-[var(--border-strong)] bg-[var(--surface-muted)] py-16 md:py-24"
    >
      <div className="shell-container">
        <header className="max-w-[44rem]">
          <h2
            className="m-0 text-balance font-display text-3xl leading-tight tracking-[-0.025em] text-[var(--foreground-strong)] md:text-5xl"
            id="collection-path-title"
          >
            Build the full collection
          </h2>
          <p className="mt-4 max-w-[60ch] text-lg font-semibold text-[var(--muted-foreground)]">
            Move from binder pages to world finds, then close the loop with
            achievements.
          </p>
        </header>

        <nav aria-label="Collection guide path" className="mt-10">
          <ol className="relative m-0 grid list-none grid-cols-1 gap-5 p-0 before:absolute before:bottom-8 before:left-6 before:top-8 before:w-0.5 before:bg-[var(--border-strong)] md:grid-cols-5 md:gap-4 md:before:bottom-auto md:before:left-[10%] md:before:right-[10%] md:before:top-7 md:before:h-0.5 md:before:w-auto">
            {COLLECTION_STOPS.map((stop) => {
              const StopIcon = stop.icon;

              return (
                <li className="relative" key={stop.href}>
                  <Link
                    className="group grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-4 rounded-[var(--radius-surface)] p-2 text-[var(--foreground-strong)] no-underline hover:bg-[var(--surface)] md:grid-cols-1 md:justify-items-center md:gap-3 md:p-3 md:text-center"
                    href={stop.href}
                  >
                    <span className="inline-grid size-14 place-items-center rounded-full border-2 border-[var(--border-strong)] bg-highlight text-[var(--highlight-foreground)] shadow-[3px_3px_0_var(--shadow-color)] group-hover:border-accent">
                      <StopIcon aria-hidden="true" size={27} weight="bold" />
                    </span>
                    <span className="font-extrabold underline decoration-accent decoration-2 underline-offset-4">
                      {stop.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </section>
  );
}
