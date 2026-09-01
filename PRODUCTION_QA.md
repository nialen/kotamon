# Production QA

## Release 2026-09-01

- Status: live-pending-data
- Application commit: `38a657c348f7154ce459ea5c9c440c770c29c3ca`
- Preview: `dpl_AHi9YJjCks4EgUwBkPfd8CiY9mQM` (READY)
- Production: `dpl_GbKH8zpXtNzgiSonbjfRoRC6LZpq` (READY)
- Canonical production URL: https://kotamon.com
- All 21 sitemap routes: HTTP 200 on the canonical host.
- Redirects: HTTP apex upgraded to HTTPS with 308; `www` redirected to canonical apex with 308.
- Discovery: `robots.txt` HTTP 200 with canonical sitemap declaration; `sitemap.xml` HTTP 200 with 21 canonical URLs.
- Desktop 1440 x 900 and mobile 390 x 844 checks covered homepage, guides hub, Artists, Save Help, Secret Location, and Updates.
- Each sampled page had HTTP 200, one non-empty H1, a non-empty unique-purpose title/description, the expected canonical URL, and internal main-content links.
- No horizontal overflow occurred at either viewport; homepage-to-guides navigation succeeded.
- Adsterra no-fill state remained collapsed at 0 px with no label; one ad region was present and no console/page errors were observed.
- Google tag loader and GA4 collect traffic were observed at both viewports.
- Pending: fresh GA4 reporting/UI data and new Google indexing observations.

- Verified: 2026-08-26 11:28 China Standard Time
- Release commit: `0d6dca885021e1aa3c67f5aa596580993a544835`
- Preview: `dpl_FudFAvfN7Ww7ceSGBczKHRtw1nMf` (READY)
- Production: `dpl_8PLERMD36g9LeP9PSJP1fnSnJiJ9` (READY)
- Public URL: https://kotamon.com

## Completed on Vercel default production host

- All 13 intended public routes: HTTP 200
- Root redirect: HTTP 308 to `/en`
- Negative route `/en/mods`: HTTP 404
- `robots.txt`: HTTP 200
- `sitemap.xml`: HTTP 200 with 13 URLs
- Preview deployment: READY and route-smoke-tested
- Explicit production deployment: READY

## Completed on custom apex domain

- Apex HTTPS and HSTS
- Root 308 redirect to `/en`
- `/en` and `robots.txt`: HTTP 200
- `sitemap.xml`: HTTP 200 and canonical `https://kotamon.com` URLs
- `www.kotamon.com`: HTTP 308 to `https://kotamon.com/`
- All 13 sitemap routes on the custom host: HTTP 200
- Negative route `/en/mods`: HTTP 404
- GA4 loader and config for `G-0N7JBKRYTE`: present in production HTML
- Homepage title: `KOTAMON Wiki & Guide: Cards, Achievements & More` (48 characters)
- Homepage meta description: 148 characters and includes the primary KOTAMON guide tasks
- Header brand image: `alt="KOTAMON logo"`
- Canonical: `https://kotamon.com/en`
- Exactly one homepage H1
- Desktop 1440 x 900: primary navigation visible; no horizontal overflow; visual smoke test passed
- Mobile 390 x 844: mobile menu visible; no horizontal overflow; visual smoke test passed
- Representative listing/inner pages: `/en/cards` and `/en/guides/gameplay` retain one H1, canonical URLs, and navigation/breadcrumb structure

## Pending observation

- First GA4 real-time event/data-processing observation
- Google URL Inspection/indexing observations (sitemap success does not prove indexing)
