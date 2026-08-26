# Deployment Report

- Status: live-pending-data
- Repository: https://github.com/nialen/kotamon.git
- Branch: `main`
- Application commit: `837fa85b45b58e2ce207a8d20dc99ae82ad57ccb`
- Vercel team: `angelicachavira-1451s-projects`
- Vercel project: `kotamon`
- Analytics application deployment URL: https://kotamon-q48tl4fau-angelicachavira-1451s-projects.vercel.app
- Vercel project URL: https://kotamon.vercel.app
- Canonical production URL: https://kotamon.com
- Build result: 20/20 routes generated
- Route QA: 13 intended public routes returned HTTP 200; `/` returned 308 to `/en`; `/en/mods` returned 404.
- Analytics: GA4 `G-0N7JBKRYTE` is active in production; first real-time/data-processing observation is pending.

## Rollback

If the current production release regresses, restore the previous known-good deployment `dpl_9JFJMo641QG8k49gLekFoK8PA5Dq` from the Vercel project deployment list. DNS should remain unchanged during an application rollback.
