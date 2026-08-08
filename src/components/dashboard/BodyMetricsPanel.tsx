import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useBodyMetrics } from "@/lib/useBodyMetrics";
import { Sparkline } from "./Sparkline";

const inputClass =
  "h-10 w-full bg-surface-raised/40 border border-border/60 px-3 text-bone text-sm focus:outline-none focus:border-bone";

const LB_PER_KG = 2.20462;

/** Bodyweight, composition and resting heart-rate log with a simple trend. */
export function BodyMetricsPanel({ userId, units }: { userId: string | undefined; units: "kg" | "lb" }) {
  const { items, loading, save, remove } = useBodyMetrics(userId);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weight, setWeight] = useState("");
  const [bodyfat, setBodyfat] = useState("");
  const [hr, setHr] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const toDisplay = (kg: number) => Math.round((units === "lb" ? kg * LB_PER_KG : kg) * 10) / 10;

  const weighIns = items.filter((m) => typeof m.weight_kg === "number");
  const chronological = weighIns.slice().reverse();
  const latest = weighIns[0];
  const firstW = chronological[0]?.weight_kg ?? null;
  const lastW = latest?.weight_kg ?? null;
  const delta = firstW !== null && lastW !== null ? Math.round((toDisplay(lastW) - toDisplay(firstW)) * 10) / 10 : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = weight ? Number(weight) : null;
    const bf = bodyfat ? Number(bodyfat) : null;
    const rhr = hr ? Number(hr) : null;
    if (w === null && bf === null && rhr === null) return setError("Enter at least one measurement.");
    if (w !== null && (!Number.isFinite(w) || w <= 0)) return setError("Enter a valid bodyweight.");
    setSaving(true);
    const res = await save({
      measured_on: date,
      weight_kg: w === null ? null : Math.round((units === "lb" ? w / LB_PER_KG : w) * 100) / 100,
      bodyfat_pct: bf,
      resting_hr: rhr,
    });
    setSaving(false);
    if (res.error) return setError(res.error);
    setWeight("");
    setBodyfat("");
    setHr("");
    setError(null);
    setOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-foreground-muted text-[10px] uppercase tracking-widest">Body metrics</p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="tap press inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-signal font-display"
        >
          <Plus className="h-3 w-3" /> {open ? "Close" : "Log"}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              className={inputClass}
              inputMode="decimal"
              placeholder={`Weight (${units})`}
              aria-label={`Bodyweight in ${units}`}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
            <input
              className={inputClass}
              inputMode="decimal"
              placeholder="Body fat %"
              aria-label="Body fat percentage"
              value={bodyfat}
              onChange={(e) => setBodyfat(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              className={inputClass}
              inputMode="numeric"
              placeholder="Resting HR"
              aria-label="Resting heart rate"
              value={hr}
              onChange={(e) => setHr(e.target.value)}
            />
            <input
              className={inputClass}
              type="date"
              aria-label="Date measured"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          {error && <p className="text-signal text-xs">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="tap press h-10 w-full bg-bone text-obsidian font-display text-[11px] uppercase tracking-[0.28em] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save entry"}
          </button>
        </form>
      )}

      {loading && <p className="mt-4 text-foreground-muted text-xs">Loading…</p>}

      {!loading && items.length === 0 && (
        <p className="mt-4 text-foreground-muted text-xs">
          No measurements yet. Log your bodyweight weekly to see the trend.
        </p>
      )}

      {!loading && latest?.weight_kg != null && (
        <div className="mt-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-bone text-lg tabular">{toDisplay(latest.weight_kg)} {units}</p>
            {delta !== null && chronological.length > 1 && (
              <p className="text-foreground-muted text-[10px] uppercase tracking-widest">
                {delta > 0 ? "+" : ""}{delta} {units} over {chronological.length} entries
              </p>
            )}
          </div>
          <Sparkline
            values={chronological.map((m) => toDisplay(m.weight_kg as number))}
            className="mt-1 text-bone"
          />
        </div>
      )}

      {!loading && items.length > 0 && (
        <ul className="mt-3 divide-y divide-border/60">
          {items.slice(0, 5).map((m) => (
            <li key={m.id} className="py-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-bone text-xs tabular">
                  {m.weight_kg != null ? `${toDisplay(m.weight_kg)} ${units}` : "—"}
                  {m.bodyfat_pct != null ? ` · ${m.bodyfat_pct}% bf` : ""}
                  {m.resting_hr != null ? ` · ${m.resting_hr} bpm` : ""}
                </p>
                <p className="text-foreground-muted text-[10px] uppercase tracking-widest">
                  {new Date(m.measured_on).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void remove(m.id)}
                aria-label={`Delete entry from ${m.measured_on}`}
                className="tap text-foreground-muted hover:text-signal shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
