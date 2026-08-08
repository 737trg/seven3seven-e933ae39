import { useMemo, useState } from "react";
import { usePersonalRecords, type PersonalRecord } from "@/lib/usePersonalRecords";
import { Sparkline } from "./Sparkline";

function historyFor(items: PersonalRecord[], key: string) {
  return items
    .filter((r) => r.lift_key === key)
    .slice()
    .sort((a, b) => a.achieved_on.localeCompare(b.achieved_on));
}

/** History of a chosen personal best, so progress is visible over time. */
export function PbTrendPanel({ userId }: { userId: string | undefined }) {
  const { items, loading } = usePersonalRecords(userId);

  const lifts = useMemo(() => {
    const map = new Map<string, { key: string; label: string; count: number }>();
    for (const r of items) {
      const prev = map.get(r.lift_key);
      map.set(r.lift_key, { key: r.lift_key, label: r.lift_label, count: (prev?.count ?? 0) + 1 });
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [items]);

  const [selected, setSelected] = useState<string | null>(null);
  const activeKey = selected ?? lifts[0]?.key ?? null;
  const history = activeKey ? historyFor(items, activeKey) : [];
  const values = history.map((h) => h.value);
  const first = values[0];
  const last = values[values.length - 1];
  const delta = values.length > 1 ? Math.round((last - first) * 100) / 100 : null;
  const unit = history[history.length - 1]?.unit ?? "";
  const isTime = history[history.length - 1]?.metric === "time";

  if (loading) return <p className="text-foreground-muted text-xs">Loading…</p>;

  if (lifts.length === 0) {
    return (
      <p className="text-foreground-muted text-xs">
        Log a personal best to start a trend. Every new entry for the same movement builds the chart.
      </p>
    );
  }

  return (
    <div>
      <label className="sr-only" htmlFor="pb-trend-select">Choose a movement</label>
      <select
        id="pb-trend-select"
        value={activeKey ?? ""}
        onChange={(e) => setSelected(e.target.value)}
        className="h-10 w-full bg-surface-raised/40 border border-border/60 px-3 text-bone text-sm focus:outline-none focus:border-bone"
      >
        {lifts.map((l) => (
          <option key={l.key} value={l.key}>{l.label}</option>
        ))}
      </select>

      <div className="mt-4 flex items-baseline justify-between gap-3">
        <p className="text-bone text-lg tabular">
          {last}
          {unit === "reps" ? "" : ` ${unit}`}
        </p>
        {delta !== null && (
          <p
            className={`text-[10px] uppercase tracking-widest ${
              (isTime ? delta < 0 : delta > 0) ? "text-earned" : "text-foreground-muted"
            }`}
          >
            {delta > 0 ? "+" : ""}
            {delta} since {new Date(history[0].achieved_on).toLocaleDateString("en-GB", { month: "short", year: "2-digit" })}
          </p>
        )}
      </div>

      <Sparkline values={values} direction={isTime ? "lower" : "higher"} className="mt-2" />

      <ul className="mt-3 divide-y divide-border/60">
        {history.slice(-4).reverse().map((h) => (
          <li key={h.id} className="py-2 flex items-center justify-between gap-3">
            <span className="text-foreground-muted text-[10px] uppercase tracking-widest">
              {new Date(h.achieved_on).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            <span className="text-bone text-xs tabular">
              {h.value}{h.unit === "reps" ? "" : ` ${h.unit}`}{h.reps ? ` × ${h.reps}` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
