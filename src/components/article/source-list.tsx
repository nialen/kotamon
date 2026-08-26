import { ArrowSquareOut } from '@phosphor-icons/react/dist/ssr';

import type { ContentEntry } from '@/content/schema';

type SourceListProps = {
  readonly sources: ContentEntry['sources'];
};

function formatKind(kind: ContentEntry['sources'][number]['kind']) {
  return kind
    .split('-')
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');
}

export function SourceList({ sources }: SourceListProps) {
  return (
    <section aria-labelledby="article-sources" className="source-list">
      <h2 id="article-sources">Sources</h2>
      <ul>
        {sources.map((source) => (
          <li key={source.url}>
            <a
              href={source.url}
              rel="noreferrer noopener"
              target="_blank"
            >
              <span>{source.label}</span>
              <ArrowSquareOut aria-hidden="true" size={18} weight="bold" />
            </a>
            <span className="source-list__kind">{formatKind(source.kind)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
