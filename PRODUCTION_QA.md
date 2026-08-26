# Production QA

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

## Pending observation

- First GA4 real-time event/data-processing observation
- Google URL Inspection/indexing observations (sitemap success does not prove indexing)
