# Phase 3 + Membership: SEVEN3SEVEN Club

## Is the model viable?

Yes, with one adjustment. £14.99/month for "everything" alongside one-off lifetime programmes is workable, because the two buyers are different people:

- **One-off buyer**: wants one plan, owns it forever, trains solo. Low price, no ongoing cost.
- **Member**: wants all programmes, coaching intelligence, leaderboards, recaps. Recurring revenue.

The "sign up for a month, take the PDF, leave" worry is real but small, and it self-corrects: when the membership lapses, programme access lapses too. Members **rent** access; they do not acquire a lifetime licence. So a one-month raid gets 30 days of app access and a PDF, while the lifetime purchase still has real value.

Recommendation: **do not lower one-off prices.** Instead make the one-off tier deliberately complete-but-plain, and put the addictive layer (adaptive coaching, standards, leaderboards, recaps, multi-programme) behind membership.

## Feature split

**PAYG (one-off programme, lifetime)**
- The programme they bought: full session runner, timers, logging
- Session/week completion tracking and programme progress
- Basic dashboard: next session, streak, completion
- PDF download of their plan

**Club membership (£14.99/mo)**
- Every programme, current and future, while subscribed
- Adaptive coaching: readiness check + load suggestions
- PB tracking, PB trend charts, standards/benchmarks panel
- Body metrics log and trends
- Leaderboards
- Weekly recap email
- Share cards
- Schedule controls (move/skip/swap days)

Existing customers are grandfathered: anyone holding an entitlement before launch keeps the coaching/PB/metrics features they already use, free, forever. Removing features from people who already paid is the biggest churn and complaint risk here, so we avoid it entirely.

## Leaderboards without manual validation

You cannot police typed-in weights, so don't build something that needs policing.

- Boards rank only **what the app itself recorded**: sessions completed, weeks completed, current streak, total training time from the runner's own timers.
- No global weight or time boards. PB numbers stay private and only feed the athlete's own standards panel.
- Opt-in only, athlete-chosen display name, monthly reset so newcomers can win.

Self-validating: you can't fake a completed session without stepping through the runner.

## Weekly recap email

Yes — week just gone plus week ahead, sent Sunday evening:
- Sessions completed vs planned, streak, total time
- Any new PBs (private, in their own email only)
- Leaderboard position if opted in
- Next week's sessions with a deep link into the first one

## Pricing page

New `/pricing` route linked from header and footer:
- Two columns: **One-off programme** (lifetime, that plan only) and **Club membership** (£14.99/mo, everything, cancel anytime)
- Comparison table using the split above
- FAQ: what happens when I cancel (data kept, access stops), can I buy a plan *and* be a member (yes)
- Unique metadata, canonical URL, Product/Offer JSON-LD

## Technical notes

- New Stripe product `club_membership` with a recurring monthly price created through the payments tooling; checkout reuses the gateway client in `src/lib/stripe.server.ts`.
- New `subscriptions` table (user_id, status, price_id, current_period_end, environment) written by the existing webhook route `src/routes/api/public/payments/webhook.ts`, extended for `customer.subscription.*` and `invoice.*` events. RLS: athlete reads own row; service role writes; explicit GRANTs.
- New DB function `has_club_access(_user_id)` — true for an active/trialing/past-due subscription **or** a grandfathered flag. A single `useAccess()` hook wraps it; every gated panel checks it.
- Programme access becomes: owns entitlement **OR** has club access. Route guards and the library page share that rule.
- Grandfathering: one migration stamping legacy full access on profiles that already hold an entitlement.
- Leaderboard: monthly aggregate over `session_completions`, exposed through a security-definer function so no raw rows leak; opt-in flag and display name stored in `user_preferences`.
- Recap email: scaffolded on the Lovable email stack, triggered weekly by a scheduled call to a public API route guarded by a shared secret. Requires a verified sender domain before it can actually send.

## Build order

1. Membership plumbing: Stripe product/price, subscriptions table, webhook events, `has_club_access`, grandfather migration.
2. Access layer: `useAccess()`, gate the Phase 1/2 panels, unlock all programmes for members.
3. `/pricing` page plus upgrade prompts on locked panels.
4. Leaderboards (opt-in, activity-based).
5. Weekly recap email (needs sender domain).