# Hybrid Race Plan → Interactive V2.1

Rebuild the Hybrid Race Plan from the attached Markdown so every block is a first-class typed unit with its own logging modal and correct timer behaviour, then silently migrate existing HRP owners onto the new version.

## 1. New HRP manifest (Markdown as source of truth)

Author `src/lib/programmes/hybridRacePlan/manifest.ts` by hand-transcribing all 12 weeks × 6 sessions from the uploaded Markdown. Structure:

```text
Week -> Session -> Block[]  where Block is a discriminated union by `kind`
```

Block kinds (one per required type):

- `strength_block` — array of `exercises[]`, each with `sets[]` of `{ type: 'warmup'|'top'|'backoff'|'accessory', reps, rpe, prescribedRestSec }`. Multi-exercise "Main set" paragraphs are split into separate exercise cards (e.g. Back squat top, Back squat back-off, RDL).
- `run_interval_block` — `reps[]` of `{ distanceM? , durationSec?, targetPace?, recoverySec? }`.
- `aerobic_block` — `{ durationMin, target: 'Z2'|'easy', notes }`, no forced timer.
- `sled_block` — `{ mode: 'push'|'pull', reps, distanceM, prescribedLoad, restSec }`.
- `station_block` — `{ station: 'wallball'|'farmers'|'lunge'|'burpee_broad'|'db_snatch'|'ski'|'row'|'bike'|..., prescription }`. Logging fields adapt to station type.
- `emom_block` — `{ totalMinutes, minutes: [{ station, prescription }] }` with a true rolling 60-sec timer.
- `amrap_or_density_block` — `{ durationSec, movements[] }` with real countdown; omitted when block has no window.
- `hybrid_brick_block` — `{ rounds: [{ run: {distanceM}, station: {...} }] }`.
- `mobility_or_recovery_block` — `{ durationMin?, items[] }`, no forced timer.

Session shape carries the coaching context (`purpose`, `intensity`, `progressionStandard`, `coachNote`, `eventFocus`) — these render in the session detail page and expandable Coach Notes, **not** the active workout screen. `isOptional: true` on session 6 each week.

## 2. Logging schemas + drawer

Add `src/lib/programmes/logSchemas.ts` mapping each block kind to its logging field set (exactly as specified in the request). Extend `LogDrawer` to render per-kind forms:

- Strength: exercise picker → set rows (load, reps, RPE, missed, notes) + rest timer button.
- Run intervals: rep rows (distance/time, split, RPE) + auto fastest/slowest/drop-off.
- Sled: push/pull, distance, load, surface, footwear, split, RPE, stall toggle.
- Station: adaptive fields per station type.
- EMOM: per-minute completed y/n, reps/m/cal, load, rest remaining, lowest rest, limiter.
- AMRAP/density: rounds, extra reps, loads, no-reps, breaks, limiter.
- Brick: per-round run split, station split, transition, RPE + auto drop-off summary.
- Recovery: duration, completed, readiness after, soreness.

Save to a new `hrp_block_logs` table (see §4). Also keep a `legacyNotes` text field per block for imported/unmappable data.

## 3. Runner + timers

Update `src/routes/workout.$sessionId.tsx` and block card component so the active workout screen shows only: block number, title, short prescription, key cue, timer (conditional), single kind-specific log button ("Log strength", "Log run splits", etc.).

Timer rules:

- Remove default timer card. Never render "Countdown · 0:00".
- Countdown only when `durationSec > 0` (AMRAP/density, timed carries).
- EMOM: real rolling 60-sec repeat with current minute + station.
- Strength/interval/AMRAP rest buttons open a rest timer sheet.
- Aerobic/recovery/mobility: no timer.

Session detail page (`my-programmes.hybrid-race-plan.programme.s.$sessionId.tsx`) keeps the long-form coaching context in an expandable "Coach notes" panel.

## 4. Data migration (silent, preserves access + progress)

Single SQL migration:

1. Insert new `programme_versions` row for HRP with `version = 'HRP_INTERACTIVE_V2_1'`, mark as current.
2. Update every `programme_enrolments.programme_version_id` and every non-revoked `entitlements.programme_version_id` pointing at any prior HRP version to the new version id. No re-purchase.
3. Create `public.hrp_block_logs` (id, user_id, session_id, block_id, kind, payload jsonb, legacy_notes text, created_at, updated_at) with GRANTs (`authenticated`, `service_role`), RLS enabled, policies scoped to `auth.uid() = user_id`, and `update_updated_at_column` trigger.
4. Best-effort remap of existing `workout_results` rows into `hrp_block_logs` by `session_id`+`block_id` where the new block ids match; unmapped rows are copied verbatim into `legacy_notes`.
5. Core-completion view/logic excludes `isOptional` sessions from the denominator.

## 5. Progress + dashboard

Update `useCustomerDashboard` + HRP progress helpers so:

- Completion % = completed core sessions / 60 (12 weeks × 5 core).
- Optional recovery sessions show as bonus, never lower %.
- Current week + next core session surface on `my-programmes` dashboard, keeping the existing S3S dark visual direction (no card/colour changes).

## 6. Verification

- `bun run build` + `tsgo` clean.
- Playwright: sign in as test user, open HRP week 1 sessions 1–6, confirm no "Countdown · 0:00", strength/run/sled/station/EMOM/brick/recovery each open the correct log modal.
- SQL check: `jamesnichol9@gmail.com` enrolment now points at `HRP_INTERACTIVE_V2_1`, entitlement intact, prior `workout_results` still readable.

## Technical notes

- Old `src/lib/hrp/manifest.ts` + `src/data/hrp.manifest.json` are deleted; `anySession.ts` HRP branch swapped for the new engine adapter.
- `programmeEngine` registry gains an `HRP_INTERACTIVE_V2_1` entry so future programmes can reuse the same block kinds + log schemas.
- No visual redesign: dashboard, session detail, and runner keep current dark S3S typography, borders and red accent.

## Scope check

This is a large change (manifest transcription of 72 sessions, new log drawer variants, runner rewrite, DB migration). I'll implement it in that order and report back with a build + Playwright pass before you review.
