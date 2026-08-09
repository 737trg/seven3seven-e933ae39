import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Sheet } from "@/components/dashboard/Sheet";
import { MEALS, round1, type Meal } from "@/lib/nutrition";
import type { FoodEntry } from "@/lib/useNutrition";

const inputClass =
  "h-11 w-full bg-surface-raised/40 border border-border/60 px-3 text-bone text-sm focus:outline-none focus:border-bone";

const MAX_NAME = 120;

/** Correct anything about a logged food — meal, name, portion, macros — or delete it. */
export function EditFoodSheet({
  entry,
  onClose,
  onSave,
  onDelete,
}: {
  entry: FoodEntry | null;
  onClose: () => void;
  onSave: (id: string, patch: Partial<FoodEntry>) => Promise<{ error?: string }>;
  onDelete: (id: string) => Promise<{ error?: string }>;
}) {
  const [meal, setMeal] = useState<Meal>("breakfast");
  const [name, setName] = useState("");
  const [portion, setPortion] = useState("");
  const [macros, setMacros] = useState({ calories: "", protein: "", carbs: "", fat: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!entry) return;
    setMeal(entry.meal);
    setName(entry.name);
    setPortion(entry.grams != null ? String(entry.grams) : "");
    setMacros({
      calories: String(Math.round(entry.calories)),
      protein: String(entry.protein_g),
      carbs: String(entry.carbs_g),
      fat: String(entry.fat_g),
    });
    setError(null);
    setConfirmDelete(false);
  }, [entry]);

  if (!entry) return null;

  /** Rescale macros when the portion changes, using the original grams as the reference. */
  const rescale = (nextGrams: string) => {
    setPortion(nextGrams);
    const from = Number(entry.grams);
    const to = Number(nextGrams);
    if (!Number.isFinite(from) || from <= 0 || !Number.isFinite(to) || to <= 0) return;
    const factor = to / from;
    setMacros({
      calories: String(Math.round(entry.calories * factor)),
      protein: String(round1(entry.protein_g * factor)),
      carbs: String(round1(entry.carbs_g * factor)),
      fat: String(round1(entry.fat_g * factor)),
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = name.trim().slice(0, MAX_NAME);
    const calories = Number(macros.calories);
    if (!trimmed) return setError("Give the entry a name.");
    if (!Number.isFinite(calories) || calories < 0) return setError("Enter a valid calorie figure.");
    const grams = portion.trim() === "" ? null : Number(portion);
    if (grams !== null && (!Number.isFinite(grams) || grams <= 0)) return setError("Enter a valid portion size.");

    setBusy(true);
    const res = await onSave(entry.id, {
      meal,
      name: trimmed,
      grams,
      serving_label: grams !== null ? `${grams} g` : null,
      calories: Math.round(calories),
      protein_g: round1(Number(macros.protein) || 0),
      carbs_g: round1(Number(macros.carbs) || 0),
      fat_g: round1(Number(macros.fat) || 0),
    });
    setBusy(false);
    if (res.error) return setError(res.error);
    onClose();
  };

  const remove = async () => {
    if (!confirmDelete) return setConfirmDelete(true);
    setBusy(true);
    const res = await onDelete(entry.id);
    setBusy(false);
    if (res.error) return setError(res.error);
    onClose();
  };

  return (
    <Sheet open onClose={onClose} title="Edit entry">
      <form onSubmit={submit} className="space-y-5">
        {entry.brand && <p className="text-foreground-muted text-xs">{entry.brand}</p>}

        <div>
          <p className="eyebrow text-foreground-muted mb-2">Meal</p>
          <div className="grid grid-cols-4 gap-2">
            {MEALS.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMeal(m.key)}
                className={`tap press h-10 border text-[10px] uppercase tracking-widest font-display ${
                  meal === m.key ? "border-bone text-bone" : "border-border/60 text-foreground-muted"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="eyebrow text-foreground-muted">Name</span>
          <input className={`${inputClass} mt-2`} maxLength={MAX_NAME} value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <label className="block">
          <span className="eyebrow text-foreground-muted">Portion (g / ml){entry.grams ? " — macros rescale" : ""}</span>
          <input
            className={`${inputClass} mt-2`}
            inputMode="decimal"
            placeholder="Optional"
            value={portion}
            onChange={(e) => rescale(e.target.value)}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="eyebrow text-foreground-muted">Calories</span>
            <input className={`${inputClass} mt-2`} inputMode="numeric" value={macros.calories} onChange={(e) => setMacros({ ...macros, calories: e.target.value })} />
          </label>
          <label className="block">
            <span className="eyebrow text-foreground-muted">Protein g</span>
            <input className={`${inputClass} mt-2`} inputMode="decimal" value={macros.protein} onChange={(e) => setMacros({ ...macros, protein: e.target.value })} />
          </label>
          <label className="block">
            <span className="eyebrow text-foreground-muted">Carbs g</span>
            <input className={`${inputClass} mt-2`} inputMode="decimal" value={macros.carbs} onChange={(e) => setMacros({ ...macros, carbs: e.target.value })} />
          </label>
          <label className="block">
            <span className="eyebrow text-foreground-muted">Fat g</span>
            <input className={`${inputClass} mt-2`} inputMode="decimal" value={macros.fat} onChange={(e) => setMacros({ ...macros, fat: e.target.value })} />
          </label>
        </div>

        {error && <p className="text-signal text-xs">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="tap press h-12 w-full bg-bone text-obsidian font-display text-[11px] uppercase tracking-[0.28em] disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save changes"}
        </button>

        <button
          type="button"
          onClick={() => void remove()}
          disabled={busy}
          className="tap press h-11 w-full inline-flex items-center justify-center gap-2 border border-border/60 text-signal font-display text-[10px] uppercase tracking-[0.22em] disabled:opacity-60"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          {confirmDelete ? "Tap again to delete" : "Delete entry"}
        </button>
      </form>
    </Sheet>
  );
}