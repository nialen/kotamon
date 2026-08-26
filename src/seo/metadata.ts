import type { Metadata } from 'next';

import type { ContentEntry } from '@/content/schema';
import { SITE } from '@/lib/site';

function getArticleUrl(entry: ContentEntry): string {
  return `${SITE.url}/${entry.locale}/${entry.slug}`;
}

export function buildArticleMetadata(entry: ContentEntry): Metadata {
  const url = getArticleUrl(entry);
  const title = `${entry.title} | ${SITE.name}`;

  return {
    title: { absolute: title },
    description: entry.description,
    alternates: {
      canonical: url,
      languages: {
        [entry.locale]: url,
        'x-default': url,
      },
    },
    openGraph: {
      type: 'article',
      url,
      title,
      description: entry.description,
      siteName: SITE.name,
      locale: 'en_US',
      section: entry.category,
      modifiedTime: entry.updatedAt,
    },
  };
}

export function buildBreadcrumbJsonLd(entry: ContentEntry) {
  const url = getArticleUrl(entry);

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: SITE.name,
        item: `${SITE.url}/${SITE.locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: entry.title,
        item: url,
      },
    ],
  };
}

export function buildArticleJsonLd(entry: ContentEntry) {
  const url = getArticleUrl(entry);

  return {
    '@context': 'https://schema.org',
    '@type': entry.category === 'Guides' ? 'TechArticle' : 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    headline: entry.title,
    description: entry.description,
    dateModified: entry.updatedAt,
    inLanguage: entry.locale,
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
    },
    citation: entry.sources.map(({ url: sourceUrl }) => sourceUrl),
  };
}
