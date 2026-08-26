import type { MetadataRoute } from 'next';

import { SITE } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.name,
    description: SITE.positioning,
    start_url: `${SITE.url}/${SITE.locale}`,
    scope: SITE.url,
    display: 'standalone',
    lang: SITE.locale,
    icons: [
      {
        src: SITE.icons.icon192,
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: SITE.icons.icon512,
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
