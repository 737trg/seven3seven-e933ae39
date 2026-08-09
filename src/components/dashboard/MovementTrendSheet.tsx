import { Sheet } from "./Sheet";
import { LineChart } from "./LineChart";
import {
  comparableValue,
  estimatedOneRm,
  formatSeconds,
  paceLabel,
  type MovementSummary,
} from "@/lib/movementCatalogue";

/** Full history for one movement: chart, best, and every logged attempt. */
export function MovementTrendSheet({
  summary,
  onClose,
  onDelete,
}: {
  summary: MovementSummary | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  if (!summary) return null;

  const isTime = summary.metric === "time";
  const format = (v: number) =>
    isTime ? formatSeconds(v) : summary.metric === "reps" ? `${Math.round(v)} reps` : `${v} ${summary.unit}`;

  const points = summary.history.map((r) => ({ date: r.achieved_on, value: comparableValue(r) }));
  const pace = isTime ? paceLabel(summary.movement, comparableValue(summary.best)) : null;

  return (
    <Sheet open onClose={onClose} title={summary.label}>
      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat label="Best" value={format(comparableValue(summary.best))} />
        <Stat label="Attempts" value={String(summary.history.length)} />
        <Stat
          label={summary.direction === "lower" ? "Time cut" : "Gained"}
          value={summary.improvement ? format(Math.abs(summary.improvement)).replace(/ .*/, (m) => m) : "—"}
        />
      </div>

      {pace && <p className="mt-3 text-foreground-muted text-xs">Best pace {pace}</p>}
      {summary.metric === "load" && summary.best.reps ? (
        <p className="mt-3 text-foreground-muted text-xs">
          Estimated 1RM {estimatedOneRm(summary.best.value, summary.best.reps)} {summary.unit}
        </p>
      ) : null}

      {points.length > 1 ? (
        <div className="mt-6">
          <LineChart points={points} direction={summary.direction} format={format} />
        </div>
      ) : (
        <p className="mt-6 text-foreground-muted text-xs">Log this movement again to unlock the trend line.</p>
      )}

      <div className="mt-6 pt-5 border-t border-border/60 space-y-2">
        <p className="eyebrow text-foreground-muted">History</p>
        {summary.history
          .slice()
          .reverse()
          .map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 py-1.5 text-xs">
              <span className="text-foreground-muted tabular">
                {new Date(r.achieved_on).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
              </span>
              <span className="text-bone tabular flex-1 text-right">
                {format(comparableValue(r))}
                {r.reps ? ` × ${r.reps}` : ""}
              </span>
              <button
                type="button"
                onClick={() => onDelete(r.id)}
                aria-label={`Delete ${summary.label} entry`}
                className="tap press text-foreground-muted hover:text-signal"
              >
                Delete
              </button>
            </div>
          ))}
      </div>
    </Sheet>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border/60 py-3">
      <p className="text-foreground-muted text-[9px] uppercase tracking-widest">{label}</p>
      <p className="text-bone font-display text-lg tabular mt-1">{value}</p>
    </div>
  );
}