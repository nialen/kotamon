# Domain and DNS Report

## Verification 2026-09-02

- DNS changes in this release: none.
- Application production deployment `dpl_B5iWwPBcg8WLfrGxZwxsXosRAYQw` received the existing `kotamon.com`, `www.kotamon.com`, and `kotamon.vercel.app` aliases.
- `http://kotamon.com` returned HTTP 308 to `https://kotamon.com/`.
- `https://www.kotamon.com` returned HTTP 308 to `https://kotamon.com/`.
- `robots.txt` and `sitemap.xml` returned HTTP 200; all 21 sitemap URLs use `https://kotamon.com` and returned HTTP 200.
- Existing Cloudflare nameservers, DNS records, proxy state, certificates, and Vercel domain settings were not changed.

## Verification 2026-09-01

- DNS changes in this release: none.
- `http://kotamon.com` returned HTTP 308 to `https://kotamon.com/`.
- `https://www.kotamon.com` returned HTTP 308 to `https://kotamon.com/`.
- `https://kotamon.com` is attached to READY production deployment `dpl_GbKH8zpXtNzgiSonbjfRoRC6LZpq`.
- `robots.txt` and `sitemap.xml` returned HTTP 200; all 21 sitemap URLs use the canonical `https://kotamon.com` host.
- Existing Cloudflare nameservers and Vercel domain configuration were inspected only; no record, proxy, certificate, or nameserver setting was changed.

- Canonical host: `kotamon.com`
- Redirect host: `www.kotamon.com` -> `https://kotamon.com` (308; verified)
- Authoritative nameservers: `aron.ns.cloudflare.com`, `ridge.ns.cloudflare.com`
- Current apex values observed by Vercel: `216.198.79.1`, `64.29.17.1`
- Vercel domain ownership: verified
- Current apex Vercel state: `configured-correctly`
- Conflicting records: none reported
- Applied Cloudflare apex record: `CNAME @ 31a43f61f72c2751.vercel-dns-017.com.` with Cloudflare proxy disabled
- Applied Cloudflare www record: `CNAME www 31a43f61f72c2751.vercel-dns-017.com.` with Cloudflare proxy disabled
- Vercel redirect configuration: `www.kotamon.com` -> `kotamon.com`, HTTP 308
- Domain Connect provider: Cloudflare

## Verification

Both project domains are `configured-correctly`. Vercel issued certificates for the apex and `www`; a public request to `www` returned HTTP 308 with `Location: https://kotamon.com/`.
