# Fix: profile baseline inputs won't accept typed values

## What's wrong

On the Basic Training Blueprint+ profile (and the other programme profiles), the baseline boxes — Current 2 km, Deadlift baseline, Seated med-ball throw, Available training days — reject what you type.

Each of those inputs stores the *validated* value back into the box on every keystroke. The validators return "nothing" for anything that isn't already a finished, valid entry:

- `10:` on the way to `10:30` isn't a valid mm:ss, so it's discarded — the field stays empty and the phone keyboard looks broken.
- `7` typed toward `70` kg is fine, but `0` then backspace, decimals like `8.` , or a first digit below the 3-6 range for training days all get thrown away.
- Same pattern on Hybrid Race Plan, S.E.M 2026 and S.E.M 2027 profiles (numeric fields wipe partial input).

It affects desktop too, not just mobile.

## The fix

Type freely, validate on save.

1. Keep the raw text the user typed in local state for every text/number/time field on the programme profile forms. The box always shows exactly what was typed.
2. Run validation only when the field is left (blur) or when Save is pressed — convert to a number/time then, and store it.
3. If something is out of range or malformed, show a short inline message under that field instead of silently clearing it ("Use mm:ss, e.g. 10:30", "Enter 3-6 days").
4. Use mobile-friendly keyboards: numeric keypad for weights/metres/days, `inputMode="decimal"` where decimals are allowed.
5. Apply the same treatment to the four profiles that share the bug: Basic Training Blueprint+, Hybrid Race Plan, S.E.M 2026, S.E.M 2027 (the ones that save on every keystroke also get an explicit save/blur commit so values persist reliably).
6. Check the shared account profile page for the same pattern and fix if present.

## Verification

Type a 2 km time, a deadlift figure and a med-ball distance on a mobile viewport, save, reload, and confirm the values persist. Then confirm the same on desktop.

## Technical notes

- Files: `src/routes/my-programmes.basic-training-blueprint-plus.profile.tsx`, `my-programmes.hybrid-race-plan.profile.tsx`, `my-programmes.sem-2026.profile.tsx`, `my-programmes.sem-2027.profile.tsx`, plus `_app.profile.tsx` if affected.
- Root cause: controlled inputs whose `value` is derived from `safeNum`/`safeTime`/`safeInt`/`safeDate` output, which return `null` for in-progress input.
- Pattern: local `Record<string, string>` draft state seeded from the store, `onChange` writes raw string, `onBlur`/submit parses and commits to the programme store; no changes to store shapes or persisted data format.
- No visual redesign; only input handling and small inline validation text.
