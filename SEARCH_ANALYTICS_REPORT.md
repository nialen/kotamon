# Search and Analytics Report

## Release observation 2026-09-02

- Sitemap gate passed on production: `robots.txt` and `sitemap.xml` returned HTTP 200, the sitemap contained exactly 21 canonical URLs, and all 21 returned HTTP 200.
- No sitemap submission, indexing request, GSC property change, or GA4 setting change was made in this release.
- Desktop and mobile production browser checks loaded the Google tag and observed requests to the GA4 collection endpoint.
- Fresh account-visible GA4 reporting and Google indexing observations were not collected in this deployment run; release status remains `live-pending-data`.
- Recheck target: 2026-09-03 10:00 China Standard Time using GA4 Realtime/reporting and Search Console sitemap/Page Indexing views.

Sitemap gate: verify the canonical host, public HTTP availability/status, and crawlability of every intended public URL before submission.

After the sitemap gate passes, record sitemap submission acknowledgement, Google's later fetch/success result, and URL Inspection/indexing observations as separate states; submission or an indexing request is not proof of indexing.

## Release observation 2026-09-01

- Sitemap gate passed on production: `robots.txt` and `sitemap.xml` returned HTTP 200, the sitemap contained exactly 21 canonical URLs, and all 21 returned HTTP 200.
- No duplicate sitemap submission or indexing request was made during this release.
- Production browser checks at 1440 x 900 and 390 x 844 loaded the Google tag and observed a request to the GA4 collection endpoint.
- No Google Analytics or Search Console setting was changed.
- Fresh account-visible GA4 reporting and Google indexing observations were not available in this run; release status remains `live-pending-data`.
- Recheck target: 2026-09-02 10:00 China Standard Time.

- Google Search Console Domain Property: verified for `kotamon.com`
- Sitemap submission acknowledgement: received on Aug 26, 2026 for `https://kotamon.com/sitemap.xml`
- Sitemap fetch result: `Success`; type `Sitemap`; last read Aug 26, 2026; 13 discovered pages; 0 discovered videos
- URL Inspection/indexing observations: not yet recorded; sitemap success is not proof of indexing
- GA4 account inspected: `nalenquen` (`405562861`)
- Existing GA4 properties: only `restorygames.online` (`551040668`); it will not be reused for KOTAMON
- KOTAMON GA4 property: created under account `nalenquen`
- Reporting time zone: China Time (GMT+08:00); currency: USD
- Business category/size: Games; small (1-10 employees)
- Web data stream: `kotamon.com`, URL `https://kotamon.com`, stream ID `15501944042`
- GA4 measurement ID: `G-0N7JBKRYTE`
- Website integration: enabled through `NEXT_PUBLIC_GA_MEASUREMENT_ID` for Vercel Production and Preview
- Production tag verification: the public HTML contains both the Google tag loader and `gtag('config', 'G-0N7JBKRYTE')`
- Production analytics observations: first real-time/data-processing observation is pending; tag verification is not proof that GA4 has processed an event
