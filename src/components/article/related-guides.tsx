import { ArrowRight } from '@phosphor-icons/react/dist/ssr';

import type { RegisteredEntry } from '@/content/registry';

type RelatedGuidesProps = {
  readonly entries: readonly RegisteredEntry[];
};

export function RelatedGuides({ entries }: RelatedGuidesProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <aside aria-labelledby="related-guides" className="related-guides">
      <h2 id="related-guides">Related guides</h2>
      <ul>
        {entries.map((entry) => (
          <li key={`${entry.locale}:${entry.slug}`}>
            <a href={`/${entry.locale}/${entry.slug}`}>
              <span>
                <strong>{entry.title}</strong>
                <small>{entry.description}</small>
              </span>
              <ArrowRight aria-hidden="true" size={20} weight="bold" />
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
