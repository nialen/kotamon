import {
  ArrowRight,
  CardsThree,
  GameController,
} from '@phosphor-icons/react/dist/ssr';
import Image from 'next/image';
import Link from 'next/link';

import {
  PUBLIC_NAVIGATION_GROUPS,
  type PublicNavigationItem,
} from '@/content/routes';

function getPublicItem(
  href: PublicNavigationItem['href'],
): PublicNavigationItem {
  const publicItems = PUBLIC_NAVIGATION_GROUPS.reduce<PublicNavigationItem[]>(
    (items, group) => {
      items.push(...group.items);
      return items;
    },
    [],
  );
  const item = publicItems.find((candidate) => candidate.href === href);

  if (!item) {
    throw new Error(`Missing public navigation item for ${href}`);
  }

  return item;
}

const cardRepair = getPublicItem('/en/guides/card-repair');
const foilCards = getPublicItem('/en/guides/foil-cards');
const secretLocation = getPublicItem('/en/guides/secret-location');
const whereToPlay = getPublicItem('/en/game/where-to-play');

const cardClassName =
  'group relative flex h-full min-h-52 flex-col overflow-hidden rounded-[var(--radius-surface)] border-2 border-[var(--border-strong)] bg-[var(--surface)] text-[var(--foreground-strong)] no-underline shadow-[5px_5px_0_var(--shadow-color)] hover:-translate-y-1 hover:shadow-[8px_8px_0_var(--shadow-color)] active:translate-y-px';

function CardLink({ item }: { readonly item: PublicNavigationItem }) {
  return (
    <span className="mt-auto inline-flex items-center gap-2 font-extrabold underline decoration-accent decoration-2 underline-offset-4">
      {item.label}
      <span className="inline-grid size-8 place-items-center rounded-full bg-accent text-[var(--accent-foreground)] transition-transform group-hover:translate-x-1">
        <ArrowRight aria-hidden="true" size={17} weight="bold" />
      </span>
    </span>
  );
}

export function TaskGrid() {
  return (
    <section aria-labelledby="task-grid-title" className="shell-container py-16 md:py-24">
      <header className="max-w-[42rem]">
        <h2
          className="m-0 text-balance font-display text-3xl leading-tight tracking-[-0.025em] text-[var(--foreground-strong)] md:text-5xl"
          id="task-grid-title"
        >
          Pick the next task
        </h2>
        <p className="mt-4 max-w-[58ch] text-lg font-semibold text-[var(--muted-foreground)]">
          Jump straight to a practical answer, from card care to route finding.
        </p>
      </header>

      <div className="mt-9 grid grid-cols-1 gap-5 md:auto-rows-[13rem] md:grid-cols-12">
        <Link
          className={`${cardClassName} md:col-span-7 md:row-span-2`}
          href={cardRepair.href}
        >
          <Image
            alt="Layered paper cards in navy, coral, yellow, and foil white"
            className="block min-h-0 w-full flex-1 object-cover"
            height={1254}
            sizes="(max-width: 767px) calc(100vw - 2rem), 58vw"
            src="/images/home/card-stack.webp"
            width={1254}
          />
          <div className="p-5 md:p-6">
            <h3 className="m-0 font-display text-2xl leading-tight">
              Repair a damaged card
            </h3>
            <p className="mt-2 max-w-[48ch] font-semibold text-[var(--muted-foreground)]">
              Check the current repair flow before spending another card.
            </p>
            <CardLink item={cardRepair} />
          </div>
        </Link>

        <Link
          className={`${cardClassName} p-5 md:col-span-5 md:p-6`}
          href={foilCards.href}
          style={{
            background:
              'linear-gradient(135deg, var(--surface) 0 72%, color-mix(in srgb, var(--highlight) 58%, var(--surface)) 72%)',
          }}
        >
          <CardsThree aria-hidden="true" size={34} weight="bold" />
          <h3 className="mt-5 font-display text-2xl leading-tight">
            Understand foil cards
          </h3>
          <p className="mt-2 font-semibold text-[var(--muted-foreground)]">
            Separate official collection facts from careful guide notes.
          </p>
          <CardLink item={foilCards} />
        </Link>

        <Link
          className={`${cardClassName} md:col-span-5 md:row-span-2`}
          href={secretLocation.href}
        >
          <Image
            alt="Paper map with connected routes, markers, cards, and stars"
            className="block min-h-0 w-full flex-1 object-cover"
            height={1024}
            sizes="(max-width: 767px) calc(100vw - 2rem), 42vw"
            src="/images/home/discovery-map.webp"
            width={1536}
          />
          <div className="p-5 md:p-6">
            <h3 className="m-0 font-display text-2xl leading-tight">
              Reach the secret location
            </h3>
            <p className="mt-2 font-semibold text-[var(--muted-foreground)]">
              Follow a spoiler-aware route with patch limits stated clearly.
            </p>
            <CardLink item={secretLocation} />
          </div>
        </Link>

        <Link
          className={`${cardClassName} p-5 md:col-span-7 md:p-6`}
          href={whereToPlay.href}
          style={{
            background:
              'color-mix(in srgb, var(--kotamon-sky) 30%, var(--surface))',
          }}
        >
          <GameController aria-hidden="true" size={34} weight="bold" />
          <h3 className="mt-5 font-display text-2xl leading-tight">
            Confirm where to play
          </h3>
          <p className="mt-2 max-w-[48ch] font-semibold text-[var(--foreground-strong)]">
            Use the official platform listing instead of copied storefront claims.
          </p>
          <CardLink item={whereToPlay} />
        </Link>
      </div>
    </section>
  );
}
