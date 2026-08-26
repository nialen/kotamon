import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ArticleLayout } from '@/components/article/article-layout';
import {
  getArticleStaticParams,
  getEntry,
  getRelatedEntries,
} from '@/content/registry';
import { isSupportedLocale } from '@/lib/locale';
import {
  buildArticleJsonLd,
  buildArticleMetadata,
  buildBreadcrumbJsonLd,
} from '@/seo/metadata';

type ArticlePageProps = {
  readonly params: Promise<{
    readonly locale: string;
    readonly slug: string[];
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getArticleStaticParams();
}

async function resolveEntry(params: ArticlePageProps['params']) {
  const { locale, slug } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const entry = getEntry(locale, slug.join('/'));

  if (!entry) {
    notFound();
  }

  return entry;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const entry = await resolveEntry(params);
  return buildArticleMetadata(entry);
}

function serializeJsonLd(value: object) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const entry = await resolveEntry(params);
  const Content = entry.Component;
  const relatedEntries = getRelatedEntries(entry);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildBreadcrumbJsonLd(entry)),
        }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildArticleJsonLd(entry)),
        }}
        type="application/ld+json"
      />
      <ArticleLayout entry={entry} relatedEntries={relatedEntries}>
        <Content />
      </ArticleLayout>
    </>
  );
}
