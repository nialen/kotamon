import type { ContentEntry } from '@/content/schema';

const CARD_GUIDES = new Set([
  'guides/card-repair',
  'guides/foil-cards',
  'guides/cereal-boxes',
]);

export type ContentBreadcrumb = { label: string; href: string };

// Editorial parents need not match URL prefixes. Preserve the established URLs.
export function getContentBreadcrumbs(entry: ContentEntry): ContentBreadcrumb[] {
  const base = `/${entry.locale}`;
  const items: ContentBreadcrumb[] = [{ label: 'Home', href: base }];
  if (CARD_GUIDES.has(entry.slug)) {
    items.push({ label: 'Cards', href: `${base}/cards` });
  } else if (entry.slug.startsWith('collectibles/') || entry.slug === 'guides/secret-location') {
    items.push({ label: 'Collectibles', href: `${base}/collectibles` });
  } else if (entry.slug.startsWith('game/') || entry.slug === 'updates') {
    items.push({ label: 'Game', href: `${base}/game` });
  } else if (entry.slug.startsWith('guides/')) {
    items.push({ label: 'Guides', href: `${base}/guides` });
  }
  items.push({ label: entry.title, href: `${base}/${entry.slug}` });
  return items;
}
