# Progress & Body — make the data actually mean something

Right now both tabs are lists of raw rows. A number with no context isn't insight. This turns them into a proper performance surface: categorised benchmarks, deltas, trends, and a desktop layout that earns the price.

## 1. A real movement catalogue

Today every logged lift is free text, so "Main set" sits next to a 5k. Introduce a curated catalogue that every PB entry maps to.

**Strength (load)** — Back squat, Front squat, Deadlift, Trap-bar deadlift, Bench press, Strict press, Push press, Overhead squat, Power clean, Clean & jerk, Snatch, Weighted pull-up, Hip thrust.

**Bodyweight (reps)** — Strict pull-ups, Press-ups (2 min), Sit-ups (2 min), Dips, Max plank hold.

**Run (time)** — 400 m, 800 m, 1 km, 1 mile, 1.5 mile, 2 km, 5 km, 10 km, Half marathon, Marathon.

**Machine (time)** — 500 m / 1 km / 2 km row, 500 m / 1 km ski, 1 km / 4 km bike erg.

Each entry carries: key, label, category, discipline, metric, default unit, direction (higher or lower is better). Logging a PB becomes a searchable picker over this list, with "custom movement" still allowed. Existing records keep working — unmatched keys fall into an "Other" group.

## 2. Progress tab rebuild

- **Headline strip** — total PBs, PBs this month, movements tracked, biggest recent improvement.
- **Two segmented sections: Strength and Cardio** (plus Other when present). No more one flat list.
- **Strength grid** — one card per movement: current best, estimated 1RM, date, delta vs. first entry, mini sparkline, and relative strength (× bodyweight, from the latest body metric).
- **Cardio grid** — one card per distance: best time as mm:ss, pace per km, delta vs. first, sparkline. Time entries normalise to seconds internally so PBs sort correctly.
- **Trend detail** — tapping a card opens a full trend view for that movement (chart, every entry, add-entry shortcut) instead of a dropdown buried in a panel.
- **Standards** — regrouped to match the new categories, shown as progress bars with "x kg to target" copy.
- Empty states suggest concrete first benchmarks ("Log your 5k and your back squat to unlock trends").

## 3. Body tab rebuild

- **Widget row** — starting weight, current weight, change (signed, colour-cued), 30-day trend arrow.
- **Weight chart** — line chart over 30 / 90 / 365 / all ranges with a 7-day rolling average so daily noise doesn't dominate.
- **Composition & recovery** — body-fat % and resting HR each get a compact chart with current value, change and range selector.
- **Log entry** — a single sheet with today prefilled (weight, body fat, RHR, note), unit-aware, upserting the day.
- **History** — collapsed beneath the charts, not the first thing you see.
- Insight line under the charts, e.g. "Down 1.8 kg over 8 weeks — steady rate."

## 4. Premium layout

- **Mobile** — one column with a consistent card rhythm, horizontally scrolling widget strip, sheet-based logging instead of cramped inline forms, thumb-reachable actions.
- **Desktop** — 12-column grid: charts get real width, strength and cardio sit side by side, sticky section headings, hover tooltips on chart points.
- Consistent card language across both tabs (hairlines, raised surfaces, tabular figures) using existing tokens only.

## Technical notes

- New `src/lib/movementCatalogue.ts`: catalogue plus helpers (categorise a `lift_key`, time formatting, pace maths, e1RM, direction-aware best).
- Charts: a small local SVG line chart extending the existing `Sparkline` (axis labels, range windowing, hover dot) — no new charting dependency.
- `usePersonalRecords` gains derived selectors (grouped by category, best per movement, deltas). Schema unchanged; time PBs normalise to seconds using the existing `unit` column.
- New components under `src/components/dashboard/`: `MetricStat`, `LineChart`, `MovementCard`, `StrengthSection`, `CardioSection`, `BodyOverview`, `LogPbSheet`, `LogBodySheet`. `ProgressTab.tsx` and `BodyTab.tsx` become thin composers.
- Club gating (`ClubLock`) stays exactly as-is; no pricing or access changes.
- No database migration required.