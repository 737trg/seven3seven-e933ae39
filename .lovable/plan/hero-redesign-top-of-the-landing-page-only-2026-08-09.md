# Hero redesign — top of the landing page only

The hero currently floats the wordmark alone at the very top of the image, far from the headline block pinned to the bottom. That leaves a dead zone in the middle and makes the logo look stranded. This fixes proportion and hierarchy for the first screen only. Nothing below the hero changes.

## New layout

One centred column, vertically balanced in the frame:

```text
[ nav: small wordmark | links | sign in / cart ]
--------------------------------------------------
                (image, darker centre)

              SEVEN3SEVEN wordmark
        HYBRID FITNESS · PERFORMANCE PROGRAMMES

              Train like it matters.

     Structured 8-12 week programmes for military
     preparation, competition and hybrid racing.

     [ Join the Club - £14.99/mo ] [ Buy a programme ]

   Cancel anytime · Lifetime access · Secure checkout
--------------------------------------------------
```

- Wordmark, eyebrow, headline, subcopy and buttons form a single centred stack, so the logo reads as the top of the message rather than a detached floating mark.
- The stack sits centred in the hero with balanced space above and below, instead of pinned to the bottom.
- Sizes step down in a clear ratio: wordmark, then headline, then body — the wordmark stays smaller than the headline so it doesn't fight it.
- Buttons centre under the copy and stack full-width on mobile.
- Hero height tightened so the whole block is visible without scrolling on laptop and phone.
- Overlay gradient adjusted to darken the centre band so the centred text stays legible over the athlete.
- Nav wordmark stays as small navigation furniture; no second large logo competing with it.

## Technical notes

- Only the hero `<section>` in `src/routes/_marketing.index.tsx` is edited, plus its overlay gradient values.
- Remove the absolutely positioned top wordmark block; move the wordmark into the content stack.
- Switch the section from `flex items-end` to centred content with responsive vertical padding.
- Keep existing tokens and the staggered `hero-rise` animation timing.
- No copy, routing, SEO or component changes.