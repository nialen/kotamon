import Image from 'next/image';

import { GuideLink, HomeSection } from '@/components/home/home-section';
import { HomeScreenshot } from '@/components/home/home-screenshot';
import { SITE } from '@/lib/site';

const PATCH_NEWS =
  'https://store.steampowered.com/news/app/4294490/view/692018855848968607';

export function CardsFeature() {
  return (
    <HomeSection id="home-cards-title" title="KOTAMON Cards">
      <div className="mt-6 grid grid-cols-1 items-start gap-7 lg:grid-cols-2 lg:items-center lg:gap-10">
        <figure className="m-0 overflow-hidden rounded-[var(--radius-surface)] border-2 border-[var(--border-strong)] bg-[var(--surface)]">
          <Image
            alt="The Merkota card in KOTAMON's collection interface, with rarity, quality and collection controls"
            className="block h-auto w-full"
            height={719}
            loading="lazy"
            sizes="(max-width: 1023px) calc(100vw - 2rem), 46vw"
            src="/images/home/kotamon-card-repair.webp"
            width={1280}
          />
          <figcaption className="px-4 py-3 text-sm font-semibold text-[var(--muted-foreground)]">
            Official Steam screenshot. UI and prices shown may differ by version.
          </figcaption>
        </figure>
        <div className="space-y-5 font-semibold text-[var(--muted-foreground)]">
          <p className="text-lg">
            Collect the color sets, repair damaged cards and work toward your
            foil collection. Card condition, rarity and foil status are
            different things to check.
          </p>
          <div>
            <h3 className="font-display text-xl text-[var(--foreground-strong)]">Repair a damaged card</h3>
            <p className="mt-2">Check the current repair flow before spending another card.</p>
            <GuideLink href="/en/guides/card-repair">Card repair guide</GuideLink>
          </div>
          <div className="rounded-[var(--radius-notice)] border-l-4 border-accent bg-[var(--surface-muted)] p-4">
            <h3 className="font-display text-lg text-[var(--foreground-strong)]">Keep an eye on duplicates</h3>
            <p className="mt-2">
              The August 27 developer update explains that three duplicate cards
              of the same quality can be exchanged for a better-quality card,
              including foil. This was possible from release; the update added
              a tutorial and clearer indicators.
            </p>
            <a className="mt-2 inline-block text-sm" href={PATCH_NEWS}>Source: August 27 developer announcement</a>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <GuideLink href="/en/cards">Browse KOTAMON Cards</GuideLink>
            <GuideLink href="/en/guides/foil-cards">Understand foil cards</GuideLink>
            <GuideLink href="/en/guides/cereal-boxes">Find cereal boxes</GuideLink>
          </div>
        </div>
      </div>
      <div className="mt-8 grid items-stretch gap-7 lg:grid-cols-2 lg:gap-10">
        <HomeScreenshot src="/images/home/kotamon-card-board.webp" alt="KOTAMON collection board displaying several collected cards in a blue frame" title="See your collection take shape" href="/en/cards" linkLabel="Open the card reference">
          The collection board makes the card hunt visible, with found cards displayed together. Compare your collection with the card reference, which separates official collection goals from community-documented card names.
        </HomeScreenshot>
        <HomeScreenshot src="/images/home/kotamon-card-pieces.webp" alt="A damaged KOTAMON card split into outlined pieces on a workbench beside a repair tool" title="Put the pieces together" href="/en/guides/card-repair" linkLabel="Follow the card repair guide">
          This workbench view shows a card in separate pieces, ready to be assembled. Check the repair guide before working on a damaged find, and keep a separate good save before making changes.
        </HomeScreenshot>
      </div>
    </HomeSection>
  );
}

export function ArtistsFeature() {
  return (
    <HomeSection className="!pt-4" id="home-artists-title" title="KOTAMON Artists">
      <div className="mt-6 grid items-start gap-7 lg:grid-cols-2 lg:items-center lg:gap-10">
      <div className="border-l-4 border-accent pl-5 md:pl-7">
        <p className="max-w-[75ch] text-lg font-semibold text-[var(--muted-foreground)]">
          The cards feature hand-drawn illustrations. Our artists guide separates
          the verified studio credit from individual illustrator names that
          still need confirmation in the game&apos;s credits.
        </p>
        <p className="mt-3 max-w-[75ch] font-semibold text-[var(--muted-foreground)]">
          Explore the artwork attribution notes without mistaking a studio,
          community username or fan submission for a confirmed card artist.
        </p>
        <div className="mt-5"><GuideLink href="/en/game/artists">Explore KOTAMON Artists</GuideLink></div>
      </div>
      <HomeScreenshot src="/images/home/kotamon-story-art.webp" alt="An illustrated KOTAMON story panel showing the characters beside a rubbish pile" title="Artwork beyond the cards" href="/en/game/artists" linkLabel="Read the artwork credit notes">
        Illustrated story panels give the dump and its characters a different view from the first-person gameplay. This is an official in-game screenshot, not confirmation of an individual illustrator; check the artist guide for verified credit boundaries.
      </HomeScreenshot>
      </div>
    </HomeSection>
  );
}

export function DownloadFeature() {
  return (
    <HomeSection id="home-download-title" title="KOTAMON Demo & Download">
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="flex flex-col rounded-[var(--radius-surface)] border-2 border-[var(--border-strong)] bg-[var(--surface)] p-6 md:p-8">
          <h3 className="font-display text-2xl text-[var(--foreground-strong)]">KOTAMON Demo</h3>
          <p className="mt-4 font-semibold text-[var(--muted-foreground)]">
            A demo was available before the full release. We have not confirmed
            an active demo download in the current Steam listing, so check the
            store for today&apos;s options.
          </p>
          <p className="mt-3 font-semibold text-[var(--muted-foreground)]">
            This site does not host game installers or unofficial demo mirrors.
          </p>
          <a className="mt-auto inline-block pt-5 font-extrabold" href={SITE.steamUrl}>Check demo availability on Steam</a>
        </div>
        <a
          className="home-download-card flex flex-col rounded-[var(--radius-surface)] border-2 border-[var(--border-strong)] bg-[var(--surface-muted)] p-6 text-[var(--foreground-strong)] no-underline shadow-[5px_5px_0_var(--shadow-color)] hover:-translate-y-0.5 md:p-8"
          href={SITE.steamUrl}
        >
          <h3 className="font-display text-2xl">KOTAMON Download</h3>
          <p className="mt-4 font-semibold">
            Get the Windows PC version through Steam. Confirm the listing is
            from KotaMota Games and Polnoch, then use Steam to purchase and
            install the game.
          </p>
          <p className="mt-3 font-semibold">
            Use the official platform listing instead of copied storefront claims.
          </p>
          <span className="mt-auto inline-block pt-5 font-extrabold underline decoration-accent decoration-2 underline-offset-4">Open KOTAMON on Steam</span>
        </a>
      </div>
      <div className="mt-5"><GuideLink href="/en/game/where-to-play">Confirm where to play</GuideLink></div>
    </HomeSection>
  );
}

export function CollectiblesFeature() {
  return (
    <HomeSection id="home-collectibles-title" title="Collectibles & Secret Locations">
      <p className="mt-4 max-w-[66ch] text-lg font-semibold text-[var(--muted-foreground)]">
        There is more to find than cards. Use the collection checklists for
        figurines and audiotapes, or open the spoiler-aware secret location guide.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-7 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-center">
        <figure className="m-0 overflow-hidden rounded-[var(--radius-surface)] border-2 border-[var(--border-strong)] bg-[var(--surface)]">
          <Image
            alt="A collectible figurine found among barrels and tires in KOTAMON"
            className="block h-auto w-full"
            height={720}
            loading="lazy"
            sizes="(max-width: 767px) calc(100vw - 2rem), 40vw"
            src="/images/home/kotamon-figurine.webp"
            width={1280}
          />
          <figcaption className="px-4 py-3 text-sm font-semibold text-[var(--muted-foreground)]">
            Collectible discovery shown in an official Steam screenshot.
          </figcaption>
        </figure>
        <div className="grid gap-5">
          <div>
            <h3 className="font-display text-xl text-[var(--foreground-strong)]">Track the finds you still need</h3>
            <p className="mt-2 font-semibold text-[var(--muted-foreground)]">
              Keep world finds separate from card completion and use the
              achievement milestones to check your progress.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
              <GuideLink href="/en/collectibles/figurines">Figurine locations</GuideLink>
              <GuideLink href="/en/collectibles/audiotapes">Audiotape guide</GuideLink>
            </div>
          </div>
          <div className="border-t-2 border-[var(--border)] pt-5">
            <h3 className="font-display text-xl text-[var(--foreground-strong)]">Reach the secret location</h3>
            <p className="mt-2 font-semibold text-[var(--muted-foreground)]">
              Follow a spoiler-aware route with patch limits stated clearly.
              The reported entry method is community-sourced and may change.
            </p>
            <div className="mt-3"><GuideLink href="/en/guides/secret-location">Secret location guide</GuideLink></div>
          </div>
        </div>
      </div>
      <div className="mt-8 grid items-start gap-7 lg:grid-cols-2 lg:items-center lg:gap-10">
        <HomeScreenshot src="/images/home/kotamon-figurine-display.webp" height={723} alt="Collected KOTAMON figurines arranged on wooden shelves beside a red tool cabinet" title="From a find to a display" href="/en/collectibles/figurines" linkLabel="Plan your figurine checklist">
          The figurine shelf shows a collection after discovery, rather than a pickup location. Use the checklist to track what you still need; this display is not evidence that every figurine has a fixed spawn point.
        </HomeScreenshot>
        <div>
          <h3 className="font-display text-2xl text-[var(--foreground-strong)]">Keep each collection on its own checklist</h3>
          <p className="mt-4 max-w-[60ch] text-lg font-semibold text-[var(--muted-foreground)]">Cards, figurines and audiotapes are different collection goals. A full shelf does not tell you how many audiotapes have counted, so check each guide and the matching achievement separately.</p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
            <GuideLink href="/en/collectibles/audiotapes">Track audiotapes</GuideLink>
            <GuideLink href="/en/achievements">Check achievement milestones</GuideLink>
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
