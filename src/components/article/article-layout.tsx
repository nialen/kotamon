import type { ReactNode } from 'react';

import { DirectAnswer } from '@/components/article/direct-answer';
import { RelatedGuides } from '@/components/article/related-guides';
import { SourceList } from '@/components/article/source-list';
import {
  TableOfContents,
  type TableOfContentsItem,
} from '@/components/article/table-of-contents';
import { Breadcrumbs } from '@/components/site/breadcrumbs';
import { SourceStatus } from '@/components/site/source-status';
import { UpdatedAt } from '@/components/site/updated-at';
import type { RegisteredEntry } from '@/content/registry';
import type { ContentEntry } from '@/content/schema';
import { getContentBreadcrumbs } from '@/content/hierarchy';

type ArticleLayoutProps = {
  readonly children: ReactNode;
  readonly entry: ContentEntry;
  readonly relatedEntries?: readonly RegisteredEntry[];
  readonly relatedHeading?: string;
  readonly sourcePage?: string;
  readonly tableOfContents?: readonly TableOfContentsItem[];
};

export function ArticleLayout({
  children,
  entry,
  relatedEntries = [],
  relatedHeading = entry.relatedHeading,
  sourcePage = `/${entry.locale}/${entry.slug}`,
  tableOfContents = [],
}: ArticleLayoutProps) {
  return (
    <article className="article-layout shell-container">
      <header className="article-header">
        <Breadcrumbs
          items={getContentBreadcrumbs(entry).slice(1)}
        />
        <p className="article-header__category">{entry.category}</p>
        <h1>{entry.title}</h1>
        <DirectAnswer>{entry.description}</DirectAnswer>
        <div className="article-header__trust">
          <SourceStatus status={entry.sourceStatus} />
          <UpdatedAt updatedAt={entry.updatedAt} />
        </div>
      </header>

      <div
        className={
          tableOfContents.length > 0
            ? 'article-layout__content article-layout__content--with-toc'
            : 'article-layout__content'
        }
      >
        {tableOfContents.length > 0 ? (
          <aside className="article-layout__toc">
            <TableOfContents items={tableOfContents} />
          </aside>
        ) : null}
        <div className="article-body">{children}</div>
      </div>

      <RelatedGuides
        entries={relatedEntries}
        heading={relatedHeading}
        sourcePage={sourcePage}
      />

      <footer className="article-footer">
        <SourceList sources={entry.sources} />
      </footer>
    </article>
  );
}
