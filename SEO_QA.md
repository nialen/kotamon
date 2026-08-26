# SEO QA

Date: 2026-08-26  
Environment: local production build at `http://127.0.0.1:3213`  
Canonical origin: `https://kotamon.com`

## Automated result

The Playwright production test covered every route in `PUBLIC_ROUTES`. All 13 routes returned HTTP 200, rendered exactly one non-empty H1, used a unique non-empty title and description, and exposed a self-consistent canonical, `en` alternate, `x-default` alternate, Open Graph title, and Open Graph URL.

The heading check inspected headings inside `main`. Every route starts its content hierarchy at H1 and does not skip upward to a heading level more than one level deeper than the preceding content heading. Every JSON-LD block parsed as JSON.

## Per-route metadata

| Route | Rendered title | Rendered description |
|---|---|---|
| `/en` | KOTAMON Wiki & Guide | Gameplay, cards, collectibles, achievements, and careful troubleshooting for KOTAMON players. |
| `/en/guides/gameplay` | KOTAMON Gameplay Guide: Core Loop and Priorities \| KOTAMON Wiki & Guide | Search trash piles, recycle and complete orders, then protect useful card finds before repairing, collecting, or trading them. Treat prices and collectible behavior as patch-sensitive. |
| `/en/guides/card-repair` | KOTAMON Card Repair Guide \| KOTAMON Wiki & Guide | Preserve a separate good save, collect all five card pieces, and assemble the complete card manually at the garage glue table. Automatic assembly and fixed piece coordinates are not officially confirmed. |
| `/en/guides/foil-cards` | KOTAMON Foil Cards Guide \| KOTAMON Wiki & Guide | Official sources confirm that cereal boxes can contain super-rare foil cards and that foil collection has dedicated achievements. No official drop rate, pity rule, or complete foil list is published. |
| `/en/guides/cereal-boxes` | KOTAMON Cereal Boxes Guide \| KOTAMON Wiki & Guide | Find cereal boxes while searching trash piles, or buy one from Jenny for $10,000 after every attribute is maxed. Boxes can contain foil cards, but official sources publish no drop rate. |
| `/en/guides/save-not-working` | KOTAMON Save Not Working: Safe Troubleshooting \| KOTAMON Wiki & Guide | Keep the last good save untouched and make a separate manual save before changing anything. Official fixes addressed several save issues, but later player reports mean missing upgrades still need careful diagnosis. |
| `/en/guides/secret-location` | KOTAMON Secret Location Guide \| KOTAMON Wiki & Guide | Save first. Official notes confirm a hidden surprise, but the available route is community-reported and patch-sensitive. Open the spoiler checklist only when you are ready. |
| `/en/cards` | KOTAMON Cards: Current List by Color Set \| KOTAMON Wiki & Guide | Check the current 40-card community list by blue, white, red, and purple set, plus Kotalion as a separate special card. Steam confirms the collection goals, while individual base-card names come from maintained community documentation. |
| `/en/collectibles/figurines` | KOTAMON Figurine Locations: Route Checklist \| KOTAMON Wiki & Guide | Use a mixed collection route: check the six currently documented landmark pickups first, then continue normal trash-pile cycles for the random discoveries. The evidence does not support twelve fixed map points. |
| `/en/collectibles/audiotapes` | KOTAMON Audiotape Locations and 6 of 7 Issues \| KOTAMON Wiki & Guide | Steam requires seven valid audiotape counts for the final milestone. Current reports describe random trash-pile discoveries and occasional display or counter mismatches, not seven reliable fixed coordinates. |
| `/en/achievements` | KOTAMON Achievements: All 40 by Activity \| KOTAMON Wiki & Guide | Use the exact 40 public Steam achievement names and descriptions, grouped into recycling, savings, upgrades, cards, foil, cereal boxes, figurines, audiotapes, cosplay, beer, and throwing tracks. |
| `/en/game/where-to-play` | Where to Play KOTAMON \| KOTAMON Wiki & Guide | KOTAMON is listed for Windows PC on Steam as App ID 4294490. KotaMota Games developed it, Polnoch published it, and the official release date is August 20, 2026. |
| `/en/game/artists` | KOTAMON Artists and Verified Credits \| KOTAMON Wiki & Guide | The supplied official source credits KotaMota Games as the developer and describes hand-drawn card art, but it does not establish an individual illustrator, card artist, character artist, or art director. |

For every row above:

- HTTP status: 200.
- H1 count: 1.
- Main-content heading hierarchy: pass.
- Canonical: `https://kotamon.com` plus the route.
- Alternates: `en` and `x-default`, both equal to the canonical.
- Open Graph: title equals the rendered title and URL equals the canonical.
- Indexability: included in the exact sitemap set and allowed by robots.
- JSON-LD: one parseable `WebSite` block on `/en`; parseable breadcrumb and article blocks on each article route.

## Discovery and exclusion checks

| Check | Result |
|---|---|
| Sitemap | `/sitemap.xml` returned 200 and contained exactly the 13 approved canonical URLs in manifest order. |
| Robots | `/robots.txt` returned 200, contains `Allow: /`, and names `https://kotamon.com/sitemap.xml`. |
| Root redirect | `/` returned permanent redirect status 308 with `Location: /en`. |
| Unsupported content | `/en/mods` returned 404 and is absent from the sitemap. |
| Unsupported locale | `/ru` returned 404 and is absent from the sitemap. |
| Draft or deferred discovery | No mods, cheats, or unsupported locale URL appears in the sitemap or the public route manifest. |
| Internal links | The production crawler started at `/en`, visited all 13 same-origin HTML pages once, and found 0 broken internal links. |

Malformed href coverage verifies that URL-parser failures are reported as broken links with the source page, original href, null normalized target, `invalid URL` status, and a fixed reason. Protocol-boundary coverage verifies that only fragments, `mailto:`, `tel:`, and valid external HTTP or HTTPS URLs are ignored; a same-origin lookalike path is still crawled. `javascript:`, `data:`, and parseable unsupported schemes such as `ftp:`, `webcal:`, `vbscript:`, and `sms:` produce deterministic findings instead of being treated as external links.

## Favicon and manifest

- Rendered favicon and Apple touch link elements: at least 3, with every linked local asset returning 200.
- `/manifest.webmanifest`: 200 with two declared icons.
- Manifest icons: 192 by 192 and 512 by 512 assets both returned 200.
- Framework icon endpoint: `/icon.ico` is present in the production route output.

## JSON-LD and title correction

The browser test initially found article document titles receiving the site-name template twice while Open Graph titles had one suffix. `buildArticleMetadata` now uses an absolute article title, so the rendered document title and Open Graph title match exactly and remain unique across all 13 public routes.

## Residue and browser evidence

- `pnpm exec tsx scripts/check-template-residue.mjs`: 51 text files scanned, 0 findings.
- Extended Task 14 residue scan: 10 new or modified scripts, tests, configurations, and reports checked, 0 findings.
- `pnpm test:e2e`: 7 tests passed against the production build using installed Google Chrome 151.0.7922.169.
- Every public route produced a successful full-page screenshot at a fixed 1440 by 900 light-mode viewport. The evidence directory is `qa/task-14-route-screenshots` and contains exactly 13 PNG files.
- The E2E test asserts `page.viewportSize()` is 1440 by 900 and reads each PNG IHDR width as 1440; every full-page image height is at least 900. A post-run image inspection confirmed all 13 PNG widths are 1440.
- Stable screenshot naming removes the leading slash and replaces each remaining slash with `--`. For example, `/en/guides/gameplay` maps to `en--guides--gameplay.png`.
- The exact evidence set is `en.png`, `en--guides--gameplay.png`, `en--guides--card-repair.png`, `en--guides--foil-cards.png`, `en--guides--cereal-boxes.png`, `en--guides--save-not-working.png`, `en--guides--secret-location.png`, `en--cards.png`, `en--collectibles--figurines.png`, `en--collectibles--audiotapes.png`, `en--achievements.png`, `en--game--where-to-play.png`, and `en--game--artists.png`.
- Playwright also retains screenshot-on-failure behavior. The separate Task 15 evidence remains responsible for the representative light and dark desktop and mobile matrix.
- A production Playwright regression changes the emulated system color scheme after hydration and confirms that pages with no stored override update `data-theme` live without writing an override.
