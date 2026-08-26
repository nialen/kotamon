import type { Metadata } from 'next';

import { CollectionPath } from '@/components/home/collection-path';
import { HomeHero } from '@/components/home/home-hero';
import { IssueNotice } from '@/components/home/issue-notice';
import { TaskGrid } from '@/components/home/task-grid';
import { TrustPanel } from '@/components/home/trust-panel';
import { getPublicEntries } from '@/content/registry';
import { SITE } from '@/lib/site';

const homepageUrl = `${SITE.url}/${SITE.locale}`;
const homepageDescription =
  'Gameplay, cards, collectibles, achievements, and careful troubleshooting for KOTAMON players.';

export const metadata: Metadata = {
  title: { absolute: SITE.name },
  description: homepageDescription,
  alternates: {
    canonical: homepageUrl,
    languages: {
      en: homepageUrl,
      'x-default': homepageUrl,
    },
  },
  openGraph: {
    type: 'website',
    url: homepageUrl,
    title: SITE.name,
    description: homepageDescription,
    siteName: SITE.name,
    locale: 'en_US',
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE.name,
  url: SITE.url,
  description: SITE.positioning,
  inLanguage: SITE.locale,
};

function serializeJsonLd(value: object) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export default function HomePage() {
  const publishedGuideCount = getPublicEntries().length;

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteJsonLd) }}
        type="application/ld+json"
      />
      <HomeHero />
      <IssueNotice />
      <TaskGrid />
      <CollectionPath />
      <TrustPanel publishedGuideCount={publishedGuideCount} />
    </>
  );
}
