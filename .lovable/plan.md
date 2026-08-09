# Programme refresh + S.E.M. 2027 launch

Replace the content behind the three live programmes with the new manifests, add S.E.M. 2027 as a brand-new product, and let existing customers choose when to move across — without losing any logged data.

## 1. New content, side by side with the old

Each programme gets a new content version stored alongside the current one, not on top of it:

| Programme | Now | New |
|---|---|---|
| Basic Training Blueprint+ | 12 wks / 60 sessions | new manifest, 12 wks / 60 sessions |
| Hybrid Race Plan | current build | new manifest, 12 wks / 72 sessions |
| S.E.M. 2026 | 8 wks / 48 sessions | new manifest, 8 wks / 48 sessions |
| S.E.M. 2027 | — | new, 12 wks / 72 sessions |

Each athlete's enrolment records which content version they are on. Nothing that already exists is deleted or rewritten, so every completed session, workout log, PB, readiness entry and body metric stays exactly where it is.

## 2. The switch-over experience

When someone with an in-progress programme opens it, they see a one-time card:

- **Stay on my current plan** — everything continues unchanged.
- **Switch to the updated plan** — they move to the new content, starting at the equivalent week where the week numbering lines up, otherwise week 1. Their old history is kept and shown under "Earlier work" in Progress, and their overall totals (sessions completed, streak, PBs) still include it.

The choice is remembered per programme and can be changed later from the programme's Profile page. New customers always get the new content.

## 3. S.E.M. 2027 (new product)

- Public page at `/programmes/sem-2027` matching the existing programme-page design: title `S.E.M.` with `2027` shown as the season, subtitle, 12 weeks / 72 sessions, what's included, equipment/profile requirements, the independence disclaimer, and a purchase CTA.
- **£19.99 one-off** (PDF included) via the existing checkout, and **included free with the £14.99/mo Club** (no PDF, per the existing rule).
- Full in-app experience reusing the current runner: Today, Programme, Progress, Learn, Race Day, Calculator, Profile.
- S.E.M. 2026 and 2027 stay entirely separate products — separate purchases, sessions, progress and records.
- Added to the programmes catalogue, homepage chooser, sitemap and internal links.

## 4. Existing customers

- Club members automatically get S.E.M. 2027 (Club already unlocks everything).
- The legacy ATHX 2026 athlete keeps that programme untouched and is additionally granted S.E.M. 2027.
- Everyone else keeps exactly what they bought; S.E.M. 2027 is a separate purchase.
- Each of the four PDFs is uploaded as the downloadable guide for its programme, available to one-off owners only.

## 5. Naming rules applied throughout

No version numbers, revision strings or internal IDs shown anywhere customer-facing. Public names only: Basic Training Blueprint+, Hybrid Race Plan, S.E.M. 2026, S.E.M. 2027. No claims of endorsement by the British Army, ATHX, HYROX or The Hybrid Games; the supplied independence disclaimers are shown on each programme.

## Technical notes

- Manifests are used as-is from the supplied JSON (no OCR of the PDFs). Each is normalised into the existing manifest shape (`weeks[].sessions[].blocks[]` with `kind`, `timer`, `log`) and stored in `src/data/` plus mirrored into `programme_versions.manifest` with `version`, `pdf_path`, `is_current`.
- The new files already carry `kind`/`actionable`/`id` fields, so the runner's block-kind inference in `src/lib/anySession.ts` gets an explicit-`kind` fast path; timer strings (`rest_180`, `emom_*`, `amrap_*`) already parse.
- Session IDs: Basic Training keeps `btb-w{w}-s{s}`; the new Hybrid Race Plan and S.E.M. 2027 use the IDs supplied in their manifests, so old and new completions never collide.
- `programme_enrolments.state` gains a `content_version` key (no schema change needed); a resolver picks the manifest per user. Legacy manifests stay in the repo until no enrolment references them.
- DB work: insert the `sem-2027` product (compete, 12 weeks, £19.99, base_path `/my-programmes/sem-2027`), insert four `programme_versions` rows, correct Hybrid Race Plan's stored duration from 10 to 12 weeks, and grant the ATHX athlete a S.E.M. 2027 entitlement.
- Stripe: one new one-off price for S.E.M. 2027; the Club subscription is unchanged.
- Routes added: `_marketing.programmes.sem-2027.tsx` and the `my-programmes.sem-2027.*` set, mirroring the S.E.M. 2026 route group.

## Out of scope

No redesign of the dashboard, checkout, Club pricing or unrelated pages.