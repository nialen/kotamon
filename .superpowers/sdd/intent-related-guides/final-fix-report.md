# Intent-related guides final-review fix report

## Scope

Final-review findings fixed in `codex/intent-related-guides`:

1. Render the real Secret Location MDX body in the intent-related unit test and verify exactly one body link to each approved hidden-content destination, separately from the bottom related cards.
2. Add the missing Figurines, Audiotapes, and Achievements contextual links to the existing Secret Location body without importing the main checkout's broader prose/SEO changes.
3. Render `RelatedGuideLink` with `next/link` while preserving the optional, synchronous `gtag` call, exact event payload, one call per click, and uncancelled navigation.

Pre-existing workspace/install artifacts were left untouched and excluded from staging: `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.superpowers-install.err`, and `.superpowers-install.out`.

## Investigation and TDD evidence

The shell default was Node 14.21.1, below the repository's declared Node `>=20.9.0`. Running pnpm directly therefore failed before tests:

```powershell
pnpm exec vitest run tests/unit/intent-related-guides.test.tsx tests/unit/related-guide-link.test.tsx
```

```text
ERROR: This version of pnpm requires at least Node.js v16.14
The current version of Node.js is v14.21.1
```

The bundled Node 24.19.0 runtime was used directly for all subsequent checks, avoiding any install or lockfile operation:

```powershell
$nodeExe = 'C:\Users\admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
& $nodeExe --version
& $nodeExe 'node_modules\vitest\vitest.mjs' run tests/unit/intent-related-guides.test.tsx tests/unit/related-guide-link.test.tsx
```

Baseline output before the regression-test edits:

```text
v24.19.0
RUN  v4.1.11 F:/gitee/KOTAMON/.worktrees/codex/intent-related-guides

Test Files  2 passed (2)
Tests       25 passed (25)
```

The baseline passed because the Secret Location test rendered `null` for the body and only inspected `.related-guides`, while no test required `next/link`.

After adding the two regression assertions and before changing content/production code:

```powershell
& $nodeExe 'node_modules\vitest\vitest.mjs' run tests/unit/intent-related-guides.test.tsx tests/unit/related-guide-link.test.tsx
```

```text
RUN  v4.1.11 F:/gitee/KOTAMON/.worktrees/codex/intent-related-guides

FAIL  tests/unit/intent-related-guides.test.tsx > intent-based related guides > keeps Secret Location’s contextual onward links as the four approved hidden-content destinations
AssertionError: expected  to have a length of 1 but got +0

FAIL  tests/unit/related-guide-link.test.tsx > RelatedGuideLink > uses the Next.js Link component for client-side navigation
AssertionError: expected 'a' to be { …(6) } // Object.is equality

Test Files  2 failed (2)
Tests       2 failed | 24 passed (26)
```

These are the expected red failures: the actual body lacked three approved destinations, and the component returned a native `a` element.

## Changes

- `content/en/guides/secret-location.mdx`
  - Kept the existing Collectibles Hub link.
  - Added one natural contextual body link each to Figurines, Audiotapes, and Achievements in the same introductory context.
  - Did not alter the frontmatter title, description, slug, related matrix, source data, route steps, patch warning, or evidence claims.
- `tests/unit/intent-related-guides.test.tsx`
  - Renders `entry.Component` using the project's `useMDXComponents()` mapping inside `ArticleLayout`.
  - Scopes the contextual assertions to `.article-body` and requires exactly one link for each of Collectibles, Figurines, Audiotapes, and Achievements.
  - Keeps separate related-card assertions under `.related-guides`, so bottom cards cannot satisfy the body-link requirement.
- `src/components/article/related-guide-link.tsx`
  - Replaced the native anchor wrapper with `next/link`'s `Link`.
  - Kept the single synchronous optional `window.gtag?.(...)` call and the exact existing payload.
  - Did not call `preventDefault` or add asynchronous navigation handling.
- `tests/unit/related-guide-link.test.tsx`
  - Requires the component's returned element type to be `next/link`.
  - Verifies the event remains uncancelled when it reaches the document boundary, then cancels it only in the test harness to avoid jsdom navigation noise.
  - Continues to verify exactly one immediate call with the exact payload and functional behavior when `gtag` is unavailable.

## Final verification

### Focused unit tests

```powershell
$nodeExe = 'C:\Users\admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
& $nodeExe 'node_modules\vitest\vitest.mjs' run tests/unit/intent-related-guides.test.tsx tests/unit/related-guide-link.test.tsx
```

```text
RUN  v4.1.11 F:/gitee/KOTAMON/.worktrees/codex/intent-related-guides

Test Files  2 passed (2)
Tests       26 passed (26)
Duration    5.83s
Exit code   0
```

### Typecheck

```powershell
& $nodeExe 'node_modules\typescript\bin\tsc' --noEmit
```

```text
(no output)
Exit code 0
```

### Lint

```powershell
& $nodeExe 'node_modules\eslint\bin\eslint.js' .
```

```text
(no output)
Exit code 0
```

### Content validation

```powershell
& $nodeExe 'node_modules\tsx\dist\cli.mjs' scripts/validate-content.mjs
```

```text
Content entries: 20
Registry entries: 20
Public routes: 21
Categories: Achievements: 1, Cards: 1, Collectibles: 3, Game: 5, Guides: 10
Errors: 0
Content validation passed.
Exit code 0
```

### Production build

The default Turbopack build was attempted twice. Although the Next CLI parent ran under Node 24, Turbopack's code-evaluation worker resolved the machine's Node 14 runtime and failed consistently on modern syntax in every MDX input (`Unexpected token '||='`) plus Tailwind/PostCSS (`Unexpected token '??='`):

```powershell
& $nodeExe 'node_modules\next\dist\bin\next' build
```

```text
▲ Next.js 16.3.2 (Turbopack)
✓ Running next.config.mjs took 27ms
Creating an optimized production build ...
Build error occurred
Error: Turbopack build failed with 21 errors:
./content/en/achievements/index.mdx through ./content/en/updates/index.mdx
Error evaluating Node.js code
SyntaxError: Unexpected token '||='
./src/app/globals.css
Error evaluating Node.js code
SyntaxError: Unexpected token '??='
Exit code 1
```

Prepending the Node 24 directory to `PATH` produced the same Turbopack worker failure, confirming it was not caused by the changed content/component. The documented webpack build path was then used successfully:

```powershell
$nodeBin = 'C:\Users\admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin'
$env:Path = $nodeBin + ';' + $env:Path
& "$nodeBin\node.exe" 'node_modules\next\dist\bin\next' build --webpack
```

```text
▲ Next.js 16.3.2 (webpack)
✓ Running next.config.mjs took 30ms
Creating an optimized production build ...
✓ Compiled successfully in 23.1s
Running TypeScript ...
Finished TypeScript in 4.7s
Collecting page data using 7 workers ...
✓ Generating static pages using 7 workers (28/28) in 742ms
Finalizing page optimization ...
Collecting build traces ...

Route (app)
┌ ○ /
├ ○ /_not-found
├   /[locale]
│ └ ● /en
├   /[locale]/[...slug]
│ ├ ● /en/guides/gameplay
│ ├ ● /en/guides/card-repair
│ ├ ● /en/guides/foil-cards
│ └ ● [+17 more paths]
├ ○ /icon.ico
├ ○ /manifest.webmanifest
├ ○ /robots.txt
└ ○ /sitemap.xml

○  (Static)  prerendered as static content
●  (SSG)     prerendered as static HTML (uses generateStaticParams)
Exit code 0
```

### Whitespace and scope

```powershell
git diff --check
```

```text
(no output)
Exit code 0
```

## Self-review

- Requirement coverage: each review finding maps to a production/content change and a focused regression assertion.
- Identity preservation: Secret Location's `title`, `description`, `slug`, canonical route, H1 source, related heading, related ordering, sources, route instructions, and evidence claims are unchanged. Only the existing contextual-links sentence changed.
- Link count isolation: `.article-body` must contain exactly one of each approved destination; `.related-guides` is asserted independently and cannot satisfy the body counts.
- Analytics behavior: changing back to a native anchor fails the `Link` element-type assertion; removing/doubling the `gtag` call or changing any payload field fails the event test; calling `preventDefault` fails the document-boundary assertion.
- Scope hygiene: no package, lockfile, workspace, install-output, generated build, or unrelated user file is included in the fix.
