# Fix the logo everywhere — visible, transparent, on-brand

## What's actually wrong

The logo file itself is the bug, not the layout.

The uploaded artwork is a 1280x720 canvas, but the wordmark only occupies a strip of roughly 1120x156 in the middle — everything else is empty space. Every place in the app sizes the logo by height (header 26px, footer 22px, in-app shells 12-24px). Because ~78% of that height is empty padding, a "26px logo" renders a wordmark about 6px tall. That is exactly what the header screenshot shows: a small dark square with an unreadable smudge in it.

The current logo asset also has a black box baked around it, which is why it reads as a square patch rather than sitting cleanly on the page.

## The fix

### 1. Rebuild the logo asset
- Crop the uploaded artwork tight to the wordmark (remove all empty padding).
- Keep it fully transparent — no black box — so it sits on any background.
- Upload as the single brand asset and repoint every usage at it. All logo rendering already goes through one shared component, so this lands everywhere at once.

### 2. Size the logo by width, not height
Change the shared logo component so callers ask for a rendered width (named sizes: sm / md / lg / xl). A wordmark is a wide, short shape — sizing by height will always be fragile.

New sizes:
- Marketing header: ~150px wide on mobile, ~190px on desktop
- In-app shells and mobile header: ~120px
- Footer brand block: ~170px

### 3. Make the nav bar exist
The header has no bottom edge and a semi-transparent background, so over a dark hero it disappears. Add a hairline bottom border and a stronger backdrop so the bar reads as a bar on desktop and mobile, and raise the mobile header height so the larger logo breathes.

### 4. Put the logo on the landing page
Add the wordmark into the hero above the eyebrow line, sized large (roughly 260-380px wide, scaling down on mobile), so a first-time visitor immediately knows whose site they're on. Hero photo and copy stay as they are.

### 5. Consistency pass
Check every remaining place the mark appears — footer closing band, programme shells (Basic Training Blueprint+, S.E.M 2026, Hybrid Race Plan, ATHX), sidebar, mobile header — and confirm each renders the new transparent mark at a legible size. Verify at 320px, 390px and desktop widths.

## Out of scope
- PWA/home-screen icons and the favicon (those need the solid background and are already correct).
- Email templates (they use a text wordmark, which is right for email).
- Any content or layout changes beyond the header/hero logo placement.

## Technical notes
Files touched: `src/components/marketing/Seven3SevenLogo.tsx` (width-based API), `src/components/shell/Wordmark.tsx`, `src/components/marketing/MarketingHeader.tsx`, `src/components/marketing/MarketingFooter.tsx`, `src/routes/_marketing.index.tsx`, and the four programme shells. A new transparent asset pointer replaces `src/assets/seven3seven-logo-v2.png.asset.json`. No backend, checkout or data changes.