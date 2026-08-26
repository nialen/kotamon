# Visual QA

Date: 2026-08-25

## Scope and method

The five representative public routes were captured from the production Next.js server in four modes:

- Desktop light: 1440 by 900 viewport
- Desktop dark: 1440 by 900 viewport
- Mobile light: 390 by 844 viewport
- Mobile dark: 390 by 844 viewport

Every artifact is a deterministic full-page PNG. Each of the 20 final screenshots was opened and inspected after the final UI repair. Automated Playwright measurements complemented the image review for viewport width, header geometry, overflow, element collisions, data-group containment, theme state, focus rendering, mobile-menu keyboard behavior, text contrast, and reduced-motion behavior.

## Repairs found by this QA pass

1. The mobile save-troubleshooting page initially expanded to 485px and the mobile achievements page expanded to 402px at a 390px viewport. An initial emergency wrap removed overflow but visibly split `Troubleshooting` and `Achievements:` inside the words. The final repair uses `clamp(1.75rem, 8.75vw, 2.5rem)`, a 1.08 line height, and normal word wrapping. Both pages remain exactly 390px wide and each H1 word occupies one visual line box. The real-browser regression first failed on width, then failed with two line boxes for each fragmented word, and now passes both conditions.
2. The homepage primary CTA rendered at 2.29:1 contrast because an unlayered global anchor color overrode its Tailwind text-color utility. Removing that redundant anchor color lets `--accent-foreground` apply. The dark where-to-play card copy measured 4.374:1, so that one paragraph now uses the strong foreground token. A two-theme Playwright contrast test failed on both surfaces before the repair and passes at WCAG AA after it.

The shared-link repair required all four screenshot sets to be recaptured. The word-preserving heading fix then required all five screenshots in both mobile directories to be recaptured and visually inspected again.

## Preflight results

| Requirement | Evidence | Outcome |
|---|---|---|
| Desktop header is one line and below 80px | All five desktop routes in both themes measured 74px. Primary navigation items shared one row and brand, navigation, and actions shared a vertical midpoint. | PASS |
| Mobile menu is keyboard operable | In every mobile route and theme, Enter opened the disclosure, Tab reached the first link, Escape closed it, and focus returned to the trigger. | PASS |
| No horizontal overflow | Every desktop document measured 1440px. Every mobile document measured 390px, including the open menu state. Final mobile PNG widths are all 390px, and every mobile H1 word occupies exactly one visual line box. | PASS |
| Meaningful original hero | The homepage shows the original paper-cut collection binder visual in all four modes. It has meaningful alt text and a non-zero rendered and natural size. | PASS |
| No focal collisions | Automated sibling-bound checks reported zero collisions in the header, hero grid, article content grid, and representative editorial cards. Manual review of all 20 screenshots, followed by a second review of all 10 recaptured mobile screenshots, found no overlaps, clipped focal elements, or internally fragmented H1 words. | PASS |
| Data groups are readable | Cards exposed 41 contained editorial entries, achievements exposed 40 contained entries, and figurines exposed 6 contained checklist items. Every item stayed inside its viewport and internal width. | PASS |
| Focus rings are visible | Keyboard focus produced a visible 3px outline plus a 2px accent halo in both themes. | PASS |
| Contrast passes | The final representative direct-text audit found zero WCAG AA failures in all 20 route and mode combinations. The repaired CTA and tinted-card copy are also protected by Playwright contrast assertions. | PASS |
| Source labels are plain text | Each article route visibly rendered `Multiple sources` as text inside the source-status disclosure. | PASS |
| Reduced motion preserves understanding | With `prefers-reduced-motion: reduce`, visible main-content counts were unchanged and nonessential transitions reduced to 0.01ms. | PASS |

## Screenshot matrix

| Route | Viewport | Theme | Outcome | Exact file path |
|---|---:|---|---|---|
| `/en` | 1440x900 | Light | PASS | `F:\gitee\KOTAMON\qa\screenshots\desktop-light\en.png` |
| `/en/guides/save-not-working` | 1440x900 | Light | PASS | `F:\gitee\KOTAMON\qa\screenshots\desktop-light\en--guides--save-not-working.png` |
| `/en/cards` | 1440x900 | Light | PASS | `F:\gitee\KOTAMON\qa\screenshots\desktop-light\en--cards.png` |
| `/en/collectibles/figurines` | 1440x900 | Light | PASS | `F:\gitee\KOTAMON\qa\screenshots\desktop-light\en--collectibles--figurines.png` |
| `/en/achievements` | 1440x900 | Light | PASS | `F:\gitee\KOTAMON\qa\screenshots\desktop-light\en--achievements.png` |
| `/en` | 1440x900 | Dark | PASS | `F:\gitee\KOTAMON\qa\screenshots\desktop-dark\en.png` |
| `/en/guides/save-not-working` | 1440x900 | Dark | PASS | `F:\gitee\KOTAMON\qa\screenshots\desktop-dark\en--guides--save-not-working.png` |
| `/en/cards` | 1440x900 | Dark | PASS | `F:\gitee\KOTAMON\qa\screenshots\desktop-dark\en--cards.png` |
| `/en/collectibles/figurines` | 1440x900 | Dark | PASS | `F:\gitee\KOTAMON\qa\screenshots\desktop-dark\en--collectibles--figurines.png` |
| `/en/achievements` | 1440x900 | Dark | PASS | `F:\gitee\KOTAMON\qa\screenshots\desktop-dark\en--achievements.png` |
| `/en` | 390x844 | Light | PASS | `F:\gitee\KOTAMON\qa\screenshots\mobile-light\en.png` |
| `/en/guides/save-not-working` | 390x844 | Light | PASS | `F:\gitee\KOTAMON\qa\screenshots\mobile-light\en--guides--save-not-working.png` |
| `/en/cards` | 390x844 | Light | PASS | `F:\gitee\KOTAMON\qa\screenshots\mobile-light\en--cards.png` |
| `/en/collectibles/figurines` | 390x844 | Light | PASS | `F:\gitee\KOTAMON\qa\screenshots\mobile-light\en--collectibles--figurines.png` |
| `/en/achievements` | 390x844 | Light | PASS | `F:\gitee\KOTAMON\qa\screenshots\mobile-light\en--achievements.png` |
| `/en` | 390x844 | Dark | PASS | `F:\gitee\KOTAMON\qa\screenshots\mobile-dark\en.png` |
| `/en/guides/save-not-working` | 390x844 | Dark | PASS | `F:\gitee\KOTAMON\qa\screenshots\mobile-dark\en--guides--save-not-working.png` |
| `/en/cards` | 390x844 | Dark | PASS | `F:\gitee\KOTAMON\qa\screenshots\mobile-dark\en--cards.png` |
| `/en/collectibles/figurines` | 390x844 | Dark | PASS | `F:\gitee\KOTAMON\qa\screenshots\mobile-dark\en--collectibles--figurines.png` |
| `/en/achievements` | 390x844 | Dark | PASS | `F:\gitee\KOTAMON\qa\screenshots\mobile-dark\en--achievements.png` |

Each required directory contains exactly the five files listed above. Every PNG is larger than 10,000 bytes and at least as tall as its viewport.

## Favicon inspection

| Asset | Native size | Visual result | Outcome |
|---|---:|---|---|
| `F:\gitee\KOTAMON\public\brand\icon-512.png` | 512x512 | Coral five-point star, navy outline, sky circle, and white inset remain crisp. | PASS |
| `F:\gitee\KOTAMON\public\brand\favicon-32.png` | 32x32 | Star silhouette, navy outline, sky circle, and white inset remain recognizable. | PASS |
| `F:\gitee\KOTAMON\public\brand\favicon-16.png` | 16x16 | The simplified star silhouette remains recognizable at native size. | PASS |

The 16 protected research inputs, including the three approved favicon source and preview assets, match the Task 1 SHA-256 baseline exactly.

## Final gate

After the word-preserving fix round, the full Task 14 gate passed again: typecheck, lint, 68 unit tests, content validation, production build, 6 Playwright tests, the 13-route link crawl, and the template-residue scan. Ports 3213 and 3214 had no listeners after QA. No commit or deployment action was performed.
