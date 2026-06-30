
# 737 TRG — ATHX 2026 Hybrid Performance App

## 1. Product summary

A premium, mobile-first training web app for the 7-week ATHX 2026 hybrid programme + race week, built for Nico (Men's Pairs, ATHX Pro working assumption, race 23/08/2026). The app turns the supplied PDF into a usable, in-gym tool: dark editorial UI, one obvious "today's work" view, focused live workout mode with the right timer for each block (EMOM / AMRAP / RFT / strength rest), and clean logging of strength loads, conditioning scores and reflections. Version one is front-end only with `localStorage` persistence — no auth, no cloud, no payments — structured so cloud can be added later without redesigning the UI.

## 2. What I extracted from the PDF (source-of-truth confirmation)

- Athlete profile: Nico, Men's Pairs ATHX Pro (working assumption — uses 22.5 kg DBs, 70 kg sandbag, 30" box, 1 km run/row swap). 5K 20:51, 10K 46:00, SP 80, BS 165, DL 200, C&J 117, Sn 80, DB 22.5.
- Competition demands table: Strength 20 min (1RM SP + 3RM BS + 5RM DL, pair total), Endurance 22 min (run/row 1 km swaps), MetCon-X 25 min cap (Ski → DB GTOH → sandbag → box jumps → lunges → burpee broad jumps → Ski).
- Weekly rhythm: Mon press, Tue endurance, Wed mixed conditioning, Thu squat, Fri Oly + Z2, Sat deadlift + ATHX work, Sun rest.
- Four session rules, effort guide, "when to change a session" matrix, and load-guide (50–95% of 1RM rounded to 2.5 kg).
- All 7 build weeks (Week 1 Foundation → Week 7 Sharpen) plus Race Week, with daily sessions, purposes, set/rep/load/distance prescriptions, coach notes and per-block timing windows. Each week has a phase label, training-load label, key checkpoint and coach notes per session.
- Race-day plan: warm-up priorities, strength attempt planner (SP 1RM / BS 3RM / DL 5RM, Attempts 1–3 with decision rule), endurance strategy, MetCon partner split planner (Ski cal, GTOH reps, sandbag order, box jump-overs, lunges, burpee broad jumps, final Ski cal), equipment/food/hydration notes, race schedule, final reminders.
- Glossary (AMRAP, EMOM, RPE, Zone 2, threshold, deload, taper, primer, top set, back-off, GTOH, box jump over, burpee broad jump, DB/SB, Erg, etc.).
- Movement-standard cheat sheet + rules (no straps/wraps/supportive suits).
- Worksheets: weekly completion tracker, partner split planner, sources/safety notes.

I'll re-read each week's full session tables when writing the data file so prescriptions are 1:1 with the PDF.

## 3. Sitemap

```text
/                       Landing (public)
/today                  Today dashboard (default after entering app)
/programme              Programme — Timeline + Week toggle
/programme/w/$week      Week detail
/programme/s/$sessionId Session detail
/workout/$sessionId     Live workout mode (focused, no nav)
/workout/$sessionId/done Completion screen
/progress               Progress dashboard
/learn                  Glossary + movement standards + comp rules (tabs)
/race                   Race-day control centre
/calculator             Load + RPE calculator
/profile                Profile + settings
```

Mobile: bottom nav (Today, Programme, Progress, Learn, Profile). Desktop: minimal left sidebar with persistent `737 TRG` wordmark; Race / Calculator surfaced in Profile + as inline links from Today and Programme.

## 4. Reusable component inventory

- Shell: `AppShell`, `Sidebar`, `BottomNav`, `Wordmark`, `Header`, `Container`, `SectionDivider`.
- Typography & primitives: `Eyebrow`, `DisplayNumber` (tabular), `MetaRow`, `KeyValue`, `Tag`, `CategoryLabel`, `RedAccent`.
- Programme: `WeekStrip`, `WeekCard`, `PhaseBadge`, `LoadBadge`, `DayCard`, `SessionMetaBar`, `CompletionRing`, `ProgressBar`.
- Session: `BlockHeader`, `BlockCard` (variants: warmup / mainLift / assistance / conditioning / cooldown / log), `ExerciseRow`, `PrescribedSet`, `CompletedSetRow`, `CoachNote`, `Accordion` (How hard / What to record / Terms / Standards / Adjustments), `StickyStartBar`.
- Workout mode: `WorkoutHUD`, `TimerDisplay`, `EmomTimer`, `AmrapTimer`, `RftStopwatch`, `RestTimer`, `IntervalTimer`, `StrengthSetLogger`, `RpeSelector`, `RoundCounter`, `BlockStepper`, `PauseSheet`, `EndSessionConfirm`.
- Inputs: `NumberStepper` (kg / reps / cal / m), `SegmentedControl` (Ready/Average/Heavy, units), `WeightInput`, `TimeInput`, `Toggle`.
- Progress: `TrendLine`, `PRStat`, `WeeklyConsistencyGrid`, `BenchmarkCard`.
- Race: `AttemptPlanner`, `SplitPlannerRow`, `Checklist`, `ScheduleList`.
- Learn: `GlossaryItem`, `MovementStandardCard`, `SearchField`, `Tabs`.
- Utility: `Empty`, `ErrorState`, `Skeleton`, `Toast`, `Modal`, `BottomSheet`.

## 5. Programme data model

Typed TS in `src/data/` (programme content) + `src/types/` (shapes). Content lives in data files, never inline in components.

```text
Athlete { id, name, units, pbs:{press,squat,deadlift,cleanJerk,snatch,run5k,run10k}, workingDb }
Programme { id, name, category, raceDate, weeks: Week[], raceWeek: Week }
Week { number, label, phase, load, dateRange, objective, checkpoint, sessions: Session[] }
Session { id, weekNumber, day, title, category, duration, purpose, expectedEffort,
          blocks: SessionBlock[], coachNote?, adjustments? }
SessionBlock { id, order, kind: 'warmup'|'mainLift'|'assistance'|'conditioning'|'cooldown'|'log',
               title, timeWindow?, timer?: TimerSpec, items: Exercise[], note? }
TimerSpec = { type:'countdown'|'stopwatch'|'emom'|'amrap'|'intervals'|'rft'|'rest',
              durationSec?, minutes?, work?, rest?, rounds?, capSec? }
Exercise { id, name, prescribed: PrescribedSet[], standardRef?, glossaryRefs? }
PrescribedSet { sets?, reps?, loadKg?, loadPctOf1RM?, distanceM?, calories?, rpe?, restSec?, notes? }
CompletedSet { setIndex, reps, loadKg, rpe?, completed:boolean, note? }
ConditioningResult { rounds?, extraReps?, timeSec?, capped?, score? }
EnduranceResult { intervals: { distanceM?, timeSec?, splitPer500?, splitPerKm? }[] }
ReadinessEntry { date, level:'ready'|'average'|'heavy' }
SessionLog { sessionId, startedAt, endedAt, durationSec, readiness?, blocks: BlockLog[],
             sessionRpe?, reflection? }
BlockLog { blockId, completed:boolean, sets?: CompletedSet[], conditioning?: ConditioningResult,
           endurance?: EnduranceResult }
PersonalBest { lift, valueKg, date }
GlossaryTerm { term, short, example, appearsIn: sessionId[] }
MovementStandard { movement, validRep, commonMistake, cue, eventLoad? }
RaceStrategy { attempts:{ press:[1,2,3], squat3rm:[1,2,3], deadlift5rm:[1,2,3] } }
PartnerSplit { ski1Cal, gtohReps, sandbagOrder, boxJumpOverReps, lungeM, burpeeBroadM, ski2Cal, notes }
```

Persistence layer: `src/lib/store.ts` — a thin repo with `getAthlete`, `getProgramme`, `getLogs`, `saveLog`, `updateAthlete`, `getReadiness`, `setReadiness`, `getRaceStrategy`, `getPartnerSplit`. Backed by `localStorage` v1 with a `STORAGE_VERSION` key and JSON serializer; designed to be swapped for a Supabase repo later without touching UI.

## 6. Design system

- Tokens in `src/styles.css` via `@theme`, semantic-only — no hex in components.
- Palette: obsidian `#090909`, graphite `#151515`, raised `#1D1D1D`, bone `#F4F2ED`, muted `#9A9A9A`, divider `#2B2B2B`, signal red `#D82932`. Dark-first; light mode out of scope.
- Type: Space Grotesk (display, 500/700) + Inter (body, 400/500/600); tabular-nums utility for all numeric readouts. Oversized display numerals for weights/times/weeks.
- Spacing: 4px base, generous vertical rhythm. Containers max 1240px desktop, full-bleed mobile.
- Radii: 0, 4, 8 (cap at 10). Buttons: crisp rectangular; primary = bone bg / obsidian text; accent = signal-red filled; ghost = bone-outline.
- Dividers: 1px `#2B2B2B`, used instead of card chrome where possible.
- Iconography: lucide line icons at low weight; sparing use.
- Motion: 120–200ms ease-out; no flourish. No glass, no gradients, no neon.
- Imagery: editorial training photography, high-contrast, with subtle dark overlay + optional grain. Hero/full-bleed only at landing, week headers and race page.

## 7. Interactive workout functionality

- Live mode is a separate route with the app chrome hidden; only HUD, timer, current block, prev/next, pause, end.
- Timer engine: single `useWorkoutClock` hook using `performance.now()` + `setInterval`, drives EMOM minute boundaries, AMRAP countdown, RFT stopwatch, interval work/rest, and rest timers. Audio cue (short beep) + `navigator.vibrate` where supported; toggleable in profile.
- Strength logger: per-set prescribed row → tap to log actual load/reps + RPE; auto-start rest timer on log; never auto-mark prescribed as completed.
- EMOM: minute index, current movement, "complete" tick reveals rest remaining in the minute.
- AMRAP: round counter + extra-reps stepper, auto-saved.
- RFT: stopwatch + per-round checkboxes + cap awareness.
- State: `useWorkoutSession` keeps a snapshot in `localStorage` keyed by sessionId, restored on reload; "Resume session?" prompt on Today if an open session exists.
- Readiness check at session start surfaces the PDF's "when to change a session" guidance contextually; does not mutate the programme.

## 8. Mobile + desktop behaviour

- Mobile-first. Bottom nav (5 tabs, 56px), sticky `Start session` on session detail, single-column blocks, large touch targets (≥44px), swipe between blocks in live mode.
- Tablet: 2-column for programme week.
- Desktop: left sidebar nav (240px), wider timeline strip, 2-column dashboard (Today + Next/Recent), session detail = blocks list + sticky purpose/effort panel, progress charts side-by-side. Live mode stays focused-centre, max 720px width.
- Accessibility: semantic landmarks, focus-visible rings in signal-red, keyboard nav for steppers/timers, `aria-live` for timer transitions, prefers-reduced-motion respected.

## 9. Build phases

- Phase 1 — Foundations: design tokens, fonts, AppShell + sidebar/bottom-nav, routing (TanStack Start file routes), type definitions, programme data file scaffold (Weeks 1–7 + Race Week extracted from PDF), landing page, Today dashboard with mock+real data.
- Phase 2 — Programme + Learn: Programme timeline & week view, session detail with all block variants and accordions, Glossary + Movement standards + comp rules.
- Phase 3 — Live workout: timer engine, all timer variants, strength logger, conditioning logger, resume-on-reload, completion screen, localStorage repo.
- Phase 4 — Progress + tools: progress dashboard (charts), load calculator + RPE guide, race-day control centre (attempts + splits + checklist), profile/settings.
- Phase 5 — Polish: responsive pass, a11y review, empty/error/skeleton states, motion polish, copy pass, QA on iPhone + desktop viewports.

## 10. PDF content I could not confidently extract yet

The PDF table-of-contents, summary tables, week 1 overviews, all coach notes, race-day plan, glossary and movement standards parsed cleanly. The following sections were truncated in my first pass and I will fully re-extract before writing the data file in Phase 1 — content will come verbatim from the PDF, not inferred:

- Week 1 Wednesday/Friday/Saturday session tables (sets/reps/loads/distances).
- Weeks 2–7 full per-day block tables (each day's exact prescription and timing windows).
- Race-week Mon/Tue/Wed/Fri/Sat sessions.
- Sections 04 (full personal-load percentage table) and 09 (worksheet fields).
- Movement-standard cheat sheet full row content + competition rules list beyond the equipment ban.
- Section 10 source links.

If any cell in the PDF is ambiguous (e.g. "___" worksheet blanks, partner-split fields), I will render it as an editable user field rather than invent a value. No sessions will be invented or rewritten.

---

Ready to start Phase 1 on approval. Confirm: (a) plan looks right, (b) ATHX Pro working assumption is correct, (c) happy with the palette + Space Grotesk/Inter pairing before I lock the design system.
