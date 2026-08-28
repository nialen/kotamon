import type { Metadata } from 'next';

import type { ContentEntry } from '@/content/schema';
import { SITE } from '@/lib/site';
import { getContentBreadcrumbs } from '@/content/hierarchy';

function getArticleUrl(entry: ContentEntry): string {
  return `${SITE.url}/${entry.locale}/${entry.slug}`;
}

export function buildArticleMetadata(entry: ContentEntry): Metadata {
  const url = getArticleUrl(entry);
  const title = entry.seoTitle ?? `${entry.title} | ${SITE.name}`;

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
      type: entry.pageType === 'hub' ? 'website' : 'article',
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
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: getContentBreadcrumbs(entry).map(({ label, href }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: label,
      item: `${SITE.url}${href}`,
    })),
  };
}

export function buildArticleJsonLd(entry: ContentEntry) {
  const url = getArticleUrl(entry);

  return {
    '@context': 'https://schema.org',
    '@type': entry.pageType === 'hub' ? 'CollectionPage' : entry.category === 'Guides' ? 'TechArticle' : 'Article',
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
