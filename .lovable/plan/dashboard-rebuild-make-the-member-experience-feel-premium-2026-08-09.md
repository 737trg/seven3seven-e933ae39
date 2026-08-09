# Dashboard rebuild — make the member experience feel premium

You're right on both counts. Two separate problems are stacked on top of each other.

## 1. The membership state is real, the UI just ignores it

Your account (`jamesnichol9@gmail.com`) does have full Club access — it's granted via the legacy full-access flag, and the backend correctly unlocks every member-only panel. What's broken is that nothing in the shell knows it:

- The mobile menu hard-codes "JOIN THE CLUB — £14.99/mo" for everyone, signed in or not, member or not.
- Pricing, the landing page and the account page all still sell the membership to someone who already has it.
- There is no visible "you are a member" state anywhere, so even when the premium panels unlock, it reads as "basic app" rather than "I'm getting something".

**Fix:** a single membership-aware shell. When the user has Club access the sell CTA is replaced by a Club badge + link to their dashboard; pricing shows "You're a member" with manage-billing instead of a buy button; the landing page swaps the two-door hero for a "resume training" strip. Non-members are unchanged.

## 2. The dashboard is a stack, not a dashboard

Right now `/my-programmes` is one long vertical scroll: header, stats, next session, programme cards, then **eight** sidebar panels dumped one after another on mobile (Consistency, PBs, PB trend, Standards, Body metrics, Leaderboard, Recent activity, Progress, Quick actions). On a phone that's a mile of scrolling with no way to jump anywhere. Nothing is discoverable — that's why the PBs feel "missing"; they're there, just buried three screens down.

### What changes

**Rename and reframe.** "My programmes" becomes **Dashboard** — headline "Welcome back, James." with today's date and a live status line. Programmes become one section within it, not the whole page.

**Tabbed dashboard instead of one scroll.** Four segmented tabs directly under the header, sticky on mobile:

```text
TRAIN        PROGRESS       BODY        CLUB
next session  PB list        weight      leaderboard
programmes    PB trend       body fat    member perks
schedule      standards      resting HR  billing
```

- **Train** — next session card, programme cards, streak strip, recent activity.
- **Progress** — personal records, PB trend, standards, sessions/results totals.
- **Body** — body metrics log and trend.
- **Club** — membership status, leaderboard, what membership includes, manage billing.

Each tab is one screen of content, not eight panels. Tab state lives in the URL (`?tab=progress`) so it's linkable and survives refresh.

**A real bottom nav on mobile.** The app already has a `BottomNav` component used inside the workout shells. Extend the same pattern across the signed-in dashboard: Train · Progress · Body · Club. Fixed, thumb-reachable, safe-area padded. This is the single biggest "does it feel like an app" change.

**Premium header block.** Replace the generic "Your training. Your progress." lede with a live snapshot: current streak, week number, next session in one condensed strip with the Club badge. No hero image on mobile at all.

**Consistent card language.** Every panel becomes the same surface treatment (hairline, raised background, section eyebrow, tap affordance) instead of the current mix of bare `border-b` headings and floating lists. Empty states get a real prompt and an action, not "No entries this month yet."

## What I'm not changing

- No changes to training content, manifests, entitlements, or the session runner.
- No pricing changes.
- No new backend tables — every panel already has its data.

## Technical notes

- `src/routes/_marketing.my-programmes.tsx` splits into a dashboard shell plus four tab components under `src/components/dashboard/tabs/`.
- New `src/components/shell/DashboardNav.tsx` (bottom nav on mobile, segmented control on desktop) driven by a `tab` search param on the route.
- `useMembership` gets consumed in `MarketingHeader`, `_marketing.pricing.tsx` and `_marketing.index.tsx` to swap the sell CTA for member state.
- Desktop keeps a two-column layout: tab content left, persistent Club/streak rail right — so nothing is lost for wide screens.
- Design tokens only; existing signal/bone/border/surface palette, no new colours.
