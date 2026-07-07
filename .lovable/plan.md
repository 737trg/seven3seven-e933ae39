
## Goal

Replace the current Hybrid Race Plan (HRP) content and engine with the full 12-week programme from `SEVEN3SEVEN_Hybrid_Race_Plan_User_Download.pdf`. Silently upgrade existing HRP owners to the new version, fix dashboard logic issues, and keep the current dark editorial Seven3Seven design intact.

No visual redesign. No customer-facing "migration" language.

---

## 1. Ingest the PDF as source of truth

- Upload the new PDF as a CDN asset (replaces `src/assets/hrp-download.pdf.asset.json`). The "Download PDF" button on the HRP programme page points to this URL.
- Parse all 12 weeks from the PDF into a single typed manifest. Every week contains: `weekNumber`, `phase`, `trainingLoad`, `keyAim`, and every session with all PDF fields (`purpose`, `intensity`, `warmUp`, `mainSet`, `secondaryWork`, `programmeFocus`, `coolDown`, `record`, `progressionStandard`, `coachNote`) plus derived `blocks[]` with correct `timerType`/`timerDurationSeconds` and per-block `logSchema`.
- Weeks 1–11 = 5 core sessions + 1 optional recovery/skills. Week 12 = strength primer, run primer, easy aerobic reset, movement primer, Race Day, optional post-race reset/reflection.
- Include the shared PDF reference tables: Station Load Levels (L1–L5), Race Volume Levels (RVL 1–5), Readiness actions, Progression order.

## 2. Programme engine (reusable foundation)

Create `src/lib/programmeEngine/` — used by HRP now, and by BTB/SEM/ATHX/future plans later.

- `types.ts` — `Programme`, `Week`, `Session`, `Block`, `LearnArticle`, `LogSchema`, `LogField`, block types (`strength`, `run`, `sled`, `station`, `brick`, `recovery`, `race`, `raceReview`).
- `registry.ts` — maps programme slug → manifest.
- `resolver.ts` — resolves a session by programme+week+day, returns typed blocks + log schemas.
- `progress.ts` — completion %, current week (from enrolment `started_at` + user completions), next session across programmes, programme-specific metrics (run repeatability, strength reserve, sled ability, station repeatability, no-reps, brick drop-off, race readiness).
- `logSchemas.ts` — schema-per-block-type matching the spec (strength, running, sled, station, brick, recovery, race review). No-rep target wording included verbatim.

BTB, SEM, ATHX are wrapped as thin manifests using their existing content so the same engine drives them (no content change to those plans in this pass).

## 3. Hybrid Race Plan manifest

`src/lib/programmes/hybridRacePlan/` — the full 12-week manifest, one file per week for maintainability (`week01.ts` … `week12.ts`) plus `index.ts` that composes them, plus `learn.ts` (Built for Hybrid Racing, How to Use the Plan, Intensity and Load Levels, Race Volume Levels, Pace Drop-Off and Race Pace, Choosing Load and Race Volume, Breaking Stations Without Panic, Race Day Tools, Safety and Sources) and `raceDayTools.ts`.

Every session includes all PDF fields verbatim and typed blocks with the correct timers (e.g. 24-min EMOM → 1440s). The old `src/lib/hrp/manifest.ts` is deleted and imports updated to the new module.

## 4. Silent upgrade for existing HRP owners

- Database: single migration that (a) marks the existing HRP `programme_version` as superseded and (b) inserts a new `programme_version` row for the rebuilt plan, then updates every active `programme_enrolments` row where `product = HRP` to point at the new version. `entitlements` remain unchanged so nobody re-purchases.
- Reset per-user session progress only where the old session id no longer maps to a new session (orphaned completions stay in history but are not shown as "current"). Completed session count and streaks are preserved by remapping day-of-week + week where a match exists.
- Zero customer-facing wording about "migration", "V2", "legacy", "upgrade", "schema".

## 5. Dashboard logic fixes (no visual redesign)

`src/lib/useCustomerDashboard.ts` + `src/routes/my-programmes.index.tsx`:

- **Current week**: never blank when the user has an active programme. Compute from enrolment `started_at` + user's local week if no completions yet.
- **Multiple active programmes**: show "Next session" (soonest across all programmes) and "Primary programme" (most recent activity) instead of a single ambiguous current week.
- **Progress %**: real value = completed core sessions ÷ programme total core sessions.
- **Recent activity**: render session `name` (e.g. "Strength + sled — Week 3") not internal session id.
- **Programme card actions**: Continue Training, View Programme, Download PDF (only when programme has a PDF).
- Responsive check on mobile at existing breakpoints; no new components introduced beyond what's needed.

## 6. Guided session player + logging

Existing dark player is kept. Fixes only:

- Block timer reads `timerDurationSeconds` from the manifest — no more hard-coded 10 min fallback.
- `LogDrawer` renders fields from the block's `logSchema` (schema-driven), giving strength / running / sled / station / brick / recovery / race review the correct fields listed in the spec.
- No-rep guidance line rendered on any block with a `noReps` field.

## 7. Learn, Race Day, Progress

- `src/routes/my-programmes.hybrid-race-plan.learn.tsx` reads from the HRP `learn.ts` (programme-specific articles, linked to sessions via `relatedSessions`).
- Race Day tools page reads from `raceDayTools.ts`.
- Progress page reads programme-specific metrics from `programmeEngine/progress.ts`.

## 8. Acceptance verification (before hand-off)

- Build passes; typecheck clean.
- HRP programme page lists 12 weeks; each normal week has 5 core + 1 optional; Week 12 has the taper/race/reset layout.
- Spot-check three sessions (e.g. Wk1 Fri Station repeatability baseline, Wk7 Fri Race-load station density, Wk12 Race Day) against the PDF verbatim.
- Existing test user with old HRP entitlement lands on the new plan with no re-purchase and no "migration" wording.
- Dashboard shows correct current week + next session for that user.
- Playwright screenshot of dashboard + HRP programme page + one guided session to confirm dark S3S styling is unchanged.

---

## Out of scope for this pass

- Visual redesign of any page.
- Content changes to BTB / SEM / ATHX (only wrapped in the new engine).
- New payment or auth flows.

## Technical notes

```text
src/lib/
  programmeEngine/
    types.ts
    registry.ts
    resolver.ts
    progress.ts
    logSchemas.ts
  programmes/
    hybridRacePlan/
      index.ts
      week01.ts ... week12.ts
      learn.ts
      raceDayTools.ts
    basicTrainingBlueprint/index.ts   (thin wrapper of current content)
    sem2026/index.ts                  (thin wrapper)
    athx/index.ts                     (thin wrapper)
```

Migration (single file):
1. Insert new `programme_versions` row for HRP with the new manifest hash.
2. Mark previous HRP version `is_current = false`.
3. `UPDATE programme_enrolments SET programme_version_id = <new>` for all HRP enrolments.
4. GRANTs unchanged (no new tables).

`src/lib/hrp/*` is deleted after callers are migrated to `programmeEngine` + `programmes/hybridRacePlan`.
