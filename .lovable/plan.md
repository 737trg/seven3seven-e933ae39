# My Programmes — mobile-first redesign

The library page is currently a desktop layout squeezed onto a phone: a huge crop of the hero photo eats the first screen, the stats grid wraps awkwardly into a 2x2 block, and everything the athlete actually needs (their next session) sits far below the fold. This reworks it as a mobile-first training dashboard.

## What changes

**1. Kill the giant hero image**
Replace the full-bleed photo with a compact header band: eyebrow ("James Nichol — Library"), "My programmes." headline, one-line subtitle. On mobile the photo is dropped entirely; on desktop it stays as a slim right-hand accent so the page keeps its brand feel without pushing content off screen.

**2. Next-session card first**
Directly under the header, a single primary card for the focus programme showing: programme name, current week, the next session title, a progress bar, and one full-width "Start session" button. This is the first thing a phone user sees and taps.

**3. Stats become a compact strip**
Four numbers (Active, Current week, Sessions, Day streak) become a horizontally scrollable / 4-across compact row with small labels instead of a wrapping 2x2 grid with oversized numerals.

**4. Programme list as tappable cards**
Replace the huge editorial type (text-6xl names, thin underline links) with self-contained cards: name, collection + duration, state chip, progress bar, and the whole card is tappable. The star (focus) button stays but as a small icon in the card corner. Groups (Active / Ready / Completed) become collapsible sections; empty groups are hidden on mobile rather than showing "No completed programmes yet" three times.

**5. Sidebar content moves below, in priority order**
On mobile the aside stacks after the programme list as: Consistency (streak), Personal records, Recent activity, Progress, Quick actions. Desktop keeps the existing two-column split unchanged.

**6. Mobile touch + layout hygiene**
- Reduce page padding on small screens (px-5), tighten vertical rhythm.
- All tap targets ≥ 44px.
- Apply the `grid-cols-[minmax(0,1fr)_auto]` + `min-w-0` + `truncate` pattern to every header row so long programme names never clip.
- Clamp headline sizes so "My programmes." fits one line on a 393px viewport.

## Technical notes

- All work is in `src/routes/_marketing.my-programmes.tsx` plus small presentational extractions into `src/components/dashboard/` (`NextSessionCard.tsx`, `ProgrammeListCard.tsx`, `StatRow.tsx`).
- Next-session data comes from the existing `useCustomerDashboard` / manifest helpers already used by the per-programme `today` routes; no new queries or schema changes.
- Existing focus-programme (`usePreferences.primary_product_id`), streak, PR and schedule logic is reused as-is.
- Design tokens only — no new colours; existing signal/bone/border tokens.
