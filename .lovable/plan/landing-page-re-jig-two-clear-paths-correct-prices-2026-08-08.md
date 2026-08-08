# Landing page re-jig: two clear paths, correct prices

## The marketer's read

Right now the homepage sells one thing (buy a programme) and buries the Club on a
separate pricing page. That wastes the strongest asset you have: a £14.99/month
recurring product that most visitors will never scroll far enough to discover.

A visitor lands with one of two mindsets:

1. "I've got a specific event/goal" → wants a programme, wants the PDF, wants to own it.
2. "I want to get fit and stay on it" → wants the app, the coaching, the leaderboard, the community.

The page should force that choice above the fold instead of hoping they find it.
Everything else on the page is support for whichever door they walked through.

Recommended wording (tested-style, no fluff, no invented claims):

- Hero H1: **Train like it matters.**
- Hero sub: One payment for the plan you need, or £14.99 a month for everything.
- Primary button: **Join SEVEN3SEVEN Club — £14.99/mo**
- Secondary button: **Buy a programme — from £19.99**

Club goes first because it is the higher lifetime value and the lower entry
decision. The one-off is right next to it, same size, so nobody feels funnelled.

## What changes

**1. Correct the price everywhere**

Programmes are £19.99, not £20. The homepage already reads live prices from the
database; the pricing page hardcodes "From £20". Fix that to £19.99 and make the
pricing page read the real product price so it can never drift again.

**2. New hero: the fork in the road**

Keep the current image, gradient and typography exactly as they are. Replace the
single CTA row with the two-path choice: Club primary, one-off secondary, plus a
one-line reassurance underneath ("Cancel anytime · Lifetime access on one-off
plans · Secure Stripe checkout").

**3. A two-door block immediately after the hero**

Directly below the fold, before the goal chooser, add a side-by-side comparison
block (stacked on mobile) so the decision is made in the first two screens:

```text
 +---------------------------+   +---------------------------+
 | SEVEN3SEVEN CLUB          |   | ONE-OFF PROGRAMME         |
 | £14.99 / month            |   | from £19.99 once          |
 | Every programme           |   | One programme, for life   |
 | Coaching + PB + standards |   | Full app tracking         |
 | Leaderboard + metrics     |   | The permanent PDF         |
 | [ Join the Club ]         |   | [ Browse programmes ]     |
 +---------------------------+   +---------------------------+
```

This replaces the current generic "What's included" trust strip, which is doing
less work than the space deserves. Its four points get folded into the two cards.

**4. Sharpen the rest of the page for the two paths**

- The goal chooser ("What are you training for?") stays, renumbered, with a line
  under it noting all three are included with Club.
- The "What you get" section gains one Club-specific panel (coaching, standards,
  leaderboard) so the membership is justified, not just priced.
- The closing CTA becomes the same two-door choice rather than a single
  "Buy your programme" button.
- Header keeps Pricing; the mobile menu gets a Join the Club action so the
  membership is reachable from any page on a phone.

**5. Honest copy only**

No invented member counts, testimonials, results or urgency. The words that carry
weight are the real ones: every programme included, cancel anytime, PDF stays with
one-off purchases, lifetime access on what you buy.

## Technical notes

- `src/routes/_marketing.pricing.tsx`: replace the hardcoded `From £20` with the
  live minimum published product price via the existing price helper.
- `src/routes/_marketing.index.tsx`: rewrite the hero CTA row, swap the trust strip
  for the two-door block, add the Club panel to "What you get", update the closing
  CTA. Reuse existing tokens, `btn-signal` / `btn-ghost`, `Reveal`, and the
  established display scale — no new visual language.
- Club CTAs link to `/pricing` (which owns the checkout button) rather than
  triggering Stripe from the homepage, so signed-out visitors get context first.
- Update the homepage `head()` description to mention both routes, and refresh the
  FAQ JSON-LD with a membership-vs-one-off question.
- Mobile first: verify no horizontal overflow at 320px and that both hero buttons
  fit without wrapping.