# Finish the programme refresh: migrate athletes onto the new content

The S.E.M. 2027 launch and the content refresh are done. What's still outstanding is the part of the plan that protected athletes who were already mid-programme.

## What is already live

- New content for Basic Training Blueprint+ (12 wks / 60), Hybrid Race Plan (12 wks / 72), S.E.M. 2026 (8 wks / 48) and S.E.M. 2027 (12 wks / 72).
- S.E.M. 2027 as a full product: public page, £19.99 one-off checkout, Club inclusion, in-app runner, catalogue, sitemap, homepage chooser, PDF guide.
- All four PDFs uploaded and marked current; Hybrid Race Plan duration corrected to 12 weeks; the legacy ATHX athlete granted S.E.M. 2027.

## What was not finished

**1. Old logged sessions no longer line up with the new content.** Hybrid Race Plan and S.E.M. 2026 sessions were renamed in the new manifests, so completions logged against the old session names are now invisible in those programmes. This affects 2 athletes (3 completed sessions in total). Basic Training Blueprint+ is unaffected — its session names are unchanged.

**2. The "stay or switch" choice was never built.** The new content simply replaced the old for everyone, instead of each athlete choosing when to move across.

## Proposed approach

Given only two athletes and three sessions are affected, building the full stay-or-switch experience is more machinery than the situation needs. Recommended:

- **Re-link the orphaned history.** Map each old session to its equivalent session in the new content for Hybrid Race Plan and S.E.M. 2026, so those completions show as done again and streaks, totals and PBs stay intact. Nothing is deleted.
- **Show a one-time "programme updated" note** on the Hybrid Race Plan and S.E.M. 2026 dashboards explaining that the plan has been refreshed and that completed work has carried over. Dismissible, remembered per athlete.
- **Skip the dual-version switcher** unless you want it: keeping two live versions of every programme adds ongoing maintenance for a benefit that only applies at the next content refresh.

If you'd rather have the full switcher, say so and I'll build per-athlete content version selection instead.

## Technical notes

- Backfill via a migration: update `session_completions.session_id` (and matching `workout_results.session_id`) for `hybrid-race-plan` and `sem-2026` using an explicit old-to-new ID map derived from week/day position (`hrp-w{w}-s{n}` → `hrp-v3-w{w}-s{n}`, `sem8-w{w}-s{n}` → `sem-2026-w{w}-s{n}`). Rows with no equivalent are left untouched rather than dropped.
- The refresh note lives in `programme_enrolments.state` as a dismissed flag; no schema change.
- No changes to checkout, Club pricing, manifests or the runner.

## Out of scope

No content edits to any programme, no redesign, no pricing changes.