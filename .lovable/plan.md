# SEVEN3SEVEN — landing page audit and rebuild

## What I found

I inspected the live site (home, /programmes, /apparel, header, footer, product pages) and the underlying content data.

**Working well**
- The visual language itself is strong: dark editorial palette, condensed display type, numbered sections, disciplined spacing. It is not generic.
- Product pages (Basic Training Blueprint+, S.E.M 2026) are genuinely good — price, what you get, what you'll do, best for, Stripe checkout.
- The app screenshots on the home page are the most persuasive asset on the site, and they are buried halfway down.

**Not working**
1. **The landing page never sells.** Above the fold there is a full-bleed image with the wordmark baked in, then a large empty band, then "TRAIN FOR WHAT'S NEXT." and one ghost link. No offer, no price, no product, no proof, no reason to act. A visitor cannot tell what is for sale in the first screen.
2. **The hero image is doing the logo's job.** The wordmark sits inside the photo, so it can't scale or be edited, and it pushes real content roughly 900px down the page.
3. **Contradictory status messaging.** The home page and footer say "First programmes — in development" and the bag icon is disabled with "No products available yet" — while three programmes are live and buying works. This actively suppresses sales.
4. **No prices before the product page.** £19.99 is a strong offer and it is invisible until two clicks deep.
5. **No proof layer.** No testimonials, no founder credibility above the fold, no "who this is for", no FAQ, no refund reassurance on the landing page.
6. **No self-selection.** Three programmes for three very different people (military prep / competition / hybrid racing), with no "pick your path" chooser.
7. **/apparel is over-built.** A full-bleed hero photo plus four sections of copy for a product that does not exist. It should be one restrained "coming soon" statement.
8. **Repetition.** The same hero photo is reused three times on the home page (hero, apparel teaser, founder band), which reads as thin asset coverage.

## The plan

### 1. Rebuild the home page around the sale
New section order, same brand language, new intent:

1. **Hero that fits one screen.** Photo as background, not a stacked banner. Live text over it: eyebrow "Hybrid fitness · performance programmes", H1 along the lines of **"Prepare for what you're training for."**, one line of subcopy, a primary button **"Buy your programme — from £19.99"** and a secondary **"Find your programme"**. Trust strip beneath: structured 8–12 week plan · interactive app · keep the PDF · secure Stripe checkout.
2. **Programme chooser.** Three routes stated as outcomes — "Preparing for military selection", "Competing this season", "Racing hybrid" — mapping to Basic Training Blueprint+, S.E.M 2026 and Hybrid Race Plan, each with price, duration, status and a direct buy link.
3. **What you get.** Four concrete deliverables with the app screenshots doing the work: guided sessions, live timers, logged performance, the PDF you keep.
4. **Proof band.** Founder credibility and, if available, athlete results and testimonials. Left as a placeholder until you supply real quotes — nothing invented.
5. **Objection handling.** Short FAQ (Do I need a gym? What if I've never followed a plan? Do I keep it? Refunds?) plus the refund line.
6. **Closing CTA.** Price, reassurance, one button.

Removed from the home page: the apparel teaser band, the duplicated hero photo uses, and the abstract "Why SEVEN3SEVEN" list (folded into the value section).

### 2. Fix the credibility-killers
- Delete "First programmes — in development" from the home page and footer.
- Enable the bag icon and wire it to /cart with an item count.
- Show live prices on programme cards everywhere (home and /programmes).

### 3. Strip /apparel back
A single full-height centred statement: **APPAREL — DROP 01. COMING SOON.** with an optional notify line. No hero photo, no campaign copy, no tiles. SEO title and description stay.

### 4. Tighten /programmes
Lead with a compact, shoppable list showing price, duration and status per programme instead of an oversized hero image.

### 5. Craft pass — this is what removes the "AI-built" feel
- Replace the baked-in-wordmark hero image with a clean photo plus live type.
- Break the uniform rhythm: right now every section uses the same padding and the same two-column split. Alternate density — a tight data strip, a full-bleed image moment, a quiet band.
- Restrained motion: staggered scroll reveals, real hover states on cards, and the signal red reserved strictly for CTAs.
- Mobile: hero text sized to one screen, full-width thumb-reachable buttons, no oversized images.

## What I need from you
- Any real testimonials, athlete results or founder credentials I can use (I will not invent any).
- Two or three more photos so the same image isn't reused across sections.
- Confirm the headline direction: "Prepare for what you're training for" vs "Buy your programme. Start Monday."

## Technical notes
Changes are confined to `src/routes/_marketing.index.tsx`, `_marketing.apparel.tsx`, `_marketing.programmes.index.tsx`, `MarketingHeader.tsx`, `MarketingFooter.tsx`, `src/data/publicProgrammes.ts` (add price/duration display fields), and small additions to `src/styles.css` for new tokens and animation utilities. No changes to the training app, checkout logic, entitlements or the database.