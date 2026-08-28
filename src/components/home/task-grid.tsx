import { ArrowRight, BookOpen, CardsThree, Coins, GameController, Package, TrendUp, Trophy } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

import { HomeSection } from '@/components/home/home-section';
import type { PublicNavigationItem } from '@/content/routes';

const TASKS = [
  { title: 'Beginner Guide', href: '/en/guides/beginner-guide', icon: BookOpen, description: 'Choose your first actions, inspect useful finds and avoid common collecting mistakes.', action: 'Plan your first session', tint: 'bg-[var(--surface-muted)]' },
  { title: 'Gameplay', href: '/en/guides/gameplay', icon: GameController, description: 'Learn the collecting loop, upgrades and the basics of working at the dump.', action: 'Read the gameplay guide', tint: 'bg-[var(--surface-muted)]' },
  { title: 'Cards', href: '/en/cards', icon: CardsThree, description: 'Browse the card sets and follow links to repair, cereal boxes and foil collecting.', action: 'Browse the card reference', tint: 'bg-[var(--surface)]' },
  { title: 'Money', href: '/en/guides/money', icon: Coins, description: 'Weigh income, card selling and spending against the collection progress you want to keep.', action: 'Plan earning and spending', tint: 'bg-[var(--surface)]' },
  { title: 'Upgrades', href: '/en/guides/upgrades', icon: TrendUp, description: 'Understand character growth and practical purchase priorities, separate from card exchanges.', action: 'Review character upgrades', tint: 'bg-[var(--surface-muted)]' },
  { title: 'Collectibles', href: '/en/collectibles', icon: Package, description: 'Keep track of figurines, audiotapes and optional discoveries beyond the card collection.', action: 'Explore collectibles', tint: 'bg-[var(--surface)]' },
  { title: 'Achievements', href: '/en/achievements', icon: Trophy, description: 'Check the 40 Steam achievements and their collection and activity milestones.', action: 'View achievements', tint: 'bg-[var(--surface-muted)]' },
  { title: 'All Guides', href: '/en/guides', icon: BookOpen, description: 'Choose a focused guide for getting started, progression, cards, exploration or save help.', action: 'Explore the Guides Hub', tint: 'bg-[var(--surface)]' },
] as const satisfies ReadonlyArray<{
  title: string; href: PublicNavigationItem['href']; icon: typeof GameController;
  description: string; action: string; tint: string;
}>;

export function TaskGrid() {
  return (
    <HomeSection id="task-grid-title" title="Explore KOTAMON">
      <p className="mt-4 max-w-[60ch] text-lg font-semibold text-[var(--muted-foreground)]">
        Pick the next task. Jump straight to a practical answer, from card care to route finding.
      </p>
      <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {TASKS.map(({ title, href, icon: Icon, description, action, tint }) => (
          <Link className={`group flex flex-col rounded-[var(--radius-surface)] border-2 border-[var(--border-strong)] p-6 text-[var(--foreground-strong)] no-underline shadow-[4px_4px_0_var(--shadow-color)] hover:-translate-y-0.5 ${tint}`} href={href} key={href}>
            <Icon aria-hidden="true" size={30} weight="bold" />
            <h3 className="mt-5 font-display text-2xl">{title}</h3>
            <p className="mb-5 mt-3 font-semibold text-[var(--muted-foreground)]">{description}</p>
            <span className="mt-auto inline-flex items-center gap-2 font-extrabold underline decoration-accent decoration-2 underline-offset-4">{action}<ArrowRight aria-hidden="true" className="shrink-0" size={18} weight="bold" /></span>
          </Link>
        ))}
      </div>
    </HomeSection>
  );
}
