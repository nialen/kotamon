import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import type { PublicNavigationItem } from '@/content/routes';

export type DirectorySection = {
  title: string;
  description: string;
  entries: { title: string; href: PublicNavigationItem['href']; description: string }[];
};

const SECTIONS: DirectorySection[] = [
  {
    title: 'Getting Started',
    description: 'Choose an action plan for your first session or an explanation of how the game systems fit together.',
    entries: [
      { title: 'Beginner Guide', href: '/en/guides/beginner-guide', description: 'What to do first, what to keep, and which decisions can wait. Follow a practical starting sequence without a rigid upgrade build.' },
      { title: 'Gameplay Guide', href: '/en/guides/gameplay', description: 'Understand the core loop of searching, recycling, orders and collecting. See how card condition and recurring trash piles connect.' },
    ],
  },
  {
    title: 'Progression',
    description: 'Balance income, collection goals and character growth using confirmed mechanics, not promised farming rates.',
    entries: [
      { title: 'Money Guide', href: '/en/guides/money', description: 'Compare income sources and the reasons to keep or sell a find. Plan spending around upgrades and collection goals.' },
      { title: 'Upgrades Guide', href: '/en/guides/upgrades', description: 'Separate character attributes from card quality upgrades. Check practical purchase priorities and the confirmed all-attributes milestone.' },
    ],
  },
  {
    title: 'Cards',
    description: 'Use the Cards Hub for the collection overview, then open the guide for the specific card task in front of you.',
    entries: [
      { title: 'Cards Hub', href: '/en/cards', description: 'Browse the documented color sets and special card. Compare condition, repairs, duplicate exchanges and collection goals.' },
      { title: 'Card Repair', href: '/en/guides/card-repair', description: 'Follow the five-fragment assembly workflow at the glue table. Keep repair separate from duplicate-card quality exchanges.' },
      { title: 'Foil Cards', href: '/en/guides/foil-cards', description: 'Understand foil collection goals and their relationship to cereal boxes. Drop rates and complete foil eligibility remain unconfirmed.' },
      { title: 'Cereal Boxes', href: '/en/guides/cereal-boxes', description: 'Check the documented search and late-game purchase routes. Review the all-attributes requirement before budgeting for boxes.' },
    ],
  },
  {
    title: 'Exploration',
    description: 'Track discoveries beyond the card collection, with evidence limits kept separate from player-reported routes.',
    entries: [
      { title: 'Collectibles Hub', href: '/en/collectibles', description: 'Choose a figurine, audiotape or secret-area guide. Separate confirmed collection milestones from community route reports.' },
      { title: 'Secret Location', href: '/en/guides/secret-location', description: 'Review the official secret-area hint and the community-reported route. Check the caveats before attempting it.' },
      { title: 'Figurines', href: '/en/collectibles/figurines', description: 'Check confirmed figurine collection goals and relevant patch changes. Avoid treating random finds as a guaranteed location route.' },
      { title: 'Audiotapes', href: '/en/collectibles/audiotapes', description: 'Follow the confirmed audiotape collection milestones. See what is known without inventing an item-by-item location list.' },
    ],
  },
  {
    title: 'Game Help',
    description: 'Protect existing progress or find the official release before returning to the collection.',
    entries: [
      { title: 'Save Not Working', href: '/en/guides/save-not-working', description: 'Preserve the last good save, distinguish Cloud sync from local progress, and check documented save fixes before troubleshooting.' },
      { title: 'Where to Play', href: '/en/game/where-to-play', description: 'Find the official Steam listing, release information and Windows requirements. No unofficial download mirrors.' },
      { title: 'Game Information', href: '/en/game', description: 'Check release, platform and studio facts, with access to the full PC requirements comparison and verified credits.' },
      { title: 'Updates', href: '/en/updates', description: 'Review dated official changes to saves, cards and collecting. Distinguish released fixes from plans that still await confirmation.' },
    ],
  },
];

export function GuideDirectory({ sections = SECTIONS }: { sections?: DirectorySection[] } = {}) {
  return (
    <div className="guide-directory">
      {sections.map(({ title, description, entries }) => {
        const id = `directory-${title.toLowerCase().replaceAll(' ', '-')}`;
        return (
          <section aria-labelledby={id} key={id}>
            <h2 id={id}>{title}</h2>
            <p>{description}</p>
            <div className="guide-directory__grid">
              {entries.map((entry) => (
                <Link className="guide-directory__card" href={entry.href} key={entry.href}>
                  <h3>{entry.title}</h3>
                  <p>{entry.description}</p>
                  <span>Explore topic <ArrowRight aria-hidden="true" size={18} weight="bold" /></span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
