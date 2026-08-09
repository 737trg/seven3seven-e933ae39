# Fix the sideways slide on the dashboard tabs

## What's actually wrong

Nothing is "slightly oversized" by accident — a few widgets have hard minimum widths that are wider than the space a phone gives them. When a grid item refuses to shrink, the grid grows past the screen and the whole page becomes wider than the phone. That is the sideways slide, and it's why the fourth stat (STREAK) and the right edge of the Up Next card look chopped off.

Confirmed causes:

1. **Stat widgets have a 152px minimum.** The Progress, Body and Performance panels lay these out two-per-row on mobile. Two of them plus the gap needs about 316px, but a phone leaves roughly 303px (iPhone SE/mini) to 321px (iPhone 14/15) after page padding — so on most phones that row pushes past the screen and drags the whole page with it.
2. **The Fuel macro rings are a fixed-width row.** Calories (104px) plus three 84px rings plus gaps is about 404px of content in a roughly 340px space, inside a horizontally scrolling strip. That's the slide you feel on the Fuel widget.
3. **The overflow is currently hidden, not fixed.** A global rule clips horizontal overflow on the page, so instead of a clean layout you get content silently cut at the right edge — exactly what your screenshot shows.

## The fix

**Stat widgets**
- Remove the fixed minimum width; let them shrink to their column and truncate long values instead of forcing the grid wider.
- Keep the two-up mobile layout, with the big number scaling down slightly on very narrow screens so nothing wraps awkwardly.

**Fuel macro rings**
- Replace the fixed-width scrolling strip with a 2x2 grid on mobile (four across from tablet up), with ring size derived from available width rather than fixed pixels, so all four are visible without sliding.

**Everywhere else**
- Sweep the remaining dashboard panels, sheets and the workout runner for the same pattern: fixed pixel widths, unshrinkable flex/grid children, and long unbroken text (session names, food names, movement names) get shrink-safe containers and truncation so they can never widen the page.

**Verification**
- Measure the rendered pages at 320px, 375px, 390px and 430px across all five tabs (Train, Progress, Body, Fuel, Club) plus the workout runner, and confirm page width equals screen width with zero horizontally overflowing elements before calling it done.
- Keep the global clip afterwards only as a safety net, not as the fix.

## Technical notes

- `src/components/dashboard/MetricStat.tsx`: drop `min-w-[9.5rem]`, add `min-w-0` plus truncation.
- `src/components/dashboard/tabs/ProgressTab.tsx`, `BodyOverviewPanel.tsx`, `PerformancePanel.tsx`: keep `grid-cols-2`, ensure tracks resolve to `minmax(0,1fr)`.
- `src/components/dashboard/tabs/FuelTab.tsx` + `nutrition/MacroRing.tsx`: `grid grid-cols-2 sm:grid-cols-4`, responsive ring size instead of fixed 104/84px.
- Sweep for fixed widths and missing `min-w-0` across `src/components/dashboard/**`, `src/components/shell/**`, and `src/routes/workout.$sessionId.tsx`.
- Measurement pass via headless browser at the four widths, asserting `documentElement.scrollWidth === clientWidth` and no element whose right edge exceeds the viewport.

No visual redesign — same components, same styling, just made to fit.