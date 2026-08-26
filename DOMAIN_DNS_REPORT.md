# Domain and DNS Report

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
