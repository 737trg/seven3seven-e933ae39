# Mobile-first polish + premium uplift

Goal: every page reads and behaves like a premium product on a phone first, with desktop held to the same standard. The brand system stays — dark editorial, obsidian/bone/signal red, Space Grotesk + Inter. What changes is discipline: typography scale, spacing rhythm, tap targets, motion, and removal of clipped or overflowing text like the benefits strip in your screenshot.

## Phase 1 — Fix what is broken on mobile

- Homepage benefits strip: the four benefit lines use a `truncate` class, which is exactly why they read "STRUCTURED 8–12 WEE…". Replace with a two-up grid that wraps to full lines at phone width, drops the ellipsis, and keeps the tick aligned to the first line.
- Homepage hero: cap hero height on small screens, tighten the headline scale so the CTAs are never pushed off-screen, and make both buttons full-width, minimum 48px tall, evenly stacked.
- Audit every remaining `truncate` (12 files — mostly the programme Today/Programme pages and the dashboard cards). Keep it only where a single line is genuinely required, such as a programme name in a card header, and always paired with `min-w-0`. Remove it everywhere it hides real content.
- Sweep every public and member route for horizontal overflow at 390px and 320px, fixing with `min-w-0`, `break-words`, and the two-column grid pattern already used on the dashboard.
- Tap targets: every icon-only control (focus star, header icons, log drawer, timer buttons) raised to a 44×44 minimum.
- Use dynamic viewport height in the workout runner and programme shells so the iOS Safari toolbar no longer clips the sticky footer controls.
- Add safe-area padding to sticky headers, footers and the bottom nav so nothing sits under the iPhone home indicator.

## Phase 2 — One typographic and spacing system

Heading sizes are currently hand-tuned per page with ad-hoc `clamp()` values — the About page alone has around a dozen different ones. That drift is the main reason the site reads generic rather than designed.

- Define a fixed display scale in `src/styles.css` as utilities: `display-xl`, `display-lg`, `display-md`, `display-sm`, plus `lede` and `body-sm`, each with its own clamp, line-height and letter-spacing.
- Define section rhythm utilities so every page shares the same gutters (20px phone / 40px tablet / 48px desktop) and the same vertical band spacing.
- Apply across all marketing and member pages, replacing the per-page clamps. The look stays; it becomes consistent and deliberate instead of drifting page to page.

## Phase 3 — Premium detail

- Motion, restrained and consistent: uniform scroll reveal, press states on cards and buttons, smooth route transitions, and full `prefers-reduced-motion` support.
- Depth: subtle elevation and hairline tokens instead of the same flat border everywhere; signal red used as a precise accent rather than a full-bleed block on mobile.
- States: real loading skeletons in place of the "—" placeholders on the dashboard stat row and programme cards, plus considered empty states that always offer a next action.
- Workout runner, the highest-value screen: larger set and rep type, thumb-reachable primary action, clearer block progress, haptic-backed timer states.
- Images: correct aspect-ratio wrappers so nothing shifts on load, lazy loading below the fold, and capped hero heights on phones.
- Accessibility: alt text, one H1 per page, visible focus rings tuned for the dark theme, and a contrast check on muted text over raised surfaces.

## Verification

Each phase is checked in a headless browser at 390×844, at 320px, and on desktop — page by page, with screenshots: the public pages, the dashboard, each of the four programmes, and a full session run through the workout runner.

## Technical notes

- New scale and spacing values land as Tailwind v4 `@utility` and `@theme` tokens in `src/styles.css`; no component hardcodes a colour or font size.
- Presentation only — no changes to data, entitlements, progress tracking or checkout logic.