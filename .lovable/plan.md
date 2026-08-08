# SEVEN3SEVEN — product deep dive and what to build next

An honest read of where the app is, who it serves, and how it stops being "a shop that sells PDFs".

## Where it stands today

**What's genuinely good:** the training engine. Structured manifests for three programmes, a session runner with per-set logging, rest timers with audio and haptic cues, block rail, streaks, PB panel, schedule overrides, progress synced to the backend. That is more than most £20 PDF sellers ship.

**What's missing is not features — it's a reason to come back after week 12.** One-off £20, lifetime access, and no recurring reason to open the app once a programme ends. Right now the ceiling really is "buy plan, follow plan, stop".

**Audience read:** the three programmes speak to three different people (military entry, hybrid competitor, general strong-and-healthy) but the site speaks mainly to the first two. The "just want to be strong and healthy" buyer has no obvious entry point — the BUILD collection is the weakest-defined.

**Colour scheme:** obsidian / bone / signal red is right for the brand — military-adjacent, serious, not another purple SaaS gradient. It is not the problem. The one risk is that everything is equally dark and equally red, so nothing reads as *progress* or *achievement*. Keep the palette, add two semantic-only tokens: an earned/success state and a muted planned-vs-done pair, so progress, PBs and streaks feel rewarding rather than uniform.

## The strategic answer

Three ways to raise the ceiling, in order of impact per effort:

1. **Make the app the coach, not the document.** Readiness input actually changes the session; loads auto-suggest from logged history and PBs; deload and regression prompts when sessions are missed. Biggest differentiator, needs no new API.
2. **Give life after the programme.** A permanent engine layer that exists whether or not you're mid-programme: benchmark tests, PB history with charts, standards tables (Army entry standards, race splits), and a next-block recommendation. Every owner then has a reason to open the app monthly, forever.
3. **Add social proof and accountability.** Session share cards, benchmark leaderboards, weekly recap email. Cheap to build, drives word of mouth, turns £20 buyers into referrers.

## Phase 1 — adaptive coaching

- **Readiness actually adapts.** Sleep, soreness, stress and energy are already stored; use them to scale suggested load and volume for that session, with a one-line explanation of why.
- **Load suggestions from history.** Each strength exercise shows last-time sets and a suggested working load derived from PB or previous session, one tap to accept.
- **Auto-PB detection.** When a logged set beats a stored record, offer to save it — no manual entry.
- **Missed-session logic.** If a week is missed, offer shift-the-plan or compress instead of leaving stale weeks behind.

## Phase 2 — the layer that outlives the programme

- **Benchmarks and standards.** A fixed test set (2 km run, mid-thigh pull, key 1RMs, race station splits) with retest reminders and comparison against published entry standards.
- **PB history with trend charts** rather than a flat list.
- **Body metrics** (weight, optional photos), private, plotted alongside performance.
- **Completion leads somewhere.** Finish a programme and the app proposes what to run next, with an owner discount.

## Phase 3 — reach and retention

- **Share cards** generated from a finished session, dark and branded, no external service needed.
- **Weekly recap email** — sessions done, PBs, streak, next week's plan.
- **Opt-in benchmark leaderboards** per programme.

## APIs worth adding (and ones to skip)

Worth it:
- **Apple Health / Google Fit import** so runs and heart rate auto-complete cardio sessions. Highest user value by far.
- **Strava** — read activities to auto-match run and row sessions, post completed sessions back. Also a free marketing channel.
- **Transactional email** for weekly recaps and re-engagement.

Later, optional: a self-hosted exercise demo clip library (better than a third-party API), weather for outdoor run sessions.

Skip: wearable-specific SDKs, nutrition APIs, anything needing native app distribution before there's demand.

## Business model note

Lifetime £20 caps revenue at one payment per programme. Two options that fit the brand:
- **All-access bundle** at a higher one-off price.
- **Optional low-cost membership** for the engine layer (adaptivity, benchmarks, recaps) while every purchased programme stays lifetime-free as promised.

Nothing already sold moves behind a paywall.

## Technical notes

- Phase 1 is client plus server-function work over existing `workout_results`, `personal_records` and `readiness_logs` — no schema change.
- Phase 2 needs new tables: `benchmarks`, `benchmark_results`, `body_metrics`, each RLS-scoped to `auth.uid()` with explicit grants.
- Health/Strava import needs an OAuth connector plus an `external_activities` table and a matcher linking an activity to a planned session.
- Colour work is two new semantic tokens in `src/styles.css` only — no hardcoded colours in components, no palette change.

## What I'd do first

Phase 1. It makes the app feel like a coach within a single training week and adds no new backend surface.