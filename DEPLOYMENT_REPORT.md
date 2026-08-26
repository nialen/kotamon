# Deployment Report

- Status: live custom domain; search/analytics setup pending
- Repository: https://github.com/nialen/kotamon.git
- Branch: `main`
- Commit: `4ce68a4281d78d91460201f0dbf887b23309e1f7`
- Vercel team: `angelicachavira-1451s-projects`
- Vercel project: `kotamon`
- Production deployment: `dpl_LagprirDgHEUtVuKXtefCmeWtjd8`
- Temporary production URL: https://kotamon.vercel.app
- Canonical production URL: https://kotamon.com
- Build result: 20/20 routes generated
- Route QA: 13 intended public routes returned HTTP 200; `/` returned 308 to `/en`; `/en/mods` returned 404.

## Rollback

If the current production release regresses, restore the previous known-good deployment `dpl_9JFJMo641QG8k49gLekFoK8PA5Dq` from the Vercel project deployment list. DNS should remain unchanged during an application rollback.
