const siteUrl = 'https://kotamon.com';
const steamUrl = 'https://store.steampowered.com/app/4294490/KOTAMON/';

export const SITE = Object.freeze({
  url: siteUrl,
  name: 'KOTAMON Wiki & Guide',
  positioning: 'An unofficial fan-made resource for KOTAMON players.',
  steamUrl,
  locale: 'en',
  legalDisclaimer:
    'KOTAMON.com is an independent fan-made website and is not affiliated with or endorsed by KotaMota Games or Polnoch. KOTAMON and related game assets are trademarks and/or copyrighted materials of their respective owners.',
  icons: Object.freeze({
    favicon16: `${siteUrl}/brand/favicon-16.png`,
    favicon32: `${siteUrl}/brand/favicon-32.png`,
    appleTouch: `${siteUrl}/brand/apple-touch-icon.png`,
    icon192: `${siteUrl}/brand/icon-192.png`,
    icon512: `${siteUrl}/brand/icon-512.png`,
  }),
});
