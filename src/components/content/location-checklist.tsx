import { MapPin } from '@phosphor-icons/react/dist/ssr';
import type { ReactNode } from 'react';

export type LocationChecklistItem = {
  readonly description: ReactNode;
  readonly name: string;
  readonly note?: ReactNode;
  readonly route?: string;
};

type LocationChecklistProps = {
  readonly items: readonly LocationChecklistItem[];
  readonly listLabel?: string;
  readonly spoilerLabel?: string;
  readonly title?: string;
};

function ChecklistItems({
  items,
  listLabel,
}: Pick<LocationChecklistProps, 'items' | 'listLabel'>) {
  return (
    <ol aria-label={listLabel} className="location-checklist__items">
      {items.map((item) => (
        <li className="location-checklist__item" key={item.name}>
          <div className="location-checklist__marker" aria-hidden="true">
            <MapPin size={20} weight="fill" />
          </div>
          <div>
            <h3>{item.name}</h3>
            {item.route ? (
              <p className="location-checklist__route">{item.route}</p>
            ) : null}
            <div>{item.description}</div>
            {item.note ? (
              <div className="location-checklist__note">{item.note}</div>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function LocationChecklist({
  items,
  listLabel,
  spoilerLabel,
  title = 'Location checklist',
}: LocationChecklistProps) {
  return (
    <section className="location-checklist">
      <h2>{title}</h2>
      {spoilerLabel ? (
        <details>
          <summary>{spoilerLabel}</summary>
          <ChecklistItems items={items} listLabel={listLabel} />
        </details>
      ) : (
        <ChecklistItems items={items} listLabel={listLabel} />
      )}
    </section>
  );
}
