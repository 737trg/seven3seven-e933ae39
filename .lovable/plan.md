# Nutrition: targets, tracking, hydration

A proper food + hydration layer, built to the same standard as Progress and Body. New **Fuel** tab in the dashboard.

## 1. Calorie & protein calculator

One short setup flow (age, sex, height, weight, activity level, goal: cut / maintain / gain).

- Energy: Mifflin-St Jeor BMR x activity multiplier (1.2 sedentary -> 1.9 very active), then goal adjust (-15% cut, +10% gain).
- Protein: 2.0 g/kg default, slider 1.6-2.2.
- Fat: 0.8 g/kg. Carbs: whatever calories remain.
- Weight auto-pulls from the latest body metric, so targets stay current; recalculate prompt when bodyweight moves more than 2 kg.
- Targets are editable — the calculator is a starting point, not a cage.

## 2. Daily log

- **Widget strip at the top**: Calories left, Protein left, Carbs, Fat, Water. Each is a ring/bar that fills as you log, turns green (`--earned`) on target, amber over.
- **Meal sections**: Breakfast, Lunch, Dinner, Snacks. Add food to any of them.
- **Adding food** — three routes:
  1. **Barcode scan** — camera scan in-browser, looked up against Open Food Facts (free, open, no API key, ~3M products incl. UK supermarkets). Choose portion, add.
  2. **Search** — text search of the same database, plus your own saved foods.
  3. **Quick add** — just calories and protein, for when you can't be bothered. This matters: apps die when logging is a chore.
- **Recents & favourites** — one tap to re-add anything eaten in the last 14 days.
- **Copy yesterday** / **save a meal** so repeat eaters log a day in seconds.
- Day switcher with a 7-day strip; swipe/arrow between days.

## 3. Hydration

Simple tile: target (35 ml per kg bodyweight, editable), tap buttons for 250 ml / 500 ml / custom, filling bar, streak of days on target.

## 4. Insight, not just numbers

Under the log: 7-day averages vs target (calories, protein), adherence percentage, and a plain-English line — "Protein averaging 132 g against a 160 g target — add a shake or a fourth protein feed." Ties into training: on Club accounts, a session-day vs rest-day calorie split.

## 5. Where it lives

- New **Fuel** tab in the dashboard nav (Train / Progress / Body / Fuel / Club) — five tabs still fits the mobile bar.
- Club-gated, same `ClubLock` treatment as Body. This is exactly the sort of thing that makes £14.99 stick.
- Desktop: two-column — widgets and log left, insight and hydration right.

## Technical notes

- **Database** (one migration, RLS scoped to `auth.uid()`, GRANTs included):
  - `nutrition_targets` — user, calories, protein/carb/fat g, water ml, method (calculated/manual), inputs used.
  - `food_entries` — user, date, meal, food name, brand, barcode, serving description, grams, calories and macros, source (barcode/search/quick/custom), plus a `saved` flag for favourites.
  - `hydration_logs` — user, date, ml.
- **Food data**: Open Food Facts REST API, called from a server function (`src/lib/nutrition.functions.ts`) so we cache and normalise per-100g values into per-serving; no key, no cost, attribution in the footer of the tab.
- **Barcode scan**: native `BarcodeDetector` where supported (Android Chrome), `@zxing/browser` fallback (iOS Safari). Camera permission requested only on tap; manual entry always available if it's denied or unsupported.
- New components under `src/components/dashboard/`: `MacroRing`, `NutritionWidgets`, `MealSection`, `FoodSearchSheet`, `BarcodeScanSheet`, `QuickAddSheet`, `HydrationCard`, `TargetsCalculatorSheet`, and `tabs/FuelTab.tsx`.
- `src/lib/nutrition.ts` for the maths (BMR, TDEE, macro split, hydration target) — pure functions, unit-aware via existing `units` preference.
- No new charting dependency; reuse `LineChart` for the 7-day calorie/protein trend.

## Build order

1. Migration + `useNutrition` hooks.
2. Calculator and targets.
3. Manual/quick-add log with widget strip and meals.
4. Open Food Facts search.
5. Barcode scanning.
6. Hydration + insights + desktop layout.
