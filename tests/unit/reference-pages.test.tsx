import { render, screen, within } from '@testing-library/react';
import type { ComponentType } from 'react';
import { describe, expect, it } from 'vitest';

import AchievementsPage from '../../content/en/achievements/index.mdx';
import CardsPage from '../../content/en/cards/index.mdx';
import { AchievementGroups } from '@/components/content/achievement-groups';
import { CardGroups } from '@/components/content/card-groups';
import { getEntry } from '@/content/registry';

const Achievements = AchievementsPage as ComponentType<{
  components: { AchievementGroups: typeof AchievementGroups };
}>;
const Cards = CardsPage as ComponentType<{
  components: { CardGroups: typeof CardGroups };
}>;

describe('reference pages', () => {
  it('renders exactly 40 public achievement entries', () => {
    render(<Achievements components={{ AchievementGroups }} />);

    const reference = screen.getByLabelText('All 40 Steam achievements');
    expect(within(reference).getAllByRole('listitem')).toHaveLength(40);
  });

  it('shows the current-list warning on the cards reference', () => {
    render(<Cards components={{ CardGroups }} />);

    expect(
      screen.getByRole('note', { name: 'Current list warning' }).textContent,
    ).toContain('Current list');
  });

  it('registers both reference routes as public content', () => {
    expect(getEntry('en', 'cards')).toBeDefined();
    expect(getEntry('en', 'achievements')).toBeDefined();
  });
});
