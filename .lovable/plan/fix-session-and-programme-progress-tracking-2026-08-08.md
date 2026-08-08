# Fix session and programme progress tracking

Confirmed: progress is not being tracked. Checks against the live database show:

- 7 programme enrolments exist, and **0 of them have a completion percentage or a current week** — every value is empty. That is why the library shows 0% and "Week —".
- 10 completed sessions are recorded, but **none store which week they belong to**.
- One session is recorded twice (7 rows, 6 unique sessions) because nothing stops a repeat creating a duplicate.
- ATHX 2026 sessions are never saved to the backend at all — the runner deliberately skips the save for ATHX, so ATHX progress only lives on the device.

Root cause: when a session is finished the app writes one "session completed" row and stops. Nothing recalculates the programme's percentage or current week, nothing creates an enrolment if the athlete never pressed "Start programme", and duplicates are not prevented.

## What will be built

**1. One place that records a finished session (new server function)**

A single authenticated `recordSessionCompletion` call replaces the current fire-and-forget insert. It will:

- verify the athlete owns the programme
- create the enrolment row if it is missing, so finishing a session always counts even if the athlete skipped the "Start programme" button
- record the completion with its week and day, without creating duplicates
- recalculate and store the completion percentage (unique completed core sessions ÷ total core sessions) and the current week on the enrolment

The runner passes the session id, week, duration and the programme's total core-session count (read from the manifest on the client), so the server never needs to load programme manifests.

**2. Record ATHX the same as every other programme**

Remove the ATHX exclusion in the workout runner and in the result logger, so ATHX 2026 completions and logged results are stored in the backend like Hybrid Race Plan, Basic Training Blueprint+ and S.E.M 2026. Local device state keeps working as it does today.

**3. Database migration**

- Clean up the one existing duplicate row.
- Add a unique index on (user, programme, session) so a repeat updates rather than duplicating.

**4. Backfill existing athletes**

A one-off data pass that, for every athlete with completed sessions:

- creates any missing enrolment
- sets the correct week on historic completions where it can be derived from the session id
- recalculates completion percentage and current week

So current customers (including you) immediately see real numbers instead of 0%.

**5. Dashboard reads**

The library's "Up next" card and programme cards already read the completion percentage and the completed-session list, so they start showing real progress once the writes are fixed. "Up next" will also fall back to the completed-session count when a percentage has not been stored yet.

## Technical notes

- New file `src/lib/progress.functions.ts` using `createServerFn` + `requireSupabaseAuth`; week/day derived from the `xxx-w{n}-s{n}` session id pattern (ATHX uses its own id format, handled by an explicit week argument).
- Edits: `src/routes/workout.$sessionId.tsx` (finish handler), `src/components/workout/LogDrawer.tsx` (add `athx-2026` to the mirrored slugs), `src/lib/nextSession.ts` (percentage fallback).
- Migration: dedupe + `CREATE UNIQUE INDEX` on `session_completions (user_id, product_id, session_id)`.
- Backfill is a data operation, run separately from the schema migration.