# Fix the double-logo in the hero

## The problem

Right now the wordmark appears twice within the same eyeline — once in the nav bar and again 700px below it, both left-aligned at the same x-position. Two identical marks stacked on the same axis reads as a mistake, not a brand statement.

## The fix

### 1. Move the hero wordmark to a centred brand moment
Take the wordmark out of the left-aligned copy stack. Place it centred horizontally, high in the hero (just under the nav, with generous clearance), sized around 300px on desktop and 200px on mobile. It becomes a standalone brand statement floating over the photograph, clearly separate from the headline block below.

The headline, subcopy and buttons stay exactly where they are — left-aligned at the bottom of the hero. The result is a classic editorial split: brand at the top centre, message and action at the bottom left.

### 2. Shrink the nav mark
Reduce the header logo to roughly 130px on mobile and 155px on desktop, and reduce the header height slightly so the bar feels tight and premium rather than heavy. At that size it reads as navigation furniture, not a competing brand statement.

### 3. Add breathing room and hierarchy
- Increase the vertical gap between the centred wordmark and the headline block so they never read as one unit.
- Slightly lower the opacity of the centred wordmark (around 90%) so the photograph stays the hero and the mark sits into the image rather than on top of it.
- Fade the wordmark and headline in on load with a short stagger so the brand lands first, then the message.

### 4. Nav bar on scroll
Keep the hairline border, but let the bar start fully transparent over the hero and gain its dark backdrop only once the user scrolls past the hero. That removes the boxed-in look at the top of the page while keeping the nav legible everywhere else.

## Alternative if you prefer
If you'd rather not have any wordmark inside the hero at all, the other premium route is: no hero logo, a slightly larger nav mark, and the headline carrying the page. Say the word and I'll do that instead.

## Out of scope
Hero photo, headline copy, pricing, buttons, and every other section of the page stay as they are.

## Technical notes
Changes limited to `src/routes/_marketing.index.tsx` (hero composition) and `src/components/marketing/MarketingHeader.tsx` (logo width, header height, scroll-state background). No backend or content changes.
