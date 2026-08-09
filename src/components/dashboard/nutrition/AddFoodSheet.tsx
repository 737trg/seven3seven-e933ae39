import { useCallback, useMemo, useState } from "react";
import { Barcode, Search, Zap } from "lucide-react";
import { Sheet } from "@/components/dashboard/Sheet";
import { BarcodeScanner } from "./BarcodeScanner";
import { searchFoods, lookupBarcode, type FoodHit } from "@/lib/nutrition.functions";
import { MEALS, round1, type Meal } from "@/lib/nutrition";
import type { FoodEntry, NewFoodEntry } from "@/lib/useNutrition";

const inputClass =
  "h-11 w-full bg-surface-raised/40 border border-border/60 px-3 text-bone text-sm focus:outline-none focus:border-bone";

type Mode = "search" | "scan" | "quick";

const MODES: { key: Mode; label: string; icon: typeof Search }[] = [
  { key: "search", label: "Search", icon: Search },
  { key: "scan", label: "Scan", icon: Barcode },
  { key: "quick", label: "Quick add", icon: Zap },
];

/** Search / scan / quick-add, plus one-tap repeats of recent foods. */
export function AddFoodSheet({
  open,
  onClose,
  meal,
  recent,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  meal: Meal;
  recent: FoodEntry[];
  onAdd: (entry: Omit<NewFoodEntry, "logged_on">) => Promise<{ error?: string }>;
}) {
  const [mode, setMode] = useState<Mode>("search");
  const [targetMeal, setTargetMeal] = useState<Meal>(meal);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState<FoodHit | null>(null);
  const [grams, setGrams] = useState("100");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [quick, setQuick] = useState({ name: "", calories: "", protein: "", carbs: "", fat: "" });

  const reset = () => {
    setPicked(null);
    setResults([]);
    setQuery("");
    setMessage(null);
    setGrams("100");
    setQuick({ name: "", calories: "", protein: "", carbs: "", fat: "" });
  };

  const close = () => {
    reset();
    setMode("search");
    onClose();
  };

  const runSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length < 2) return;
    setSearching(true);
    setMessage(null);
    const res = await searchFoods({ data: { query: query.trim() } });
    setSearching(false);
    setResults(res.items);
    if (res.error) setMessage(res.error);
    else if (res.items.length === 0) setMessage("No match — try a different name or quick add.");
  };

  const onDetected = useCallback(async (code: string) => {
    setMessage("Looking up product…");
    const res = await lookupBarcode({ data: { barcode: code } });
    if (res.item) {
      setPicked(res.item);
      setGrams(String(res.item.servingGrams ?? 100));
      setMessage(null);
    } else {
      setMessage(res.error ?? "Product not found — add it manually.");
      setMode("quick");
    }
  }, []);

  const scaled = useMemo(() => {
    if (!picked) return null;
    const g = Number(grams);
    const factor = Number.isFinite(g) && g > 0 ? g / 100 : 1;
    return {
      calories: Math.round(picked.per100.calories * factor),
      protein_g: round1(picked.per100.protein_g * factor),
      carbs_g: round1(picked.per100.carbs_g * factor),
      fat_g: round1(picked.per100.fat_g * factor),
    };
  }, [picked, grams]);

  const save = async (entry: Omit<NewFoodEntry, "logged_on">) => {
    setSaving(true);
    const res = await onAdd(entry);
    setSaving(false);
    if (res.error) return setMessage(res.error);
    close();
  };

  const savePicked = () => {
    if (!picked || !scaled) return;
    const g = Number(grams);
    void save({
      meal: targetMeal,
      name: picked.name,
      brand: picked.brand,
      barcode: picked.barcode,
      serving_label: `${Number.isFinite(g) ? g : 100} g`,
      grams: Number.isFinite(g) ? g : 100,
      ...scaled,
      source: picked.barcode ? "barcode" : "search",
      saved: false,
    });
  };

  const saveQuick = (e: React.FormEvent) => {
    e.preventDefault();
    const calories = Number(quick.calories);
    if (!quick.name.trim() || !Number.isFinite(calories) || calories <= 0) {
      return setMessage("Give it a name and a calorie figure.");
    }
    void save({
      meal: targetMeal,
      name: quick.name.trim(),
      brand: null,
      barcode: null,
      serving_label: null,
      grams: null,
      calories: Math.round(calories),
      protein_g: round1(Number(quick.protein) || 0),
      carbs_g: round1(Number(quick.carbs) || 0),
      fat_g: round1(Number(quick.fat) || 0),
      source: "quick",
      saved: false,
    });
  };

  const repeat = (entry: FoodEntry) =>
    void save({
      meal: targetMeal,
      name: entry.name,
      brand: entry.brand,
      barcode: entry.barcode,
      serving_label: entry.serving_label,
      grams: entry.grams,
      calories: entry.calories,
      protein_g: entry.protein_g,
      carbs_g: entry.carbs_g,
      fat_g: entry.fat_g,
      source: "recent",
      saved: false,
    });

  return (
    <Sheet open={open} onClose={close} title="Add food">
      <div className="space-y-5">
        <div>
          <p className="eyebrow text-foreground-muted mb-2">Meal</p>
          <div className="grid grid-cols-4 gap-2">
            {MEALS.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setTargetMeal(m.key)}
                className={`tap press h-10 border text-[10px] uppercase tracking-widest font-display ${
                  targetMeal === m.key ? "border-bone text-bone" : "border-border/60 text-foreground-muted"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {!picked && (
          <div className="grid grid-cols-3 gap-2">
            {MODES.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setMode(key);
                  setMessage(null);
                }}
                className={`tap press h-11 inline-flex items-center justify-center gap-1.5 border text-[10px] uppercase tracking-widest font-display ${
                  mode === key ? "border-bone text-bone" : "border-border/60 text-foreground-muted"
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                {label}
              </button>
            ))}
          </div>
        )}

        {picked ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-bone font-display text-lg tracking-tight">{picked.name}</p>
                {picked.brand && <p className="text-foreground-muted text-xs">{picked.brand}</p>}
                <p className="text-foreground-muted text-[11px] tabular mt-1">
                  {picked.per100.calories} kcal · {picked.per100.protein_g}P / {picked.per100.carbs_g}C / {picked.per100.fat_g}F per 100 g
                </p>
              </div>
              <button type="button" onClick={reset} className="tap press text-signal font-display text-[10px] uppercase tracking-[0.22em]">
                Change
              </button>
            </div>

            <div>
              <label className="eyebrow text-foreground-muted" htmlFor="portion">Portion (g / ml)</label>
              <input
                id="portion"
                className={`${inputClass} mt-2`}
                inputMode="decimal"
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
              />
              {picked.servingGrams && (
                <button
                  type="button"
                  onClick={() => setGrams(String(picked.servingGrams))}
                  className="tap press mt-2 text-signal text-[11px] uppercase tracking-widest"
                >
                  Use serving{picked.servingLabel ? ` (${picked.servingLabel})` : ""}
                </button>
              )}
            </div>

            {scaled && (
              <p className="text-bone text-sm tabular">
                {scaled.calories} kcal · {scaled.protein_g}g protein · {scaled.carbs_g}g carbs · {scaled.fat_g}g fat
              </p>
            )}

            {message && <p className="text-signal text-xs">{message}</p>}

            <button
              type="button"
              onClick={savePicked}
              disabled={saving}
              className="tap press h-12 w-full bg-bone text-obsidian font-display text-[11px] uppercase tracking-[0.28em] disabled:opacity-60"
            >
              {saving ? "Adding…" : "Add to log"}
            </button>
          </div>
        ) : mode === "search" ? (
          <div className="space-y-4">
            <form onSubmit={runSearch} className="flex gap-2">
              <input
                className={inputClass}
                placeholder="Search foods…"
                aria-label="Search foods"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="submit"
                disabled={searching}
                className="tap press h-11 px-4 shrink-0 border border-border text-bone font-display text-[10px] uppercase tracking-[0.22em] disabled:opacity-40"
              >
                {searching ? "…" : "Go"}
              </button>
            </form>

            {message && <p className="text-foreground-muted text-xs">{message}</p>}

            <ul className="divide-y divide-border/60">
              {results.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setPicked(item);
                      setGrams(String(item.servingGrams ?? 100));
                    }}
                    className="tap press w-full text-left py-3"
                  >
                    <p className="text-bone text-sm">{item.name}</p>
                    <p className="text-foreground-muted text-[11px] tabular">
                      {item.brand ? `${item.brand} · ` : ""}{item.per100.calories} kcal / 100 g
                    </p>
                  </button>
                </li>
              ))}
            </ul>

            {recent.length > 0 && results.length === 0 && (
              <div>
                <p className="eyebrow text-foreground-muted">Recent</p>
                <div className="mt-2 grid gap-2">
                  {recent.slice(0, 6).map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => repeat(entry)}
                      className="tap press flex items-center justify-between gap-3 border border-border/60 px-3 py-2.5 text-left hover:border-bone"
                    >
                      <span className="text-bone text-sm truncate">{entry.name}</span>
                      <span className="text-foreground-muted text-[11px] tabular shrink-0">{Math.round(entry.calories)} kcal</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : mode === "scan" ? (
          <div className="space-y-3">
            <BarcodeScanner onDetected={(code) => void onDetected(code)} onError={(m) => setMessage(m)} />
            {message && <p className="text-foreground-muted text-xs">{message}</p>}
          </div>
        ) : (
          <form onSubmit={saveQuick} className="space-y-3">
            <input
              className={inputClass}
              placeholder="What was it?"
              aria-label="Food name"
              value={quick.name}
              onChange={(e) => setQuick({ ...quick, name: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <input className={inputClass} inputMode="numeric" placeholder="Calories" aria-label="Calories" value={quick.calories} onChange={(e) => setQuick({ ...quick, calories: e.target.value })} />
              <input className={inputClass} inputMode="decimal" placeholder="Protein (g)" aria-label="Protein" value={quick.protein} onChange={(e) => setQuick({ ...quick, protein: e.target.value })} />
              <input className={inputClass} inputMode="decimal" placeholder="Carbs (g)" aria-label="Carbs" value={quick.carbs} onChange={(e) => setQuick({ ...quick, carbs: e.target.value })} />
              <input className={inputClass} inputMode="decimal" placeholder="Fat (g)" aria-label="Fat" value={quick.fat} onChange={(e) => setQuick({ ...quick, fat: e.target.value })} />
            </div>
            {message && <p className="text-signal text-xs">{message}</p>}
            <button
              type="submit"
              disabled={saving}
              className="tap press h-12 w-full bg-bone text-obsidian font-display text-[11px] uppercase tracking-[0.28em] disabled:opacity-60"
            >
              {saving ? "Adding…" : "Add to log"}
            </button>
          </form>
        )}
      </div>
    </Sheet>
  );
}