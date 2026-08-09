import { useState } from "react";
import { Sheet } from "@/components/dashboard/Sheet";
import {
  ACTIVITY_LEVELS,
  GOALS,
  calculateTargets,
  fromKg,
  toKg,
  type ActivityLevel,
  type Goal,
  type Sex,
} from "@/lib/nutrition";
import type { NutritionTargets } from "@/lib/useNutrition";

const inputClass =
  "h-11 w-full bg-surface-raised/40 border border-border/60 px-3 text-bone text-sm focus:outline-none focus:border-bone";

/** Calorie, protein and water target calculator (Mifflin-St Jeor) with manual override. */
export function TargetsSheet({
  open,
  onClose,
  targets,
  units,
  latestWeightKg,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  targets: NutritionTargets;
  units: "kg" | "lb";
  latestWeightKg: number | null;
  onSave: (patch: Partial<Omit<NutritionTargets, "configured">>) => Promise<{ error?: string }>;
}) {
  const startWeightKg = targets.basis_weight_kg ?? latestWeightKg ?? 80;
  const [sex, setSex] = useState<Sex>((targets.sex as Sex) ?? "male");
  const [age, setAge] = useState(String(targets.age ?? 30));
  const [height, setHeight] = useState(String(targets.height_cm ?? 178));
  const [weight, setWeight] = useState(String(Math.round(fromKg(startWeightKg, units) * 10) / 10));
  const [activity, setActivity] = useState<ActivityLevel>((targets.activity_level as ActivityLevel) ?? "moderate");
  const [goal, setGoal] = useState<Goal>((targets.goal as Goal) ?? "maintain");
  const [proteinPerKg, setProteinPerKg] = useState(String(targets.protein_per_kg ?? 2));
  const [manual, setManual] = useState(targets.method === "manual");
  const [override, setOverride] = useState({
    calories: String(targets.calories),
    protein_g: String(targets.protein_g),
    carbs_g: String(targets.carbs_g),
    fat_g: String(targets.fat_g),
    water_ml: String(targets.water_ml),
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const weightKg = toKg(Number(weight) || 0, units);
  const valid = weightKg > 20 && Number(age) > 12 && Number(height) > 100;
  const preview = valid
    ? calculateTargets({
        sex,
        age: Number(age),
        heightCm: Number(height),
        weightKg,
        activity,
        goal,
        proteinPerKg: Math.min(3, Math.max(1.2, Number(proteinPerKg) || 2)),
      })
    : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    let patch: Partial<Omit<NutritionTargets, "configured">>;
    if (manual) {
      const calories = Number(override.calories);
      if (!Number.isFinite(calories) || calories < 800) return setError("Enter a sensible calorie target.");
      patch = {
        method: "manual",
        calories: Math.round(calories),
        protein_g: Math.round(Number(override.protein_g) || 0),
        carbs_g: Math.round(Number(override.carbs_g) || 0),
        fat_g: Math.round(Number(override.fat_g) || 0),
        water_ml: Math.round(Number(override.water_ml) || 2500),
        basis_weight_kg: weightKg || null,
      };
    } else {
      if (!preview) return setError("Check your age, height and bodyweight.");
      patch = {
        method: "calculated",
        calories: preview.calories,
        protein_g: preview.protein_g,
        carbs_g: preview.carbs_g,
        fat_g: preview.fat_g,
        water_ml: preview.water_ml,
        sex,
        age: Number(age),
        height_cm: Number(height),
        activity_level: activity,
        goal,
        protein_per_kg: Number(proteinPerKg) || 2,
        basis_weight_kg: weightKg,
      };
    }
    setSaving(true);
    const res = await onSave(patch);
    setSaving(false);
    if (res.error) return setError(res.error);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Your daily targets">
      <form onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setManual(false)}
            className={`tap press h-10 border text-[10px] uppercase tracking-widest font-display ${!manual ? "border-bone text-bone" : "border-border/60 text-foreground-muted"}`}
          >
            Calculate
          </button>
          <button
            type="button"
            onClick={() => setManual(true)}
            className={`tap press h-10 border text-[10px] uppercase tracking-widest font-display ${manual ? "border-bone text-bone" : "border-border/60 text-foreground-muted"}`}
          >
            Set manually
          </button>
        </div>

        {!manual ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              {(["male", "female"] as Sex[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSex(s)}
                  className={`tap press h-11 border text-[10px] uppercase tracking-widest font-display ${sex === s ? "border-bone text-bone" : "border-border/60 text-foreground-muted"}`}
                >
                  {s === "male" ? "Male" : "Female"}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <label className="block">
                <span className="eyebrow text-foreground-muted">Age</span>
                <input className={`${inputClass} mt-2`} inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />
              </label>
              <label className="block">
                <span className="eyebrow text-foreground-muted">Height cm</span>
                <input className={`${inputClass} mt-2`} inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value)} />
              </label>
              <label className="block">
                <span className="eyebrow text-foreground-muted">Weight {units}</span>
                <input className={`${inputClass} mt-2`} inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </label>
            </div>

            <div>
              <p className="eyebrow text-foreground-muted mb-2">Activity</p>
              <div className="grid gap-2">
                {ACTIVITY_LEVELS.map((a) => (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => setActivity(a.key)}
                    className={`tap press flex items-center justify-between gap-3 border px-3 py-2.5 text-left ${activity === a.key ? "border-bone" : "border-border/60"}`}
                  >
                    <span className="text-bone text-sm">{a.label}</span>
                    <span className="text-foreground-muted text-[11px]">{a.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="eyebrow text-foreground-muted mb-2">Goal</p>
              <div className="grid grid-cols-3 gap-2">
                {GOALS.map((g) => (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => setGoal(g.key)}
                    className={`tap press h-16 border px-2 ${goal === g.key ? "border-bone text-bone" : "border-border/60 text-foreground-muted"}`}
                  >
                    <span className="block font-display text-[10px] uppercase tracking-widest">{g.label}</span>
                    <span className="block text-[10px] mt-1">{g.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="eyebrow text-foreground-muted">Protein per kg bodyweight (2.0–2.2 recommended)</span>
              <input className={`${inputClass} mt-2`} inputMode="decimal" value={proteinPerKg} onChange={(e) => setProteinPerKg(e.target.value)} />
            </label>

            {preview && (
              <div className="hairline p-4">
                <p className="eyebrow text-foreground-muted">Your targets</p>
                <p className="font-display text-bone text-2xl tabular mt-2">{preview.calories} kcal</p>
                <p className="text-foreground-muted text-xs tabular mt-1">
                  {preview.protein_g}g protein · {preview.carbs_g}g carbs · {preview.fat_g}g fat · {(preview.water_ml / 1000).toFixed(1)} L water
                </p>
                <p className="text-foreground-muted text-[11px] tabular mt-2">
                  BMR {preview.bmr} kcal · maintenance {preview.tdee} kcal
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="eyebrow text-foreground-muted">Calories</span>
              <input className={`${inputClass} mt-2`} inputMode="numeric" value={override.calories} onChange={(e) => setOverride({ ...override, calories: e.target.value })} />
            </label>
            <label className="block">
              <span className="eyebrow text-foreground-muted">Protein g</span>
              <input className={`${inputClass} mt-2`} inputMode="numeric" value={override.protein_g} onChange={(e) => setOverride({ ...override, protein_g: e.target.value })} />
            </label>
            <label className="block">
              <span className="eyebrow text-foreground-muted">Carbs g</span>
              <input className={`${inputClass} mt-2`} inputMode="numeric" value={override.carbs_g} onChange={(e) => setOverride({ ...override, carbs_g: e.target.value })} />
            </label>
            <label className="block">
              <span className="eyebrow text-foreground-muted">Fat g</span>
              <input className={`${inputClass} mt-2`} inputMode="numeric" value={override.fat_g} onChange={(e) => setOverride({ ...override, fat_g: e.target.value })} />
            </label>
            <label className="block col-span-2">
              <span className="eyebrow text-foreground-muted">Water ml</span>
              <input className={`${inputClass} mt-2`} inputMode="numeric" value={override.water_ml} onChange={(e) => setOverride({ ...override, water_ml: e.target.value })} />
            </label>
          </div>
        )}

        {error && <p className="text-signal text-xs">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="tap press h-12 w-full bg-bone text-obsidian font-display text-[11px] uppercase tracking-[0.28em] disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save targets"}
        </button>
      </form>
    </Sheet>
  );
}