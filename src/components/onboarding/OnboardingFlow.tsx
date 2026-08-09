import { useMemo, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { CustomerProgramme } from "@/lib/useCustomerDashboard";
import type { UserPreferences } from "@/lib/usePreferences";
import { calculateTargets, hydrationTarget, toKg, GOALS, ACTIVITY_LEVELS, type Goal, type ActivityLevel, type Sex } from "@/lib/nutrition";

const DAYS = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

const inputClass =
  "h-11 w-full bg-surface-raised/40 border border-border/60 px-3 text-bone text-sm focus:outline-none focus:border-bone";

type Step = 0 | 1 | 2 | 3;

/**
 * First-run setup. Four steps — programme, training days, reminder time and an
 * optional fuel baseline — so a new athlete lands on a dashboard that already
 * knows what they're doing and when.
 */
export function OnboardingFlow({
  userId,
  units,
  programmes,
  onDone,
  update,
}: {
  userId: string;
  units: "kg" | "lb";
  programmes: CustomerProgramme[];
  onDone: () => void;
  update: (patch: Partial<UserPreferences>) => Promise<void>;
}) {
  const [step, setStep] = useState<Step>(0);
  const [productId, setProductId] = useState<string | null>(programmes[0]?.product_id ?? null);
  const [days, setDays] = useState<string[]>(["mon", "wed", "fri"]);
  const [time, setTime] = useState("07:00");
  const [reminders, setReminders] = useState(true);
  const [fuel, setFuel] = useState({ sex: "male" as Sex, age: "", height: "", weight: "", activity: "moderate" as ActivityLevel, goal: "maintain" as Goal });
  const [busy, setBusy] = useState(false);

  const canFuel = useMemo(
    () => [fuel.age, fuel.height, fuel.weight].every((v) => Number(v) > 0),
    [fuel],
  );

  const finish = async (withFuel: boolean) => {
    setBusy(true);
    await update({
      primary_product_id: productId,
      training_days: days,
      notifications: { daily_reminder: reminders, reminder_time: time, weekly_recap: reminders, streak_rescue: true },
      onboarding_completed_at: new Date().toISOString(),
    });

    if (withFuel && canFuel) {
      const weightKg = toKg(Number(fuel.weight), units);
      const result = calculateTargets({
        sex: fuel.sex,
        age: Number(fuel.age),
        heightCm: Number(fuel.height),
        weightKg,
        activity: fuel.activity,
        goal: fuel.goal,
        proteinPerKg: 2,
      });
      await supabase.from("nutrition_targets").upsert(
        {
          user_id: userId,
          calories: result.calories,
          protein_g: result.protein_g,
          carbs_g: result.carbs_g,
          fat_g: result.fat_g,
          water_ml: hydrationTarget(weightKg),
          method: "calculated",
          sex: fuel.sex,
          age: Number(fuel.age),
          height_cm: Number(fuel.height),
          activity_level: fuel.activity,
          goal: fuel.goal,
          protein_per_kg: 2,
          basis_weight_kg: weightKg,
        },
        { onConflict: "user_id" },
      );
    }

    setBusy(false);
    onDone();
  };

  const toggleDay = (key: string) =>
    setDays((d) => (d.includes(key) ? d.filter((x) => x !== key) : [...d, key]));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-obsidian">
      <div className="min-h-dvh max-w-[640px] mx-auto container-x py-10 flex flex-col">
        <div className="flex items-center gap-1.5 mb-8" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`h-0.5 flex-1 ${i <= step ? "bg-signal" : "bg-border"}`} />
          ))}
        </div>

        {step === 0 && (
          <section>
            <p className="eyebrow text-signal mb-3">Step 1 of 4</p>
            <h1 className="display-lg text-bone">What are you training for?</h1>
            <p className="lede mt-3">Pick the programme you want front and centre. You can switch any time.</p>
            <div className="mt-7 space-y-2">
              {programmes.length === 0 && (
                <p className="body-sm">No programmes on your account yet — you can set this up once you have one.</p>
              )}
              {programmes.map((p) => (
                <button
                  key={p.product_id}
                  type="button"
                  onClick={() => setProductId(p.product_id)}
                  className={`tap press w-full text-left border p-4 ${productId === p.product_id ? "border-bone" : "border-border/60"}`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-bone font-display uppercase text-xs tracking-[0.18em]">{p.name}</span>
                    {productId === p.product_id && <Check className="h-4 w-4 text-signal" strokeWidth={1.75} />}
                  </span>
                  <span className="block body-sm mt-1.5">{p.state === "ready" ? "Ready to start" : p.state === "completed" ? "Completed" : "In progress"}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 1 && (
          <section>
            <p className="eyebrow text-signal mb-3">Step 2 of 4</p>
            <h1 className="display-lg text-bone">Which days do you train?</h1>
            <p className="lede mt-3">We'll shape your week around these and only nudge you when a session is due.</p>
            <div className="mt-7 grid grid-cols-4 gap-2">
              {DAYS.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => toggleDay(d.key)}
                  className={`tap press h-12 border font-display uppercase text-[10px] tracking-[0.2em] ${
                    days.includes(d.key) ? "border-bone text-bone" : "border-border/60 text-foreground-muted"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <p className="eyebrow text-signal mb-3">Step 3 of 4</p>
            <h1 className="display-lg text-bone">When should we nudge you?</h1>
            <p className="lede mt-3">One reminder on training days, and a Monday recap. Nothing else.</p>
            <label className="block mt-7">
              <span className="eyebrow text-foreground-muted">Reminder time</span>
              <input type="time" className={`${inputClass} mt-2`} value={time} onChange={(e) => setTime(e.target.value)} />
            </label>
            <button
              type="button"
              onClick={() => setReminders((r) => !r)}
              className={`tap press mt-4 w-full h-12 border font-display uppercase text-[10px] tracking-[0.2em] ${
                reminders ? "border-bone text-bone" : "border-border/60 text-foreground-muted"
              }`}
            >
              {reminders ? "Reminders on" : "Reminders off"}
            </button>
          </section>
        )}

        {step === 3 && (
          <section>
            <p className="eyebrow text-signal mb-3">Step 4 of 4</p>
            <h1 className="display-lg text-bone">Set your fuel baseline</h1>
            <p className="lede mt-3">Optional, takes ten seconds, and it means Fuel isn't empty when you open it.</p>
            <div className="mt-7 grid grid-cols-2 gap-3">
              <div className="col-span-2 grid grid-cols-2 gap-2">
                {(["male", "female"] as Sex[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFuel({ ...fuel, sex: s })}
                    className={`tap press h-11 border font-display uppercase text-[10px] tracking-[0.2em] ${
                      fuel.sex === s ? "border-bone text-bone" : "border-border/60 text-foreground-muted"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <label className="block">
                <span className="eyebrow text-foreground-muted">Age</span>
                <input className={`${inputClass} mt-2`} inputMode="numeric" value={fuel.age} onChange={(e) => setFuel({ ...fuel, age: e.target.value })} />
              </label>
              <label className="block">
                <span className="eyebrow text-foreground-muted">Height cm</span>
                <input className={`${inputClass} mt-2`} inputMode="numeric" value={fuel.height} onChange={(e) => setFuel({ ...fuel, height: e.target.value })} />
              </label>
              <label className="block col-span-2">
                <span className="eyebrow text-foreground-muted">Weight ({units})</span>
                <input className={`${inputClass} mt-2`} inputMode="decimal" value={fuel.weight} onChange={(e) => setFuel({ ...fuel, weight: e.target.value })} />
              </label>
              <label className="block col-span-2">
                <span className="eyebrow text-foreground-muted">Activity</span>
                <select className={`${inputClass} mt-2`} value={fuel.activity} onChange={(e) => setFuel({ ...fuel, activity: e.target.value as ActivityLevel })}>
                  {ACTIVITY_LEVELS.map((a) => (
                    <option key={a.key} value={a.key}>{a.label}</option>
                  ))}
                </select>
              </label>
              <label className="block col-span-2">
                <span className="eyebrow text-foreground-muted">Goal</span>
                <select className={`${inputClass} mt-2`} value={fuel.goal} onChange={(e) => setFuel({ ...fuel, goal: e.target.value as Goal })}>
                  {GOALS.map((g) => (
                    <option key={g.key} value={g.key}>{g.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </section>
        )}

        <div className="mt-auto pt-10 flex items-center gap-3">
          {step > 0 && (
            <button type="button" onClick={() => setStep((s) => (s - 1) as Step)} className="tap press h-12 px-4 text-foreground-muted font-display text-[10px] uppercase tracking-[0.22em]">
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as Step)}
              className="tap press ml-auto h-12 px-6 inline-flex items-center gap-2 bg-bone text-obsidian font-display text-[11px] uppercase tracking-[0.24em]"
            >
              Continue <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => void finish(false)}
                className="tap press h-12 px-4 text-foreground-muted font-display text-[10px] uppercase tracking-[0.22em] disabled:opacity-60"
              >
                Skip
              </button>
              <button
                type="button"
                disabled={busy || !canFuel}
                onClick={() => void finish(true)}
                className="tap press ml-auto h-12 px-6 bg-bone text-obsidian font-display text-[11px] uppercase tracking-[0.24em] disabled:opacity-40"
              >
                {busy ? "Saving…" : "Finish setup"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}