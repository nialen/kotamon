# Local runbook

Date: 2026-08-26  
Project root: `F:\gitee\KOTAMON`

## Prerequisites

- Windows PowerShell or another shell that can run the package scripts.
- Node.js 20.9.0 or newer. The delivery environment used Node.js 24.14.0.
- pnpm 8.11.0 or newer. `package.json` declares `pnpm@8.11.0`, and `pnpm-lock.yaml` is the source of the resolved dependency graph.
- Python 3 with Pillow only when regenerating icon files.
- Installed Google Chrome when running the current Playwright configuration. `playwright.config.ts` selects `channel: 'chrome'`; it does not depend on a bundled Chromium download.

Check the main tools from the project root:

```powershell
node --version
pnpm --version
```

## Install

Use the project lockfile for a reproducible install:

```powershell
pnpm install --frozen-lockfile
```

Use plain `pnpm install` only when an approved dependency or manifest change is intended to update `pnpm-lock.yaml`:

```powershell
pnpm install
```

Do not hand-edit the lockfile. If the package manifest changes, review both `package.json` and the regenerated lockfile.

## Local development

Start the development server:

```powershell
pnpm dev
```

Open `http://localhost:3000/en`. The root path permanently redirects to `/en`. Stop the process with Ctrl+C.

## Core QA and production build

Run the core local gate:

```powershell
pnpm qa
```

`pnpm qa` runs, in order, TypeScript type checking, ESLint, the Vitest unit suite, and raw MDX plus registry validation. It does not run a production build, Playwright, the link crawler, or the template-residue scanner.

Build the production output after QA:

```powershell
pnpm build
```

Run the built site locally:

```powershell
pnpm start
```

The default production URL is `http://localhost:3000/en`. `pnpm start` requires a successful `pnpm build` first. Stop it with Ctrl+C.

For the broader browser and crawl gate after a build, run each command separately:

```powershell
pnpm test:e2e
pnpm exec tsx scripts/check-links.mjs
pnpm exec tsx scripts/check-template-residue.mjs
```

Playwright owns a production server on `127.0.0.1:3213`. The link crawler owns a separate server on `127.0.0.1:3214`. Both are expected to tear down their exact process after completion.

## Content authoring

Article content lives under `content/en` as MDX. The homepage at `/en` is code-backed and is not an MDX registry entry.

Authoring rules:

- Publish English only. Do not add another locale route until a complete localized scope is separately approved.
- Do not add an H1 inside MDX. `ArticleLayout` supplies the single page H1 and direct answer; begin article sections at H2.
- Write original prose from preserved evidence. Do not copy competitor prose or code, official logos, protected character or card art, or paid assets.
- Keep factual boundaries explicit. Omit unsupported odds, coordinates, prices, credits, guarantees, or completion times.
- Use visible warnings for community conflicts, patch-sensitive behavior, spoilers, or preservation risk.
- Use HTTPS source URLs and keep the source list non-empty.
- A publishable entry must include at least one source whose `kind` is not `unverified`; a publishable `sourceStatus` alone is not sufficient.
- Use only approved public related slugs. The registry rejects missing, self, duplicate, draft, unverified, and otherwise nonpublic related targets before rendering.
- Avoid visible Unicode em dash and en dash characters in public copy.
- Mods, cheats, trainers, codes, executable downloads, and incomplete locales remain outside public scope.

### Frontmatter schema

Every MDX article must provide the fields enforced by `src/content/schema.ts`:

```yaml
---
title: 'Non-empty page title'
description: 'Non-empty direct answer and metadata description'
slug: guides/example
category: Guides
updatedAt: '2026-08-25'
sourceStatus: multi-source
draft: false
locale: en
priority: P1
related:
  - guides/gameplay
sources:
  - label: 'Readable source label'
    url: 'https://store.steampowered.com/app/4294490/KOTAMON/'
    kind: official
---
```

Rules enforced by the schema and validator:

- `slug` and each `related` value must use canonical lowercase slash-separated segments. Each segment may contain lowercase ASCII letters, digits, and internal hyphens. Leading, double, and trailing slashes; uppercase letters; empty segments; dot segments; backslashes; colons; queries; and fragments are rejected.
- `updatedAt` is a real calendar date in `YYYY-MM-DD` form.
- `locale` is exactly `en`.
- `priority`, when present, is `P0`, `P1`, or `P2`.
- `sourceStatus` and each source `kind` use one of the four defined statuses below.
- `draft` is a Boolean.
- `sources` contains at least one record, every source URL uses HTTPS, and any non-draft entry with a publishable `sourceStatus` has at least one source whose `kind` is not `unverified`.
- Locale plus slug pairs are unique. Registry diagnostics identify the originating MDX path and, for duplicate or invalid related targets, the conflicting target path when available.
- `related` values are unique, cannot equal the entry's own slug, and must resolve to a same-locale public registry entry.

### Source status definitions

- `official`: the page's factual support is official first-party material for the claims it publishes.
- `multi-source`: the page combines two or more relevant sources, often separating official facts from maintained community evidence.
- `single-source`: the published claim boundary is supported by one identified source and must remain narrow.
- `unverified`: evidence is insufficient for publication. The registry excludes this status from public entries, static parameters, navigation consumers, and related-entry lookup.

`draft: true` is independently excluded. A public article must therefore be non-draft, use `official`, `multi-source`, or `single-source`, and carry at least one source whose `kind` is not `unverified`.

## Add or change a public article route

The route system is explicit. Adding an MDX file alone does not publish it.

1. Create the English MDX file under `content/en` with valid frontmatter and no authored H1.
2. Add a static default-component and `frontmatter` import in `src/content/entries.ts`.
3. Append the imported module to `contentModules` in the intended public order, including its project-relative `sourcePath` for path-aware diagnostics.
4. Add the full `/en/...` path to `PUBLIC_ROUTES` in `src/content/routes.ts` and update `PUBLIC_ROUTE_COUNT`.
5. Add the route to `PUBLIC_NAVIGATION_GROUPS` in the same article order. Module-load guards require the grouped article routes to equal `PUBLIC_ROUTES` after the homepage. Change `PRIMARY_NAVIGATION` only when the top-level navigation design calls for it.
6. Update related slugs only to registered public articles in the same locale. Do not add self references or repeat a slug; validation fails instead of silently dropping invalid relations.
7. Deliberately update `EXPECTED_MDX_COUNT` and `EXPECTED_PUBLIC_ROUTE_COUNT` in `scripts/validate-content.mjs` if the approved scope changed. Update route, sitemap, metadata, exclusion, and screenshot tests at the same time.
8. Update `CONTENT_COVERAGE.md` and the dated evidence reports as required.
9. Run `pnpm qa`, `pnpm build`, the browser tests, the link crawler, and the residue scanner.

The sitemap, static article parameters, metadata tests, validated related links, and public checks consume the registry or public manifest. Do not create a parallel route list.

The crawler ignores only same-page fragments, `mailto:`, `tel:`, and valid external HTTP or HTTPS links. `javascript:`, `data:`, and every other unsupported scheme are deterministic findings with the source page and original href.

## Known nonblocking limitations

These limitations do not block the current 13-route delivery, but they matter when maintaining or expanding it:

- Expected 404 logging: the Playwright exclusion check deliberately requests `/en/mods`. Next.js returns the required 404 but emits a `NoFallbackError` server log because the route family uses `dynamicParams = false`. The project keeps this static-generation boundary; no safe framework-compatible suppression was evident that preserved the same route behavior.
- JSON-LD regression coverage: page serialization replaces `<` with `\\u003c`, but the unit suite does not include a malicious `</script>` breakout regression. Current authored values are trusted and validated; add the explicit regression before accepting untrusted author input or changing serialization.
- External reference parity: the raw Steam achievement HTML and maintained card snapshot used for the Task 11 zero-difference comparisons were not preserved locally. The current 40-achievement and 40-plus-1 card assertions remain reproducible, but exact external parity cannot be rerun offline without obtaining fresh upstream material.
- Task 12 test scope: focused tests assert disclosure labels, content boundaries, and current factual warnings, but they do not simulate native `details` keyboard toggling or maintain a comprehensive deny-list for every prohibited factual claim. Native disclosure behavior, browser QA, source review, and the current targeted assertions provide present coverage; future claim or disclosure changes still require manual evidence review and focused tests.

The Task 9 prefetch warning, Task 13 residue coverage note, and Task 14 protocol and viewport findings were resolved in their later fix rounds and are not active delivery limitations.

## Regenerate icons

The protected source is `品牌与图标素材\favicon-source-512.png`. Do not modify or replace it without separate approval. Regenerate derived files with:

```powershell
python scripts/build-icons.py
```

The script writes:

- `public/brand/favicon-16.png`
- `public/brand/favicon-32.png`
- `public/brand/apple-touch-icon.png`
- `public/brand/icon-192.png`
- `public/brand/icon-512.png`
- `public/brand/favicon.ico`
- `src/app/icon.ico`

After regeneration, inspect the 512px, 32px, and 16px assets at native size and compare the protected source SHA-256 value with the Phase 1 baseline.

## Regenerate screenshots

Build first:

```powershell
pnpm build
```

Regenerate the complete 13-route light-mode evidence set:

```powershell
pnpm test:e2e
```

The first Playwright test writes deterministic full-page PNG files at a 1440x900 viewport to `qa/task-14-route-screenshots`. It requires system Google Chrome, manages port 3213, verifies the exact 13 filenames and PNG widths, and tears down the server.

The representative four-mode matrix under `qa/screenshots` is visual-review evidence, not a separate package script. When UI or content changes affect it:

1. Build the current site and run a controlled production server.
2. Recapture `/en`, `/en/guides/save-not-working`, `/en/cards`, `/en/collectibles/figurines`, and `/en/achievements` as full-page PNG files.
3. Capture every route at 1440x900 in light and dark themes and at 390x844 in light and dark themes.
4. Save the files under `qa/screenshots/desktop-light`, `desktop-dark`, `mobile-light`, and `mobile-dark` using the route-derived filenames already recorded in `VISUAL_QA.md`.
5. Open and inspect every changed PNG. Recheck overflow, word-preserving H1 wrapping, header geometry, keyboard menu behavior, focus, contrast, collisions, data containment, source labels, reduced motion, and favicon clarity.
6. Update `VISUAL_QA.md`, then rerun the full browser, crawl, and residue gate.

Do not overwrite a visual-QA set without completing its manual inspection. `pnpm test:e2e` regenerates only `qa/task-14-route-screenshots`; it does not replace the 20-file representative matrix.

## Delivery boundary

This runbook is for local development and verification only. Deployment is outside the approved scope. Do not initialize Git, create commits, publish to Git hosting, deploy to any host, edit DNS, configure analytics, or change any external account unless the user separately authorizes that work.

Current evidence locations:

- Build and command evidence: `BUILD_REPORT.md`
- Content intent coverage: `CONTENT_COVERAGE.md`
- SEO and route evidence: `SEO_QA.md`
- Visual evidence: `VISUAL_QA.md`
- Final delivery checkpoint: `docs/checkpoints/phase-6-delivery.md`
