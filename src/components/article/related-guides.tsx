import { ArrowRight } from '@phosphor-icons/react/dist/ssr';

import { RelatedGuideLink } from '@/components/article/related-guide-link';
import type { RegisteredEntry } from '@/content/registry';

type RelatedGuidesProps = {
  readonly entries: readonly RegisteredEntry[];
  readonly heading?: string;
  readonly sourcePage: string;
};

export function RelatedGuides({
  entries,
  heading = 'Related guides',
  sourcePage,
}: RelatedGuidesProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <aside
      aria-labelledby="related-guides"
      className="related-guides"
      data-source-page={sourcePage}
    >
      <h2 id="related-guides">{heading}</h2>
      <ul>
        {entries.map((entry) => (
          <li key={`${entry.locale}:${entry.slug}`}>
            <RelatedGuideLink
              href={`/${entry.locale}/${entry.slug}`}
              linkText={entry.title}
              sourcePage={sourcePage}
            >
              <span>
                <strong>{entry.title}</strong>
                <small>{entry.description}</small>
              </span>
              <ArrowRight aria-hidden="true" size={20} weight="bold" />
            </RelatedGuideLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
