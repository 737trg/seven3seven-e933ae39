# What to build next: make SEVEN3SEVEN a habit, not a purchase

## Where the app actually is right now

Numbers pulled from the live database tonight:

- 14 accounts, 6 paid one-off orders, 0 Club subscriptions
- 10 sessions completed ever, 2 in the last 7 days, across 4 people
- 1 readiness log, 1 personal best, 1 body measurement, 0 food entries, 0 leaderboard opt-ins

The feature set is genuinely strong — training, Progress, Body, Fuel, Club. What's missing is anything that pulls a person back tomorrow. There is no email infrastructure in the project, no reminder or notification code, and no installable-app manifest. Everything we've built waits passively for someone to remember to open a browser tab.

So the honest answer to "what should we add?" is: almost no new surfaces, and three retention loops. A fifth analytics panel doesn't help an app nobody opened this week.

## Phase A — The return loop (build this first)

**1. Install as an app (PWA).** Manifest, icons, offline shell, and an "add to home screen" prompt after the second completed session. An icon on the home screen is the cheapest retention mechanism that exists, and it's the prerequisite for push notifications later.

**2. Scheduled email reminders.** A daily "today's session" nudge at a time the athlete picks, and a Monday recap of the week just gone plus the week ahead. Per-type toggles in Profile, one-tap unsubscribe.

**3. Streak rescue.** When a streak breaks or someone goes five days quiet, one warm email: what they've achieved, what's next, one tap back in. One message, then silence for a fortnight. Not nagging.

**4. Guided onboarding.** New athletes currently land on a dashboard and have to work it out. Replace with four steps: pick your goal, pick training days, set a reminder time, start session one — setting Fuel targets on the way through so the tab isn't empty on day one.

## Phase B — Make what we've built earn its keep

**5. Empty states that teach.** Fuel, Body, PBs and Benchmarks all render empty shells today. Each gets one line of why it matters and one button that fills it in ten seconds.

**6. A proper post-session moment.** Finishing a session currently ends quietly. Add a short completion screen: what you beat, your streak now, the next session and when. This is the emotional payoff that brings people back.

**7. Leaderboard you don't have to police.** You're right that claimed numbers can't be validated. Rank on consistency — sessions completed and streaks, which the app records itself — so nothing needs verifying. Keep PB boards separate, clearly marked self-reported, with an optional photo or video for anyone who wants their number to stand up. Nobody has opted in yet, so this also needs an in-app prompt.

**8. Weekly training report.** One in-app card: sessions done vs planned, volume trend, average readiness, one plain-English coaching line. Built entirely on data we already store.

## Phase C — Reasons to stay past month three

**9. Content on a cadence.** The Club promise is "everything, current and future". That needs a monthly drop — a benchmark week, a short conditioning block, a technique breakdown. Without it, month four is the churn cliff.

**10. Wearable import.** Apple Health and Strava for runs and rucks, so cardio in Progress fills itself instead of needing manual entry. Highest effort here; worth it once the base loop works.

**11. Community.** One monthly challenge with a thread. Small and moderated beats a social feed.

## What I would not build

- More charts or analytics — Progress and Body are already ahead of usage.
- A social network or in-app messaging — no audience yet to fill it.
- An AI coach chat — attractive, but it papers over the retention gap rather than closing it.
- Cheaper one-off plans. £14.99 Club against £19.99 lifetime reads clearly, and losing access on cancel is the right amount of friction.

## Technical notes

- PWA: web manifest plus a service worker for the offline shell and cached session data. iOS needs its own install hint since Safari has no `beforeinstallprompt`.
- Email: transactional provider wired through the existing email-domain setup, sent from a route under `src/routes/api/public/` guarded by a shared secret and driven by a schedule. Send preferences live on `user_preferences.settings`.
- Reminders read from `src/lib/nextSession.ts` and `user_preferences.training_days`, so no new scheduling model is needed.
- Streak rescue reuses `computeStreak` in `src/lib/streak.ts` over `session_completions`.
- Leaderboard already runs on the consistency-based `monthly_leaderboard` function; the work is presentation plus an opt-in prompt.
- Onboarding writes `user_preferences` and `nutrition_targets` in one flow and stamps `onboarding_completed_at`.
- Wearables need a per-user OAuth connector, which is why they sit last.

## Suggested first slice

Phase A, items 1-4: install prompt, reminder and recap emails, streak rescue, guided onboarding. That's the whole return loop and nothing else. Everything after it gets more valuable once people are actually coming back.