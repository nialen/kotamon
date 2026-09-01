# Task 3 report — intent-based related-guide matrix

## Scope delivered

- Replaced only the `related` and approved `relatedHeading` frontmatter values across existing MDX entries; article prose, routes, titles, descriptions, and source metadata were left unchanged.
- Applied the complete approved 20-entry recommendation matrix. The Guides Hub now declares `related: []` and Cereal Boxes selects Money as its fourth destination per the ledger ruling.
- Added `tests/unit/intent-related-guides.test.tsx`, which protects authored and resolved related order for every content entry, the three approved custom headings, the Secret Location module’s four contextual destinations, and public route/SEO identity invariants.

## TDD and verification evidence

The initial focused test run failed as intended: 20 matrix/heading/contextual-link assertions failed against the previous frontmatter. After the frontmatter-only update, the same test passed all 23 assertions.

Fresh checks after the update:

```powershell
$runtimeNode = 'C:\Users\admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
& $runtimeNode 'node_modules\vitest\vitest.mjs' run --no-file-parallelism tests/unit/intent-related-guides.test.tsx
& $runtimeNode 'node_modules\tsx\dist\cli.mjs' scripts/validate-content.mjs
& $runtimeNode 'node_modules\typescript\bin\tsc' --noEmit
& $runtimeNode 'node_modules\eslint\bin\eslint.js' tests/unit/intent-related-guides.test.tsx
git diff --check
```

Focused test result: 1 file passed, 23 tests passed. Content validation result: 20 entries, 20 registry entries, 21 public routes, 0 errors.

The worktree’s pre-existing `pnpm-lock.yaml`, `.superpowers-install.*`, and `pnpm-workspace.yaml` changes were intentionally not staged.

## Round 1 correction

Restored the pre-task final blank line in `content/en/achievements/index.mdx`; the approved frontmatter matrix remains unchanged.

```powershell
& 'C:\Users\admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' 'node_modules\vitest\vitest.mjs' run --no-file-parallelism tests/unit/intent-related-guides.test.tsx
git diff --check
```

Output:

```text
Test Files  1 passed (1)
Tests  23 passed (23)
git diff --check: passed
```
