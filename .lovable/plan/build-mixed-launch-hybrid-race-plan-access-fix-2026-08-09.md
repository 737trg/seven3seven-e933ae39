# BUILD MIXED launch + Hybrid Race Plan access fix

## 1. Add MIXED as a full programme

Build it exactly like S.E.M 2027 was built — same card structure on the landing page and catalogue, same "view programme" detail page, same in-app runner.

**Public side**
- Public name: MIXED (collection BUILD), subtitle "12-Week Functional Fitness Programme", tagline "Strength. Skill. Conditioning."
- Update the existing catalogue card from "In development / 8 weeks" to live, 12 weeks, £19.99, keeping the identical card layout to the other four.
- Detail page at `/programmes/mixed` following the existing programme-page template (hero, what you'll do, best for, RX/Scaled explanation, buy button), plus unique title/description/canonical/OG metadata and sitemap + llms.txt entries.
- Add to cart, checkout and the homepage two-door sections so it sells at £19.99 alongside the others, and include it in Club membership unlocks.

**In-app side**
- Convert the supplied manifest into `src/data/mixed.manifest.json` (12 weeks, 60 core + 12 optional sessions) with a `src/lib/mixed/` manifest/progress/store layer mirroring the S.E.M 2027 one.
- Routes under `/my-programmes/mixed`: cover, today, programme index, week and session overview, session runner, progress, learn, calculator, profile — same shells and exit button as the other plans.
- The runner reuses the existing interactive engine: readiness check, block rail, timers, an RX/Scaled toggle per workout, logging fields driven by each block's `log` list, and completion writing to the shared progress tables so streaks, PBs and the dashboard pick it up.
- Athlete-facing education is rendered, not buried: foundation guides, entry gate, weekly structure, phases, RX/Scaled policy, equipment and substitutions, training reference, scaling library, safety, the 14 Learn modules, and the weekly lesson attached to each optional Sunday session. The app stays complete without the PDF.
- The PDF becomes the entitled download for one-off buyers only (Club members keep the no-PDF rule).

**Backend**
- Update the existing MIXED product row to 12 weeks and published, create its v1.0.0 programme version, upload the PDF to programme storage, and create the £19.99 one-off price.
- Grant jamesnichol9@gmail.com an owner entitlement so it shows in your account immediately.

## 2. Hybrid Race Plan access

Confirmed in the database: your Hybrid Race Plan entitlement is still active and not revoked, but it — and both other owners' — still points at the old programme version rather than the current v3.0.0 record. Session history was already remapped to the new IDs.

- First, sign in as your account in the preview and reproduce what "taken off him" actually looks like (missing from My Programmes, locked cover, or missing download) so the fix targets the real symptom rather than the version pointer alone.
- Repoint all three active Hybrid Race Plan entitlements to the current v3.0.0 version so ownership, downloads and the refreshed content line up.
- Run the same check across every other plan's owners so nobody else is left on a stale version pointer.

## Technical notes

- The manifest shape matches the S.E.M format (weeks → sessions → blocks with kind/rx/scaled/log), so `anySession.ts` only needs the new block kinds (skill, gymnastics, education) mapped.
- No schema changes expected; entitlement version repointing is a data update.
- Existing users, orders, history and unrelated programmes are untouched.