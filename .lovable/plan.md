
## Goal

Rebuild the Hybrid Race Plan (HRP) as the complete 12-week programme from the uploaded PDF, on top of a reusable Seven3Seven programme engine. Preserve the current dark, editorial dashboard look. Fix "My programmes" logic. Existing HRP purchasers get the new plan silently.

## Scope boundaries

- No visual redesign of the dashboard, sidebar, or workout player. Only logic and data fixes.
- No changes to Basic Training Blueprint+, SEM 2026, or ATHX content or routes. They continue to work as-is on the same engine.
- No DB schema changes. No RLS or entitlement changes. Existing `entitlements` for the `hybrid-race-plan` product already grant access — we replace the underlying manifest, not the product.
- Customer-facing copy contains no migration, legacy, V2, schema, or internal wording.

## 1. Programme engine (shared foundation)

Introduce a typed programme model in `src/types/programmeEngine.ts` covering: Programme, Phase, Week, Session, Block, LearnArticle, ProgressMetric, Tool, Glossary, LogSchema. Fields match the brief (durationWeeks, weeklyStructure, pdfDownload, phases, weeks, learnContent, progressMetrics, tools, accessRules, etc.).

Add `src/lib/programmeEngine/` with:
- `registry.ts` — maps slug → programme manifest loader (hybrid-race-plan, basic-training-blueprint-plus, sem-2026, athx-2026).
- `resolveSession.ts` — replaces the current ad-hoc `anySession.ts` mapping. Given `(programmeSlug, sessionId)`, returns a normalised `Session` with typed `Block[]`, timers, and per-block `logSchema`.
- `logSchemas.ts` — declarative log field sets per block type (strength, running, sled, station, hybrid-brick, recovery, race-review), matching the brief's field lists exactly.
- `progressMetrics.ts` — pluggable per-programme metric calculators (HRP: run repeatability, strength reserve, sled ability, station repeatability, no-reps, brick drop-off, race readiness).

The existing BTB / SEM / ATHX manifests keep working by adapter — they register through the same registry but retain their current data files. Only HRP swaps to the new manifest.

## 2. Hybrid Race Plan content (source of truth = uploaded PDF)

Replace `src/data/hrp.manifest.json` with a fully rebuilt manifest generated from every page of the PDF:

- 12 weeks total. Weeks 1–11 use the 5 core + 1 optional structure. Week 12 is taper + race + optional post-race reset/reflection.
- Each week captures: phase, training load, key aim, checkpoint.
- Each session captures every field the PDF lists: day, name, type, optional flag, estimated duration, purpose, intensity, warm-up, main set, secondary work, programme/event focus, cool-down, record, progression standard, coach note.
- Every block gets a typed prescription plus `timerType` and `timerDurationSeconds` derived from the PDF (e.g. 24-min EMOM → EMOM timer at 1440 s, not the current 10-min fallback).
- Learn content on the manifest: Built for Hybrid Racing, How to Use the Plan, Intensity and Load Levels, Race Volume Levels, Pace Drop-Off and Race Pace, Choosing Load and Race Volume, Breaking Stations Without Panic, Race Day Tools, Safety and Sources. Each article links to relevant sessions.
- Glossary entries for Station Load Levels (L1–L5) and Race Volume Levels (RVL 1–5).
- Race Day tools block populated from the PDF's Race Day Tools section.

The manifest will be authored directly from the parsed PDF content (all 12 weeks, no summarisation, no placeholders). Given the size (~150+ blocks), this ships as one structured JSON manifest plus TS validators that will fail the build if any required field is missing for any session.

The PDF itself is uploaded as a Lovable asset and referenced from the manifest as `pdfDownload` so the "Download PDF" action serves the uploaded file.

## 3. Dashboard logic fixes (no visual redesign)

Update `_marketing.my-programmes.tsx` and the "My programmes" hero/stat row:

- "Current week" derives from the primary active programme's start date and duration. Never blank when at least one programme is active.
- When multiple programmes are active, show "Next session" across all programmes (soonest scheduled or most-recently-touched), plus a "Primary programme" pill on the card the user last opened.
- Active-programme cards read real progress from `session_completions` + local progress store (already programme-scoped after the last change), showing: progress %, current week, next session title, and actions: Continue Training, View Programme, Download PDF (only when `pdfDownload` is set).
- Recent activity uses customer-facing session names from the manifest, not raw slugs or ids.
- Mobile layout: same structure, single column, no card redesign.

## 4. Silent migration for existing HRP customers

- No SQL migration, no entitlement changes. The `hybrid-race-plan` product entitlement continues to grant access; we only replace the manifest that slug resolves to.
- Local per-user HRP progress is namespaced by `programmeId = "hybrid-race-plan"`. Because session ids change with the new manifest, add a one-time client-side reconciliation on first load of the HRP dashboard: any legacy per-session progress under the old ids is archived (kept in local storage under a `legacy_*` key so nothing is destroyed) and the UI shows the new plan starting cleanly from Week 1. No banner, no wording — it just feels like an upgraded plan.
- Server-side `session_completions` rows remain untouched; they just no longer match new session ids and are ignored for progress %. This is invisible to the user.

## 5. Today, Programme, Session detail, Guided player

All existing routes stay; only the data they consume changes:

- **Today**: what / why / how hard / what to record / related Learn article, using engine fields. Sticky "Start session" and "Last completed session".
- **Programme**: overview, phase/week selector, current week, six session cards per week for HRP, completion state, PDF download, Learn links, programme-specific tools.
- **Session detail**: shows Purpose, Intensity, Warm-up, Main set, Secondary work, Programme/Event focus, Cool-down, Record, Progression standard, Coach note, then a single "Start Guided Session" button (existing style).
- **Guided player** (`workout.$sessionId`): keeps current dark player. Fixes: sticky header with exit / programme + session / elapsed timer; progress bar; "Block x of y"; correct timer per block (driven by `timerDurationSeconds`); pause/resume; previous/next; mark block complete; autosave + resume unfinished sessions (already partially implemented — extended to all programmes via the engine).

## 6. Logging (smart per block type)

`LogDrawer` becomes schema-driven: it renders fields declared by the block's `logSchema` (strength / running / sled / station / hybrid-brick / recovery / race-review) with the exact fields listed in the brief. Existing `workout_results` writes stay compatible — new fields are stored in the existing `payload` jsonb (no schema change).

No-rep wording standardised to: "Target: zero no-reps. If no-reps appear, record them and reduce volume or load next exposure."

## 7. Progress

`_app.progress.tsx` (and per-programme progress pages) read progress metrics from the engine. For HRP: sessions completed, results logged, consistency, current week, completion %, run repeatability, strength reserve, sled ability, station repeatability, no-reps, brick drop-off, race readiness. Other programmes keep their existing metrics until they are migrated to engine metrics later.

## 8. Learn

`_app.learn.tsx` and the per-programme Learn routes read Learn articles from the active programme's manifest. HRP ships with the 9 articles listed above. Session detail links to the related Learn article by id.

## 9. Acceptance checks (self-verified before finishing)

- Build passes with the new manifest validators (fails loudly if any HRP session/block is missing a required field).
- Programme page for HRP lists 12 weeks, each normal week shows 6 sessions (5 core + 1 optional), Week 12 includes post-race reset/reflection.
- Every session opens; guided player runs with correct timers (spot-check the 24-min EMOM and any AMRAP/RFT blocks against the PDF).
- Dashboard shows current week + next session for an HRP user; PDF download works.
- BTB, SEM, ATHX pages still load and start sessions.
- No customer-facing string mentions migration, legacy, V2, schema, Lovable, ChatGPT, or test data.

## Technical notes

- No DB migrations, no RLS changes, no entitlement changes.
- PDF asset added via `lovable-assets` from `/mnt/user-uploads/`, referenced from the HRP manifest.
- Old `src/lib/anySession.ts` is replaced by `resolveSession` but kept as a thin shim during the change so existing imports keep compiling; removed once all call sites move over.
- Manifest is a single JSON file (`src/data/hrp.manifest.json`) with a TS wrapper that runs Zod-style validation at import time.
- Existing `useHrpProgress`, `useHrpProfile`, `hrpStore` continue to be the HRP state layer; only session id shape and manifest reader change.

```text
                         ┌───────────────────────────┐
                         │  programme registry        │
                         │  slug → manifest loader    │
                         └────┬───────────┬──────────┘
                              │           │
                    ┌─────────▼──┐   ┌────▼──────────┐
                    │ HRP (new)   │   │ BTB / SEM /   │
                    │ full 12wk   │   │ ATHX (kept)   │
                    └─────┬───────┘   └────┬──────────┘
                          │                │
                     resolveSession, logSchemas, progressMetrics
                          │
              ┌───────────┼────────────┬──────────────┐
              ▼           ▼            ▼              ▼
          Dashboard   Programme     Session       Guided player
          (logic fix) (weeks/6)     detail         + LogDrawer
```
