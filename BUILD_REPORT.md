# Build report

Date: 2026-08-26  
Full gate run: 2026-08-25 23:52 to 2026-08-26 00:01 China Standard Time  
Project: `F:\gitee\KOTAMON`

## Environment

| Tool | Version |
|---|---|
| Operating system | Microsoft Windows NT 10.0.19045.0 |
| Node.js | v24.14.0 |
| pnpm | 8.11.0 |
| Next.js | 16.3.2 |
| TypeScript | 6.0.3 |
| ESLint | 9.39.5 |
| Vitest | 4.1.11 |
| Playwright | 1.62.1 |
| Google Chrome channel | 151.0.7922.169 |

The package lockfile remained `pnpm-lock.yaml`; Task 14 added no dependency and did not run an install. The Playwright package expected a newer bundled Chromium revision that was not present. A bounded `pnpm exec playwright install chromium` attempt did not complete before interruption and exited 1. The project therefore uses the already installed system Google Chrome channel. The final browser gate used that channel and exited 0, so the partial Playwright cache is not required by this project configuration.

## Full automated gate

The following commands were run in the required order in one fresh PowerShell gate. Every command exited 0.

| Command | Exit | Evidence |
|---|---:|---|
| `pnpm typecheck` | 0 | TypeScript emitted no errors. |
| `pnpm lint` | 0 | ESLint emitted no errors. |
| `pnpm test:run` | 0 | 11 files, 85 tests passed. |
| `pnpm validate:content` | 0 | 12 MDX entries, 12 registry entries, 13 public routes, 5 categories, 0 errors. |
| `pnpm build` | 0 | Next.js compiled, typechecked, and generated 20 framework and content pages. |
| `pnpm test:e2e` | 0 | 7 Playwright tests passed using one managed production server and one worker. |
| `pnpm exec tsx scripts/check-links.mjs` | 0 | 13 internal HTML pages visited, 0 broken internal links. |
| `pnpm exec tsx scripts/check-template-residue.mjs` | 0 | 51 text files scanned, 0 findings. |

A post-gate residue scan covered 51 configured public-source text files and found 0 issues.

Vitest initially collected the new Playwright spec because both tools recognize `*.spec.ts`. `vitest.config.ts` now extends Vitest's default exclusions with `tests/e2e/**`. The focused rerun and the fresh full gate both passed.

## Production route output

Next.js reported these route families:

- Static root redirect: `/`.
- Framework not-found route: `/_not-found`.
- Static locale homepage: `/en`.
- Static article route family with all 12 approved content paths.
- Metadata and discovery endpoints: `/icon.ico`, `/manifest.webmanifest`, `/robots.txt`, and `/sitemap.xml`.

The 13 approved public routes are:

1. `/en`
2. `/en/guides/gameplay`
3. `/en/guides/card-repair`
4. `/en/guides/foil-cards`
5. `/en/guides/cereal-boxes`
6. `/en/guides/save-not-working`
7. `/en/guides/secret-location`
8. `/en/cards`
9. `/en/collectibles/figurines`
10. `/en/collectibles/audiotapes`
11. `/en/achievements`
12. `/en/game/where-to-play`
13. `/en/game/artists`

## Managed server lifecycle

- Playwright starts `next start` on `127.0.0.1:3213`, disables server reuse, waits on `/en`, uses one worker, and lets Playwright own teardown.
- The link crawler starts a separate production server on `127.0.0.1:3214` only when no `--base-url` is supplied.
- On Windows the crawler starts pnpm through the exact `ComSpec` process tree and terminates that PID tree in `finally`; on other platforms it uses a detached process group.
- Cleanup is a cached single-flight Promise. Concurrent signal and `finally` callers share one result, repeated callers never issue a second raw-PID kill, and cleanup failures remain cached rather than retrying a destructive action.
- Windows `taskkill` exit status and output are checked. A nonzero exit while the owned child is still running produces an actionable PID-scoped error; a child that already exited during the race is accepted without another kill.
- The crawler validates host and port inputs, waits for a real 200 response, and reports early server exits with captured output.
- Link classification ignores only fragments, `mailto:`, `tel:`, and valid external HTTP or HTTPS links. `javascript:`, `data:`, and every other parseable unsupported scheme become deterministic findings carrying the source page and original href.
- After the full gate, listener checks for ports 3213 and 3214 returned 0.

The first Windows lifecycle run reproduced `spawn EINVAL` when Node 24 attempted to execute `pnpm.cmd` directly with `shell: false`. The corrected `ComSpec` invocation visited 13 pages with 0 broken links and left 0 listeners on port 3214.

## Final review fix scope

- Publishable frontmatter now requires at least one `sources[].kind` other than `unverified` through the shared schema used by the build registry and raw MDX validator.
- Every related slug is validated against same-locale public entries. Missing, self, duplicate, draft, unverified, and otherwise nonpublic targets fail with source-path diagnostics before the render path resolves them.
- Slugs and related values now use canonical lowercase slash-separated segments.
- The crawler reports `javascript:`, `data:`, and all other unsupported schemes instead of ignoring them.
- With no stored override, the hydrated theme control now follows live system preference changes. A manual stored override remains authoritative.
- All icon metadata components import the public Phosphor `Icon` type export.

## Protected input preservation

The 16 SHA-256 baselines in `docs/checkpoints/phase-1-material-preflight.md` were compared individually after the full gate.

| Measure | Result |
|---|---:|
| Protected inputs checked | 16 |
| Exact hash matches | 16 |
| Hash mismatches | 0 |
| Missing protected inputs | 0 |

No research Markdown, JSON, favicon source, favicon preview, or demand-evidence image changed.

## Task 14 changes

- Added `scripts/check-links.mjs` and its TypeScript declaration.
- Added focused crawler behavior coverage in `tests/unit/check-links.test.ts`.
- Added production browser coverage in `tests/e2e/public-site.spec.ts`.
- Added 13 deterministic successful route screenshots under `qa/task-14-route-screenshots`.
- Updated `playwright.config.ts` for deterministic system-Chrome execution, failure screenshots, fixed ports, an actual 1440 by 900 project viewport applied after the device spread, and managed server teardown.
- Updated `vitest.config.ts` so unit tests do not collect Playwright specs.
- Corrected article title templating in `src/seo/metadata.ts` after the browser test exposed a duplicate suffix.
- Added this report and `SEO_QA.md`.

## Reproducible blockers and limitations

There is no blocker to local build, crawl, or SEO verification.

The final Playwright output includes a Next.js `NoFallbackError` server log while deliberately requesting the unsupported `/en/mods` route. The response assertion still receives the required 404 and all browser tests pass. No suppression change was made because no clearly safe Next-compatible option was evident that preserved the `dynamicParams = false` route boundary. The environment also prints a color-setting warning because Playwright enables color while the shell exports `NO_COLOR`. Neither message changes an exit status or leaves a server running.

The first final-review full browser run hit the default 30-second total timeout inside the single test that navigates all 13 routes and writes 13 full-page screenshots. A focused rerun completed in 7.8 seconds and confirmed no route failure. That inherently multi-route test now uses Playwright's `test.slow()` budget; the fresh complete rerun passed all 7 tests in 18.4 seconds.

Task 14 route screenshots are deterministic 1440 by 900 light-mode, full-page evidence for every public route. Browser assertions verify the real viewport and PNG IHDR width, and post-run inspection confirmed all 13 images are 1440 pixels wide. The separate visual QA task still owns the representative light and dark desktop and mobile matrix.
