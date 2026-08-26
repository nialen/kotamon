import type { ReactNode } from 'react';

export type CardFact = {
  readonly label: string;
  readonly value: ReactNode;
};

export type CardGroupEntry = {
  readonly description?: ReactNode;
  readonly facts?: readonly CardFact[];
  readonly name: string;
  readonly status?: string;
};

export type CardGroup = {
  readonly description?: ReactNode;
  readonly entries: readonly CardGroupEntry[];
  readonly title: string;
};

type CardGroupsProps = {
  readonly groups: readonly CardGroup[];
};

export function CardGroups({ groups }: CardGroupsProps) {
  return (
    <div className="editorial-groups card-groups">
      {groups.map((group) => (
        <section className="editorial-group" key={group.title}>
          <header>
            <h2>{group.title}</h2>
            {group.description ? <div>{group.description}</div> : null}
          </header>
          <ul className="editorial-list">
            {group.entries.map((entry) => (
              <li className="editorial-card" key={entry.name}>
                <div className="editorial-card__summary">
                  <h3>{entry.name}</h3>
                  {entry.status ? <span>{entry.status}</span> : null}
                </div>
                {entry.description ? <div>{entry.description}</div> : null}
                {entry.facts && entry.facts.length > 0 ? (
                  <dl className="editorial-facts">
                    {entry.facts.map((fact) => (
                      <div key={fact.label}>
                        <dt>{fact.label}</dt>
                        <dd>{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
