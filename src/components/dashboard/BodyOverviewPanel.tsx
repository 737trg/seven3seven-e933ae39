import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useBodyMetrics, type NewBodyMetric } from "@/lib/useBodyMetrics";
import { MetricStat } from "./MetricStat";
import { LineChart, type ChartPoint } from "./LineChart";
import { Sheet } from "./Sheet";

type Series = "weight" | "bodyfat" | "hr";

const inputClass =
  "h-11 w-full bg-surface-raised/40 border border-border/60 px-3 text-bone text-sm focus:outline-none focus:border-bone";

const KG_TO_LB = 2.20462;

/** Bodyweight, composition and resting HR — widgets, trend chart and history. */
export function BodyOverviewPanel({ userId, units }: { userId: string | undefined; units: "kg" | "lb" }) {
  const { items, loading, save, remove } = useBodyMetrics(userId);
  const [series, setSeries] = useState<Series>("weight");
  const [logging, setLogging] = useState(false);

  const toDisplay = (kg: number) => (units === "lb" ? Math.round(kg * KG_TO_LB * 10) / 10 : Math.round(kg * 10) / 10);

  const chrono = useMemo(() => items.slice().reverse(), [items]);

  const weights = chrono.filter((m) => m.weight_kg != null);
  const startWeight = weights[0]?.weight_kg ?? null;
  const currentWeight = weights[weights.length - 1]?.weight_kg ?? null;
  const change = startWeight != null && currentWeight != null ? currentWeight - startWeight : null;

  const latestBf = [...chrono].reverse().find((m) => m.bodyfat_pct != null)?.bodyfat_pct ?? null;
  const latestHr = [...chrono].reverse().find((m) => m.resting_hr != null)?.resting_hr ?? null;

  const points: ChartPoint[] = useMemo(() => {
    const pick = (m: (typeof chrono)[number]) =>
      series === "weight"
        ? m.weight_kg != null
          ? toDisplay(m.weight_kg)
          : null
        : series === "bodyfat"
          ? m.bodyfat_pct
          : m.resting_hr;
    return chrono
      .map((m) => ({ date: m.measured_on, value: pick(m) }))
      .filter((p): p is ChartPoint => p.value != null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chrono, series, units]);

  const rolling: ChartPoint[] = useMemo(() => {
    if (points.length < 4) return [];
    return points.map((p, i) => {
      const window = points.slice(Math.max(0, i - 6), i + 1);
      return { date: p.date, value: window.reduce((s, q) => s + q.value, 0) / window.length };
    });
  }, [points]);

  const unitLabel = series === "weight" ? units : series === "bodyfat" ? "%" : "bpm";
  const format = (v: number) => `${Math.round(v * 10) / 10}${series === "bodyfat" ? "%" : ` ${unitLabel}`}`;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricStat label="Start" value={startWeight != null ? `${toDisplay(startWeight)} ${units}` : "—"} />
        <MetricStat
          label="Current"
          value={currentWeight != null ? `${toDisplay(currentWeight)} ${units}` : "—"}
          delta={
            change != null
              ? {
                  text: `${change > 0 ? "+" : ""}${toDisplay(change)} ${units} since start`,
                  good: null,
                }
              : null
          }
        />
        <MetricStat label="Body fat" value={latestBf != null ? `${latestBf}%` : "—"} />
        <MetricStat label="Resting HR" value={latestHr != null ? `${latestHr}` : "—"} sub="bpm" />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="inline-flex border border-border/60 p-0.5">
          {([
            ["weight", "Weight"],
            ["bodyfat", "Body fat"],
            ["hr", "Resting HR"],
          ] as [Series, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSeries(key)}
              aria-pressed={series === key}
              className={`tap press px-3 py-2 font-display text-[10px] uppercase tracking-[0.18em] ${
                series === key ? "bg-bone text-obsidian" : "text-foreground-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setLogging(true)}
          className="tap press inline-flex items-center gap-2 px-4 py-2 border border-border text-bone font-display text-[10px] uppercase tracking-[0.22em] hover:border-bone"
        >
          <Plus className="h-3.5 w-3.5" /> Log
        </button>
      </div>

      <div className="mt-5">
        {loading ? (
          <p className="text-foreground-muted text-xs">Loading your log…</p>
        ) : points.length === 0 ? (
          <p className="text-foreground-muted text-xs">Nothing logged for this metric yet.</p>
        ) : (
          <>
            <LineChart points={points} format={format} overlay={rolling} height={180} />
            {rolling.length > 0 && (
              <p className="mt-2 text-foreground-muted text-[10px] uppercase tracking-widest">
                Dashed line = 7-entry rolling average
              </p>
            )}
          </>
        )}
      </div>

      {items.length > 0 && (
        <details className="mt-6 pt-5 border-t border-border/60">
          <summary className="eyebrow text-foreground-muted cursor-pointer">History ({items.length})</summary>
          <div className="mt-3 space-y-2">
            {items.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 text-xs">
                <span className="text-foreground-muted tabular">
                  {new Date(m.measured_on).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
                </span>
                <span className="text-bone tabular flex-1 text-right">
                  {[
                    m.weight_kg != null ? `${toDisplay(m.weight_kg)} ${units}` : null,
                    m.bodyfat_pct != null ? `${m.bodyfat_pct}%` : null,
                    m.resting_hr != null ? `${m.resting_hr} bpm` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </span>
                <button
                  type="button"
                  onClick={() => void remove(m.id)}
                  aria-label="Delete entry"
                  className="tap press text-foreground-muted hover:text-signal"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </details>
      )}

      <LogBodySheet open={logging} onClose={() => setLogging(false)} units={units} onSave={save} />
    </div>
  );
}

function LogBodySheet({
  open,
  onClose,
  units,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  units: "kg" | "lb";
  onSave: (entry: NewBodyMetric) => Promise<{ error?: string }>;
}) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [weight, setWeight] = useState("");
  const [bodyfat, setBodyfat] = useState("");
  const [hr, setHr] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!weight && !bodyfat && !hr) return setError("Enter at least one measurement.");
    const raw = weight ? Number(weight) : null;
    const kg = raw != null ? (units === "lb" ? raw / KG_TO_LB : raw) : null;
    setSaving(true);
    const res = await onSave({
      measured_on: date,
      weight_kg: kg != null ? Math.round(kg * 100) / 100 : null,
      bodyfat_pct: bodyfat ? Number(bodyfat) : null,
      resting_hr: hr ? Number(hr) : null,
    });
    setSaving(false);
    if (res.error) return setError(res.error);
    setWeight("");
    setBodyfat("");
    setHr("");
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Log body metrics">
      <form onSubmit={submit} className="space-y-3">
        <input className={inputClass} type="date" aria-label="Date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input
          className={inputClass}
          placeholder={`Weight (${units})`}
          aria-label="Weight"
          inputMode="decimal"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            className={inputClass}
            placeholder="Body fat %"
            aria-label="Body fat percentage"
            inputMode="decimal"
            value={bodyfat}
            onChange={(e) => setBodyfat(e.target.value)}
          />
          <input
            className={inputClass}
            placeholder="Resting HR"
            aria-label="Resting heart rate"
            inputMode="numeric"
            value={hr}
            onChange={(e) => setHr(e.target.value)}
          />
        </div>
        {error && <p className="text-signal text-xs">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="tap press h-12 w-full bg-bone text-obsidian font-display text-[11px] uppercase tracking-[0.28em] disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save entry"}
        </button>
      </form>
    </Sheet>
  );
}