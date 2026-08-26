import { Trophy } from '@phosphor-icons/react/dist/ssr';
import type { ReactNode } from 'react';

export type AchievementEntry = {
  readonly description: ReactNode;
  readonly name: string;
  readonly note?: ReactNode;
};

export type AchievementGroup = {
  readonly description?: ReactNode;
  readonly entries: readonly AchievementEntry[];
  readonly title: string;
};

type AchievementGroupsProps = {
  readonly groups: readonly AchievementGroup[];
};

export function AchievementGroups({ groups }: AchievementGroupsProps) {
  return (
    <div className="editorial-groups achievement-groups">
      {groups.map((group) => (
        <section className="editorial-group" key={group.title}>
          <header>
            <h2>{group.title}</h2>
            {group.description ? <div>{group.description}</div> : null}
          </header>
          <ul className="editorial-list">
            {group.entries.map((entry) => (
              <li className="editorial-card achievement-card" key={entry.name}>
                <div className="editorial-card__summary">
                  <h3>
                    <Trophy aria-hidden="true" size={20} weight="bold" />
                    {entry.name}
                  </h3>
                </div>
                <div>{entry.description}</div>
                {entry.note ? (
                  <div className="achievement-card__note">{entry.note}</div>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
