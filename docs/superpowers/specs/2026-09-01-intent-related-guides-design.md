# KOTAMON Intent-Based Related Guides Design

## Goal

Improve natural, intent-led onward navigation across the 21 existing public pages without adding routes, changing SEO identity, or expanding the main guide content. The priority flow is Hub → Guide → related guide, with `/en/guides/secret-location` as the main organic-entry optimization.

## Scope and guardrails

Only the existing related-guide data, related-guide presentation, a small number of already-supported contextual links, hub card ordering/descriptions where necessary, analytics, and tests may change.

The implementation must not add, remove, or rename routes; alter URLs, titles, H1s, canonical tags, robots directives, sitemap structure, or primary guide claims; add unverified game facts; add images; introduce a UI framework; or generate sitewide mechanical link patterns.

The current uncommitted content changes in `content/en/guides/secret-location.mdx`, `content/en/guides/save-not-working.mdx`, `content/en/game/artists.mdx`, and `content/en/updates/index.mdx` are user work. Changes from this work must preserve them and be limited to the approved linking additions.

## Current-state audit

There are 21 public routes: `/en` plus 20 content entries. All content entries currently support `related` frontmatter and are rendered by the shared `RelatedGuides` card component. The homepage intentionally has no article-level related module.

The existing component already has full-card links, title and description, a stable hover treatment, and mobile-compatible stacked cards. Its heading is fixed to `Related guides`, and it is displayed beside Sources in the article footer. The new placement should render it after the article body and before Sources, so a reader sees a next action before source citations or ads.

Current article-body links are already extensive where useful. In particular, Secret Location already links naturally to Collectibles, Figurines, Audiotapes, Achievements, Save Help, and Gameplay; the first four must remain and no duplicate links are needed. The principal issue is recommendation choice rather than a lack of links.

The current GA component installs the base gtag configuration only. There is no dedicated internal recommendation-click event. Enhanced Measurement does not provide a dependable `related_guide_click` dimension for internal site links, so a narrow custom event is required.

## Content recommendation model

Retain the existing `related` slug array as the source of recommendation order. Add an optional frontmatter field for the related-module heading. The default remains `Related guides`; page-specific headings make user intent explicit without building a parallel system.

Use this approved matrix:

| Source | Heading / handling | Ordered related pages |
| --- | --- | --- |
| `/en/guides/secret-location` | `Explore More Hidden Content` | Collectibles, Figurines, Audiotapes, Achievements |
| `/en/collectibles` | default | Secret Location, Figurines, Audiotapes, Achievements |
| `/en/collectibles/figurines` | default | Collectibles, Secret Location, Audiotapes, Achievements |
| `/en/collectibles/audiotapes` | default | Collectibles, Secret Location, Figurines, Achievements |
| `/en/cards` | default | Card Repair, Foil Cards, Cereal Boxes, Achievements |
| `/en/guides/card-repair` | default | Cards, Foil Cards, Cereal Boxes, Gameplay |
| `/en/guides/foil-cards` | default | Cards, Card Repair, Cereal Boxes, Achievements |
| `/en/guides/cereal-boxes` | default | Cards, Card Repair, Foil Cards, Money or Upgrades when supported by the existing guide |
| `/en/guides/beginner-guide` | `Continue Your KOTAMON Journey` | Gameplay, Money, Upgrades, Cards |
| `/en/guides/gameplay` | default | Beginner Guide, Money, Upgrades, Cards |
| `/en/guides/money` | default | Upgrades, Gameplay, Beginner Guide, Cereal Boxes |
| `/en/guides/upgrades` | default | Gameplay, Money, Beginner Guide, Cereal Boxes |
| `/en/guides/save-not-working` | default | Updates, Guides Hub, Gameplay, Where to Play |
| `/en/game/artists` | default | Cards, Game Hub, Where to Play; no unsupported collectible/achievement recommendation |
| `/en/updates` | `Affected guides` | Current, explicitly affected pages only: Cards, Cereal Boxes, Save Help, Figurines |
| `/en/game` | default | Where to Play, System Requirements, Artists, Updates |
| `/en/game/where-to-play` | default | Game Hub, System Requirements, Beginner Guide, Updates |
| `/en/game/system-requirements` | default | Where to Play, Game Hub, Beginner Guide, Updates |
| `/en/achievements` | default | Collectibles, Secret Location, Cards, Gameplay |
| `/en/guides` | suppress ordinary related module; keep category distribution | n/a |
| `/en` | no article related module; preserve section-entry orientation | n/a |

For Cereal Boxes, the final fourth recommendation will be chosen from Money or Upgrades based only on the existing supported relationship, with no factual text changes. Updates uses the current official changes that the page already documents; future update maintenance must revise the affected-guide list alongside its dated content.

## Presentation and data flow

The server-rendered article page continues resolving recommended entries from the validated registry. `ArticleLayout` receives the optional heading with the recommended entries and renders the related module directly below `article-body`. Sources remain rendered afterward. The component continues displaying title, entry description, an entire-card click target, and arrow affordance. Existing CSS is adjusted only for the new vertical order and must not change card dimensions on hover or introduce layout shift.

The Guides Hub passes no related entries so its existing guide-directory categories remain the primary navigation. The homepage remains unchanged except for any already-necessary entry-card ordering; it must not receive a deep-page recommendation block.

## Analytics contract

Add a small client-only link wrapper inside the existing related-card rendering. On a related card click, if `window.gtag` is available, it issues exactly one non-blocking event before normal Next navigation continues:

```text
related_guide_click
source_page: /en/<source slug>
target_page: /en/<target slug>
section: related_guides
link_text: <target title>
```

No `preventDefault`, callback-based waiting, or duplicate generic event is added. The existing GA loader/configuration remains responsible for page views and its current behavior is not changed. The wrapper emits no event if analytics is unavailable.

## Tests and verification

Add or update unit tests for registry heading validation, module heading and position, related-card URLs, and one event payload per click. Update Playwright coverage for the Secret Location module, desktop/mobile click targets, navigation, and no console errors. Run content validation, internal link crawl, typecheck, lint, unit tests, build, and browser/Playwright tests.

Verification must prove structural correctness only. It must not claim that page views per active user, click rate, or engagement time improved. Post-release GA observation should compare pages per active user (baseline 1.74), click-user percentage, `related_guide_click` destinations, Secret Location onward paths, and engagement time.

## SEO invariants

No change is permitted to route definitions, title or H1 values, canonical generation, robots, sitemap, JSON-LD schema, primary editorial claims, or source metadata. The work adds only internal navigation links among existing public paths.
