import type { Metadata } from 'next';

import { CollectionPath } from '@/components/home/collection-path';
import { HomeHero } from '@/components/home/home-hero';
import { GameOverview } from '@/components/home/game-overview';
import { ArtistsFeature, CardsFeature, CollectiblesFeature, DownloadFeature } from '@/components/home/game-features';
import { HomeFaq } from '@/components/home/home-faq';
import { LatestGuides } from '@/components/home/latest-guides';
import { IssueNotice } from '@/components/home/issue-notice';
import { TaskGrid } from '@/components/home/task-grid';
import { TrustPanel } from '@/components/home/trust-panel';
import { getPublicEntries } from '@/content/registry';
import { SITE } from '@/lib/site';

const homepageUrl = `${SITE.url}/${SITE.locale}`;
const homepageTitle = 'KOTAMON Wiki & Guide: Cards, Achievements & More';
const homepageDescription =
  'Explore KOTAMON cards, achievements, collectibles, gameplay tips, secret locations, and troubleshooting in this independent fan-made wiki and guide.';

export const metadata: Metadata = {
  title: { absolute: homepageTitle },
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
    title: homepageTitle,
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
      <GameOverview />
      <TaskGrid />
      <CardsFeature />
      <ArtistsFeature />
      <DownloadFeature />
      <CollectiblesFeature />
      <CollectionPath />
      <LatestGuides />
      <IssueNotice />
      <HomeFaq />
      <TrustPanel publishedGuideCount={publishedGuideCount} />
    </>
  );
}
