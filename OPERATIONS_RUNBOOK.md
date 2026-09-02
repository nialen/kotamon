# Operations Runbook

## Current application release — 2026-09-02

- Release commit: `c7d16fd5c61a0be01a51ffd27333afac285d3b92`
- Verified Preview: `dpl_6n9tQhcpNCtxXUf4fFL9Z6HArT7x`
- Verified application Production: `dpl_B5iWwPBcg8WLfrGxZwxsXosRAYQw`
- Canonical URL: https://kotamon.com
- Release state: `live-pending-data`
- Release-regression rollback target: `dpl_BchDT8cGn8BMV7rBDkUZRXNQ1xir`
- If an audit-only report commit produces a new equivalent deployment, its immediate application-equivalent rollback target is `dpl_B5iWwPBcg8WLfrGxZwxsXosRAYQw`.
- Rollback procedure: use Vercel deployment rollback/promotion, verify aliases and all public routes, and leave DNS unchanged for an application-only rollback.
- Follow-up at 2026-09-03 10:00 China Standard Time: inspect GA4 Realtime/reporting, Search Console sitemap/Page Indexing state, Vercel runtime errors, TLS, redirects, and the Secret Location ad placement.

## Current release state — 2026-09-01

- Application commit: `38a657c348f7154ce459ea5c9c440c770c29c3ca`
- Active verified production: `dpl_GbKH8zpXtNzgiSonbjfRoRC6LZpq`
- Canonical URL: https://kotamon.com
- Release state: `live-pending-data`
- Previous known-good rollback target: `dpl_7Xvn44T7LgZJg2MKPWQtJBrziYbm`
- Rollback scope: promote the previous deployment in Vercel, then verify aliases and public routes; do not change DNS for an application-only rollback.
- Follow-up at 2026-09-02 10:00 China Standard Time: inspect GA4 reporting/Realtime, Search Console sitemap/indexing state, Vercel runtime errors, TLS, redirects, and all public routes.

## Release

1. Run `pnpm qa`.
2. Confirm the intended commit is pushed to `main` without history rewriting.
3. Inspect the Vercel preview and production deployment.
4. Smoke-test public routes, redirects, `robots.txt`, and `sitemap.xml`.

## Rollback

Use the Vercel deployment list to promote the previous known-good release. Current rollback target: `dpl_7Xvn44T7LgZJg2MKPWQtJBrziYbm`. Do not change Cloudflare DNS for an application-only rollback.

## DNS

Keep `kotamon.com` and `www.kotamon.com` DNS-only when pointing at Vercel unless a later, tested design explicitly requires Cloudflare proxying. Snapshot existing records before any future DNS change and never delete or overwrite an unexpected record without explicit approval.

## Monitoring

Check Vercel deployment/runtime logs, TLS status, canonical redirects, Search Console coverage/sitemap state, and GA4 real-time traffic after launch. Treat sitemap submission, fetch success, indexing, and analytics data arrival as separate observations.

GA4 is enabled only when the production build receives a valid `NEXT_PUBLIC_GA_MEASUREMENT_ID` matching `G-[A-Z0-9]+`. Keep the value in Vercel environment settings rather than hard-coding it in source.
