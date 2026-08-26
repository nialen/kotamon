# Operations Runbook

## Release

1. Run `pnpm qa`.
2. Confirm the intended commit is pushed to `main` without history rewriting.
3. Inspect the Vercel preview and production deployment.
4. Smoke-test public routes, redirects, `robots.txt`, and `sitemap.xml`.

## Rollback

Use the Vercel deployment list to promote the previous known-good release. Current rollback target: `dpl_9JFJMo641QG8k49gLekFoK8PA5Dq`. Do not change Cloudflare DNS for an application-only rollback.

## DNS

Keep `kotamon.com` and `www.kotamon.com` DNS-only when pointing at Vercel unless a later, tested design explicitly requires Cloudflare proxying. Snapshot existing records before any future DNS change and never delete or overwrite an unexpected record without explicit approval.

## Monitoring

Check Vercel deployment/runtime logs, TLS status, canonical redirects, Search Console coverage/sitemap state, and GA4 real-time traffic after launch. Treat sitemap submission, fetch success, indexing, and analytics data arrival as separate observations.

GA4 is enabled only when the production build receives a valid `NEXT_PUBLIC_GA_MEASUREMENT_ID` matching `G-[A-Z0-9]+`. Keep the value in Vercel environment settings rather than hard-coding it in source.
