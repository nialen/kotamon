import Link from 'next/link';

import { HomeSection } from '@/components/home/home-section';
import { UpdatedAt } from '@/components/site/updated-at';
import { getPublicEntries } from '@/content/registry';

const FEATURED_GUIDES = new Map([
  ['guides/gameplay', 'Start with the collecting loop, progression and the basics of working at the dump.'],
  ['cards', 'Browse the current card reference and its official-versus-community source notes.'],
  ['game/artists', 'Check artwork attribution and where individual illustrator credits can be verified.'],
  ['guides/secret-location', 'Read the optional spoiler route and its patch-sensitive limitations.'],
  ['guides/foil-cards', 'Understand foil collection goals and the limits of published drop-rate information.'],
  ['achievements', 'Track the 40 Steam achievements by collection and activity.'],
]);

export function LatestGuides() {
  const guides = getPublicEntries()
    .filter((entry) => FEATURED_GUIDES.has(entry.slug))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) ||
      [...FEATURED_GUIDES.keys()].indexOf(a.slug) - [...FEATURED_GUIDES.keys()].indexOf(b.slug));

  return (
    <HomeSection id="latest-guides-title" title="Latest KOTAMON Guides">
      <p className="mt-4 max-w-[65ch] font-semibold text-[var(--muted-foreground)]">
        Selected published guides, ordered by their recorded update date.
        Check each guide&apos;s source notes for version-specific limits.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-x-10 md:grid-cols-2">
        {guides.map((guide) => (
          <article className="flex flex-col border-t-2 border-[var(--border)] py-6" key={guide.slug}>
            <h3 className="font-display text-xl text-[var(--foreground-strong)]">
              <Link className="no-underline" href={`/${guide.locale}/${guide.slug}`}>{guide.title}</Link>
            </h3>
            <p className="mt-3 font-semibold text-[var(--muted-foreground)]">{FEATURED_GUIDES.get(guide.slug)}</p>
            <div className="mt-auto flex flex-col items-start gap-2 pt-4">
              <UpdatedAt updatedAt={guide.updatedAt} />
              <Link aria-label={`Read guide: ${guide.title}`} className="font-extrabold" href={`/${guide.locale}/${guide.slug}`}>Read guide</Link>
            </div>
          </article>
        ))}
      </div>
    </HomeSection>
  );
}
