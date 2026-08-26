# Content coverage

Date: 2026-08-26  
Public language: English only

## Scope

The first release publishes exactly 13 English routes: one code-backed homepage and 12 registered MDX articles. No Russian, Chinese, Spanish, or other locale is public. Mods and cheats remain deferred research intents with no route, navigation entry, sitemap entry, or public page.

`Last updated` is the public content date for MDX articles and the reviewed coverage date for the code-backed homepage and deferred research rows.

## Researched intent coverage

| Researched intent | Public outcome | Route | Source status | Last updated | Conflict or limitation warning |
|---|---|---|---|---|---|
| Homepage | Public | `/en` | `multi-source` coverage | 2026-08-25 | Code-backed landing page; it summarizes the source hierarchy and does not replace article-level sources. |
| KOTAMON gameplay | Public | `/en/guides/gameplay` | `multi-source` | 2026-08-25 | Prices and collectible behavior are patch-sensitive; unsupported fixed rates and upgrade prices are omitted. |
| KOTAMON card repair | Public | `/en/guides/card-repair` | `multi-source` | 2026-08-25 | The supported five-piece manual process is published; automatic assembly, fixed coordinates, and costs are not confirmed. |
| KOTAMON all cards | Public with current-list warning | `/en/cards` | `multi-source` | 2026-08-25 | Steam supports collection goals, while the 40 base-card names are a dated maintained community list. Kotalion is separately named by Steam. |
| KOTAMON foil cards | Public | `/en/guides/foil-cards` | `official` | 2026-08-25 | Official sources publish no drop rate, pity rule, guarantee, or complete foil list. |
| KOTAMON cereal boxes | Public | `/en/guides/cereal-boxes` | `official` | 2026-08-25 | The current official price is $10,000 after all attributes are maxed; purchase frequency, box odds, and a foil guarantee are not established. |
| KOTAMON figurine locations | Public | `/en/collectibles/figurines` | `multi-source` | 2026-08-25 | Six current landmark checks are followed by random trash-pile discoveries; the evidence does not support twelve fixed map points. |
| KOTAMON audiotape locations | Public with issue warning | `/en/collectibles/audiotapes` | `multi-source` | 2026-08-25 | Steam requires seven valid counts; 6 of 7 counter symptoms and extra-pickup reports are community-reported and patch-sensitive, not an eighth requirement or guaranteed fix. |
| KOTAMON achievements | Public | `/en/achievements` | `multi-source` | 2026-08-25 | The 40 public Steam entries are complete for the reviewed date; live completion percentages and fastest-completion claims are omitted. |
| KOTAMON save not working | Public with preservation-first advice | `/en/guides/save-not-working` | `multi-source` | 2026-08-25 | Official fixes and later reports do not fully agree on every symptom. The page preserves the last good save and does not promise recovery. |
| KOTAMON secret location | Public with spoiler and patch warning | `/en/guides/secret-location` | `multi-source` | 2026-08-25 | The official hidden-surprise hint is separated from a community-reported, patch-sensitive collision route; no exact coordinates or fixed reward are claimed. |
| KOTAMON where to play | Public | `/en/game/where-to-play` | `official` | 2026-08-25 | The supplied sources establish Windows PC through Steam only; they do not establish another platform, a future port, or permanent exclusivity. |
| KOTAMON artist | Public with individual-credit gap | `/en/game/artists` | `single-source` | 2026-08-25 | Only studio-level attribution to KotaMota Games is supported. Individual names and roles require authoritative in-game credit evidence. |
| KOTAMON mods | Deferred and absent | None | `unverified` | 2026-08-25 | One player discussion and no authoritative developer answer are insufficient. `/en/mods` is intentionally absent and returns not found. |
| KOTAMON cheats | Deferred and absent | None | `unverified` | 2026-08-25 | Search demand exists, but no reliable factual support exists. No cheats, trainers, codes, executable downloads, or public route are provided. |

## Publication rules

- Public article statuses are limited to `official`, `multi-source`, and `single-source`.
- Every publishable article also requires at least one source whose `kind` is not `unverified`; status and source support cannot contradict each other.
- An `unverified` entry is excluded from public registry accessors and static route generation even when it is not a draft.
- `draft: true` is also excluded from public accessors and route generation.
- Related slugs are validated before rendering and must be unique, non-self, same-locale public targets. Missing, draft, unverified, and otherwise nonpublic relations fail with originating file paths.
- Public routes, navigation, sitemap, validated related links, and QA all consume the explicit English route and content registries.
- Any future scope change must be approved before route counts, allowed locales, forbidden-route checks, or validator constants are changed.
