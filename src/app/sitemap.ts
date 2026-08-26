import type { MetadataRoute } from 'next';

import { PUBLIC_ROUTES } from '@/content/routes';
import { SITE } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((route) => ({
    url: `${SITE.url}${route}`,
  }));
}
