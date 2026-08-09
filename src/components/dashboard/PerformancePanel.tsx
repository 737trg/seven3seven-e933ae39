import { useMemo, useState } from "react";
import { Plus, TrendingUp } from "lucide-react";
import { usePersonalRecords } from "@/lib/usePersonalRecords";
import { useBodyMetrics } from "@/lib/useBodyMetrics";
import {
  comparableValue,
  estimatedOneRm,
  formatSeconds,
  paceLabel,
  summariseRecords,
  type MovementSummary,
} from "@/lib/movementCatalogue";
import { MetricStat } from "./MetricStat";
import { LogPbSheet } from "./LogPbSheet";
import { MovementTrendSheet } from "./MovementTrendSheet";
import { Sparkline } from "./Sparkline";

type Filter = "strength" | "cardio";

/** Categorised personal-best board: strength vs cardio, with trends per movement. */
export function PerformancePanel({ userId, units }: { userId: string | undefined; units: "kg" | "lb" }) {
  const { items, loading, add, remove } = usePersonalRecords(userId);
  const { items: body } = useBodyMetrics(userId);
  const [filter, setFilter] = useState<Filter>("strength");
  const [logging, setLogging] = useState(false);
  const [openSummary, setOpenSummary] = useState<string | null>(null);

  const summaries = useMemo(() => summariseRecords(items), [items]);
  const bodyweight = useMemo(() => body.find((b) => b.weight_kg != null)?.weight_kg ?? null, [body]);

  const strength = summaries.filter((s) => s.category !== "cardio");
  const cardio = summaries.filter((s) => s.category === "cardio");
  const shown = filter === "strength" ? strength : cardio;

  const thisMonth = useMemo(() => {
    const start = new Date();
    start.setDate(1);
    const iso = start.toISOString().slice(0, 10);
    return summaries.filter((s) => s.best.achieved_on >= iso).length;
  }, [summaries]);

  const active = summaries.find((s) => s.key === openSummary) ?? null;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricStat label="Movements tracked" value={String(summaries.length)} />
        <MetricStat label="PBs this month" value={String(thisMonth)} icon={<TrendingUp className="h-3.5 w-3.5" />} />
        <MetricStat label="Strength" value={String(strength.length)} sub="benchmarks" />
        <MetricStat label="Cardio" value={String(cardio.length)} sub="benchmarks" />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="inline-flex border border-border/60 p-0.5">
          {(["strength", "cardio"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`tap press px-4 py-2 font-display text-[10px] uppercase tracking-[0.22em] ${
                filter === f ? "bg-bone text-obsidian" : "text-foreground-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setLogging(true)}
          className="tap press inline-flex items-center gap-2 px-4 py-2 border border-border text-bone font-display text-[10px] uppercase tracking-[0.22em] hover:border-bone"
        >
          <Plus className="h-3.5 w-3.5" /> Log PB
        </button>
      </div>

      <div className="mt-4">
        {loading ? (
          <p className="text-foreground-muted text-xs">Loading your bests…</p>
        ) : shown.length === 0 ? (
          <p className="text-foreground-muted text-xs">
            No {filter} benchmarks yet. Log one to start building the picture.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {shown.map((s) => (
              <MovementCard key={s.key} summary={s} bodyweight={bodyweight} onOpen={() => setOpenSummary(s.key)} />
            ))}
          </div>
        )}
      </div>

      <LogPbSheet open={logging} onClose={() => setLogging(false)} defaultUnit={units} onSave={add} />
      <MovementTrendSheet summary={active} onClose={() => setOpenSummary(null)} onDelete={(id) => void remove(id)} />
    </div>
  );
}

function MovementCard({
  summary,
  bodyweight,
  onOpen,
}: {
  summary: MovementSummary;
  bodyweight: number | null;
  onOpen: () => void;
}) {
  const value = comparableValue(summary.best);
  const isTime = summary.metric === "time";
  const display = isTime
    ? formatSeconds(value)
    : summary.metric === "reps"
      ? `${summary.best.value}`
      : `${summary.best.value}`;
  const suffix = isTime ? "" : summary.metric === "reps" ? " reps" : ` ${summary.unit}`;

  const secondary = isTime
    ? paceLabel(summary.movement, value)
    : summary.metric === "load"
      ? [
          summary.best.reps ? `e1RM ${estimatedOneRm(summary.best.value, summary.best.reps)} ${summary.unit}` : null,
          bodyweight && summary.unit === "kg"
            ? `${(summary.best.value / bodyweight).toFixed(2)}× bodyweight`
            : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : null;

  const delta =
    summary.improvement && summary.improvement > 0
      ? isTime
        ? `−${formatSeconds(summary.improvement)} since first log`
        : `+${Math.round(summary.improvement * 10) / 10}${suffix} since first log`
      : null;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="tap press hairline elevated p-4 text-left w-full hover:border-bone/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-bone text-sm truncate">{summary.label}</p>
          <p className="text-foreground-muted text-[10px] uppercase tracking-widest mt-0.5">{summary.group}</p>
        </div>
        <span className="text-foreground-muted text-[10px] tabular shrink-0">
          {new Date(summary.best.achieved_on).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
        </span>
      </div>

      <p className="font-display text-bone text-2xl tabular mt-3 tracking-tight">
        {display}
        <span className="text-base text-foreground-muted">{suffix}</span>
      </p>

      {secondary && <p className="text-foreground-muted text-[11px] mt-1 tabular">{secondary}</p>}
      {delta && <p className="text-earned text-[11px] mt-1 tabular">{delta}</p>}

      {summary.history.length > 1 && (
        <div className="mt-3 opacity-80">
          <Sparkline values={summary.history.map((r) => comparableValue(r))} direction={summary.direction} />
        </div>
      )}
    </button>
  );
}