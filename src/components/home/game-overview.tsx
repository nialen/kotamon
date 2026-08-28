import { HomeSection } from '@/components/home/home-section';
import { HomeScreenshot } from '@/components/home/home-screenshot';
import { SITE } from '@/lib/site';

const FACTS = [
  ['Genre', 'Indie / Simulation'],
  ['Developer', 'KotaMota Games'],
  ['Publisher', 'Polnoch'],
  ['Platform', 'Windows PC'],
  ['Release', 'August 20, 2026'],
  ['Play mode', 'Single-player'],
] as const;

export function GameOverview() {
  return (
    <>
      <HomeSection id="about-kotamon-title" title="What is KOTAMON?">
        <div className="mt-6 grid items-start gap-7 lg:grid-cols-2 lg:items-center lg:gap-10">
        <div className="max-w-[76ch] space-y-4 text-lg font-semibold leading-relaxed text-[var(--muted-foreground)]">
          <p>
            KOTAMON is a relaxed, first-person collecting game set at a garbage
            dump. Search the rubbish, clear the yard and uncover cards and
            other discarded treasures while working for the site owner.
          </p>
          <p>
            The collection grows as you find, repair and trade cards. Alongside
            the card sets, there are figurines, audiotapes and other finds to
            track. This wiki brings the relevant guides together so you can
            follow the part of the collection you are working on.
          </p>
          <p>
            Developed by KotaMota Games and published by Polnoch, the full game
            launched on Steam for Windows PC on August 20, 2026. A demo preceded
            the release; its current availability should be checked on the{' '}
            <a href={SITE.steamUrl}>official Steam listing</a>.
          </p>
        </div>
        <HomeScreenshot src="/images/home/kotamon-trash-search.webp" alt="First-person KOTAMON view of a rubbish pile with cartons, tires and a collection bag" title="Start with the search" href="/en/guides/gameplay" linkLabel="Learn the gameplay loop">
          The dump is your starting point: inspect piles of discarded objects with your collection bag in hand. Use the gameplay guide to connect searching, recycling and keeping useful finds.
        </HomeScreenshot>
        </div>
      </HomeSection>
      <HomeSection className="!pt-0" id="quick-facts-title" title="KOTAMON Quick Facts">
        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-5 rounded-[var(--radius-surface)] border-2 border-[var(--border-strong)] bg-[var(--surface-muted)] p-6 sm:grid-cols-2 lg:grid-cols-3">
          {FACTS.map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm font-bold text-[var(--muted-foreground)]">{label}</dt>
              <dd className="m-0 mt-1 text-lg font-extrabold text-[var(--foreground-strong)]">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-sm font-semibold text-[var(--muted-foreground)]">
          Release and platform details: <a href={SITE.steamUrl}>KOTAMON on Steam</a>.
        </p>
      </HomeSection>
    </>
  );
}
