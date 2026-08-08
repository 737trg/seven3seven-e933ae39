import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PR_METRICS, usePersonalRecords } from "@/lib/usePersonalRecords";

const inputClass =
  "h-10 w-full bg-surface-raised/40 border border-border/60 px-3 text-bone text-sm focus:outline-none focus:border-bone";

/** Personal bests and benchmarks: lifts, times, distances — logged by hand. */
export function PersonalRecordsPanel({ userId, defaultUnit }: { userId: string | undefined; defaultUnit: "kg" | "lb" }) {
  const { items, loading, add, remove } = usePersonalRecords(userId);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [metric, setMetric] = useState<string>("load");
  const [value, setValue] = useState("");
  const [reps, setReps] = useState("");
  const [unit, setUnit] = useState<string>(defaultUnit);
  const [achievedOn, setAchievedOn] = useState(() => new Date().toISOString().slice(0, 10));

  const unitOptions = PR_METRICS.find((m) => m.value === metric)?.unitOptions ?? [defaultUnit];

  const reset = () => {
    setLabel("");
    setValue("");
    setReps("");
    setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number(value);
    if (!label.trim()) return setError("Give the movement or benchmark a name.");
    if (!Number.isFinite(numeric) || numeric <= 0) return setError("Enter a number greater than zero.");
    setSaving(true);
    const res = await add({
      lift_label: label,
      metric,
      value: numeric,
      reps: reps ? Number(reps) : null,
      unit: unitOptions.includes(unit as never) ? unit : unitOptions[0],
      achieved_on: achievedOn,
    });
    setSaving(false);
    if (res.error) return setError(res.error);
    reset();
    setOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-foreground-muted text-[10px] uppercase tracking-widest">Personal bests</p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-signal font-display"
        >
          <Plus className="h-3 w-3" /> {open ? "Close" : "Add PB"}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="mt-4 space-y-3">
          <input
            className={inputClass}
            placeholder="Back squat, 5k run, max press-ups…"
            aria-label="Movement or benchmark"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              className={inputClass}
              aria-label="Metric"
              value={metric}
              onChange={(e) => {
                setMetric(e.target.value);
                const next = PR_METRICS.find((m) => m.value === e.target.value);
                if (next) setUnit(next.unitOptions[0]);
              }}
            >
              {PR_METRICS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <select className={inputClass} aria-label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
              {unitOptions.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              className={inputClass}
              inputMode="decimal"
              placeholder="Value"
              aria-label="Value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <input
              className={inputClass}
              inputMode="numeric"
              placeholder="Reps (optional)"
              aria-label="Reps"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
            />
          </div>
          <input
            className={inputClass}
            type="date"
            aria-label="Date achieved"
            value={achievedOn}
            onChange={(e) => setAchievedOn(e.target.value)}
          />
          {error && <p className="text-signal text-xs">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="h-10 w-full bg-bone text-obsidian font-display text-[11px] uppercase tracking-[0.28em] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save PB"}
          </button>
        </form>
      )}

      <ul className="mt-4 divide-y divide-border/60">
        {loading && <li className="py-3 text-foreground-muted text-xs">Loading…</li>}
        {!loading && items.length === 0 && (
          <li className="py-3 text-foreground-muted text-xs">No personal bests logged yet.</li>
        )}
        {items.slice(0, 8).map((r) => (
          <li key={r.id} className="py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-bone text-sm truncate">{r.lift_label}</p>
              <p className="text-foreground-muted text-[10px] uppercase tracking-widest">
                {new Date(r.achieved_on).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                {r.reps ? ` · ${r.reps} reps` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-bone text-sm tabular">{r.value}{r.unit === "reps" ? "" : ` ${r.unit}`}</span>
              <button
                type="button"
                onClick={() => void remove(r.id)}
                aria-label={`Delete ${r.lift_label} personal best`}
                className="text-foreground-muted hover:text-signal"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}