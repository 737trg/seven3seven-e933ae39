# SEVEN3SEVEN — Premium App Experience Rebuild

Turn the members' area from four bolted-together copies into one intuitive, mobile-first training app. Same visual language as the SEVEN3SEVEN logo (bone on obsidian, signal accent, condensed display type) — no rebrand, just a much better product.

## What's wrong today (audit)

**Navigation & structure**
- Four duplicated programme shells (ATHX, Basic Training Blueprint+, S.E.M 2026, Hybrid Race Plan) with near-identical Today / Programme / Progress / Learn / Profile pages. Every fix has to be made four times, and they have drifted (the HRP cover was showing S.E.M copy).
- The library page opens on a large hero image and four stat tiles before anything actionable. There is no "here is your session, press this" moment.
- No way to choose which programme is your primary/highlighted plan. Owning two plans gives two equal cards and a guessy "Quick actions" box.
- The "Upcoming" section is hardcoded empty. The progress ring averages across all programmes, so buying a second plan makes your progress look like it dropped.
- Programme pages lack a consistent back/exit affordance on every screen.

**Session flow**
- Today picks a session by matching today's weekday name; train Tuesday's session on Wednesday and it silently shows the wrong thing. No way to swap, move or skip a session.
- Two identical buttons on Today ("Start session" and "View detail") both go to the same overview page — the actual runner is a third click.
- Readiness is set but only prints advice text; it does not change the session.
- No streaks, no PBs, no browsable session history, no rest-timer alert.
- Completion state lives partly in local storage and partly in the database, so progress can differ between phone and laptop.

## The build

### Phase 1 — Session runner (the thing used every day)

1. **Three taps to training.** Library → programme → big "Start today's session". The overview becomes an expandable panel on the runner's first screen, not a separate mandatory stop.
2. **Runner redesign, mobile-first.** Sticky top bar (session name, block X of Y, elapsed, exit), full-height block card, sticky bottom action bar with the primary button always thumb-reachable. Swipe or arrow between blocks.
3. **Rest timer with alerts.** Auto-starts after a logged set, large countdown, vibrate plus sound on finish (silent-safe fallback), +15s and skip controls.
4. **Logging that matches the work.** Strength blocks get a per-set weight × reps × RPE grid with "repeat last set" and last-time values inline. Conditioning gets time/distance/rounds. Recovery gets done plus a note. No more generic RPE-only drawer where a barbell lift should be.
5. **Reliable resume.** One source of truth per user + programme + session, saved to the database and mirrored locally, so phone and laptop agree. Correct block counters and a correct restart-vs-review prompt.
6. **Finish screen.** Duration, blocks completed, sets logged, any PBs hit, streak update, notes field.

### Phase 2 — Hub, programme selection and unification

7. **One programme engine.** Replace the four shells with a single shell driven by programme manifest data (nav items, pillars, tools). ATHX, BTB, S.E.M and HRP become data, not code. Existing URLs keep working via redirects.
8. **Redesigned home.** Above the fold: greeting, streak, and a single "Today" card for your primary programme with a start button. Below: your other programmes, this week's schedule strip, recent activity. Hero image reduced to a thin banner.
9. **Choose your primary programme.** A "Set as primary" control on each programme; the primary drives the home Today card, and switching is one tap from a programme switcher in the header. Stored per user.
10. **Swap, move and skip sessions.** Each session in the week gets an actions menu: mark done, move to another day, swap with another session that week, or skip with a reason. The week view reflects your real schedule rather than the recommended weekday.
11. **Streaks.** Weekly consistency streak (sessions completed vs planned) plus a current-run counter, shown on home and the finish screen.
12. **Generic PB tracker in Profile.** A standard lift list (back squat, front squat, overhead squat, deadlift, bench press, strict press, power clean, snatch, pull-up, plus row/run benchmarks) with result history and best-ever highlighting. Not programme-specific; the runner offers to log a PB when a set beats your record.
13. **Onboarding.** First sign-in after purchase runs a short setup: name, units, start date, training days, current benchmarks. Removes the "logged on and didn't know what to do" moment.

## Technical notes

- New tables: `user_preferences` (primary programme, units, training days), `personal_records` (lift key, value, unit, achieved_at, source session), `session_schedule_overrides` (moved/swapped/skipped sessions per user + programme + week). All with RLS scoped to `auth.uid()` and explicit grants.
- Session completion and results continue to use `session_completions` and `workout_results`; local storage becomes a cache, not the source of truth.
- Programme content stays in the existing manifests (`hrp.manifest.json`, `sem8.manifest.json`, `btb.manifest.json`, `programme.ts`) — no content rewrites in this work.
- Design tokens stay as-is in `src/styles.css`; new components use existing semantic tokens only.
- Phase 1 ships and is verified before Phase 2 starts, so the runner improvement lands quickly.

## Out of scope

Marketing site redesign, programme content changes, calendar sync, push notifications, coach/admin tooling.