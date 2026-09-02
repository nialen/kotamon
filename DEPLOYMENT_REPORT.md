# Deployment Report

## Release 2026-09-02 — Secret Location ad placement

- Status: live-pending-data
- Verified: 2026-09-02 08:35 China Standard Time
- Repository: `https://github.com/nialen/kotamon.git`; public; branch `main`
- Release commit pushed without force: `c7d16fd5c61a0be01a51ffd27333afac285d3b92`
- Preview deployment: `dpl_6n9tQhcpNCtxXUf4fFL9Z6HArT7x`; https://kotamon-o6m6y4bwc-angelicachavira-1451s-projects.vercel.app; READY; created 2026-09-02 08:30 CST
- Application production deployment: `dpl_B5iWwPBcg8WLfrGxZwxsXosRAYQw`; https://kotamon-gknd7jbmi-angelicachavira-1451s-projects.vercel.app; READY; created 2026-09-02 08:32 CST
- Production aliases: `https://kotamon.com`, `https://www.kotamon.com`, `https://kotamon.vercel.app`
- Local release gate: frozen install, typecheck, lint, 246 Vitest tests, content validation, production build, and 40 Playwright tests passed; 28 outputs generated.
- Preview gate: homepage, Secret Location, `robots.txt`, and `sitemap.xml` returned HTTP 200; no Preview error logs were found.
- Production gate: all 21 sitemap routes returned HTTP 200; target-page desktop/mobile fill, SPA entry, refresh, no-fill collapse, unique script/container, canonical/H1, overflow, analytics signal, and browser-error checks passed.
- DNS mutations: none.
- Release-regression rollback target: `dpl_BchDT8cGn8BMV7rBDkUZRXNQ1xir`; keep DNS unchanged.

## Release 2026-09-01

- Status: live-pending-data
- Verified: 2026-09-01 15:36 China Standard Time
- Repository target: `https://github.com/nialen/kotamon.git`; public; branch `main`
- Application commit pushed without force: `38a657c348f7154ce459ea5c9c440c770c29c3ca`
- Remote `origin/main` after application push: `38a657c348f7154ce459ea5c9c440c770c29c3ca`
- Preview deployment: `dpl_AHi9YJjCks4EgUwBkPfd8CiY9mQM`; https://kotamon-eapih6li5-angelicachavira-1451s-projects.vercel.app; READY; created 2026-09-01 15:27 CST
- Production deployment: `dpl_GbKH8zpXtNzgiSonbjfRoRC6LZpq`; https://kotamon-bdboqn006-angelicachavira-1451s-projects.vercel.app; READY; created 2026-09-01 15:26 CST
- Production aliases: `https://kotamon.com`, `https://www.kotamon.com`, `https://kotamon.vercel.app`
- Build verification: frozen install, typecheck, scoped lint, 243 Vitest tests, content validation, and production build passed; 28 outputs generated.
- Production route verification: all 21 sitemap URLs returned HTTP 200; `robots.txt` and `sitemap.xml` returned HTTP 200.
- Analytics verification: production loaded the Google tag and emitted a GA4 collect request; fresh GA4 reporting/UI data remains pending.
- DNS mutations: none.
- Rollback target: previous known-good production deployment `dpl_7Xvn44T7LgZJg2MKPWQtJBrziYbm`; keep DNS unchanged for an application rollback.

- Status: live-pending-data
- Last updated: 2026-08-26 11:28 China Standard Time
- Project path: `F:\gitee\KOTAMON`
- Project identity: KOTAMON Wiki & Guide
- Repository: https://github.com/nialen/kotamon.git
- Branch: `main`
- Application commit: `0d6dca885021e1aa3c67f5aa596580993a544835`
- Vercel team: `angelicachavira-1451s-projects`
- Vercel project: `kotamon`
- Preview deployment: `dpl_FudFAvfN7Ww7ceSGBczKHRtw1nMf`; https://kotamon-6lyou2yw3-angelicachavira-1451s-projects.vercel.app; READY; created 2026-08-26 11:09 CST
- Production deployment: `dpl_8PLERMD36g9LeP9PSJP1fnSnJiJ9`; https://kotamon-o9qz6soph-angelicachavira-1451s-projects.vercel.app; READY; created 2026-08-26 11:22 CST
- Vercel project URL: https://kotamon.vercel.app
- Canonical production URL: https://kotamon.com
- Build result: 20/20 routes generated
- Route QA: 13 intended public routes returned HTTP 200; `/` returned 308 to `/en`; `/en/mods` returned 404.
- SEO release QA: homepage title, 148-character description, logo alt text, canonical URL, one H1, responsive navigation, and no horizontal overflow verified on production.
- Analytics: GA4 `G-0N7JBKRYTE` is active in production; first real-time/data-processing observation is pending.

## Rollback

If the current production release regresses, restore the previous known-good deployment `dpl_8WQv3oxpToRvKHFvy6PQiv7zUiG6` from the Vercel project deployment list. DNS should remain unchanged during an application rollback; this run changed no DNS records.
