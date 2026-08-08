import { Flame } from "lucide-react";
import type { StreakSummary } from "@/lib/streak";

/** Consistency at a glance: current streak, best streak and the last 7 days. */
export function StreakCard({ streak }: { streak: StreakSummary }) {
  return (
    <div>
      <div className="flex items-baseline gap-3">
        <Flame className="h-5 w-5 text-signal shrink-0" strokeWidth={1.5} />
        <span className="font-display font-bold text-bone text-4xl tabular leading-none">{streak.current}</span>
        <span className="text-foreground-muted text-[10px] uppercase tracking-[0.22em]">
          day{streak.current === 1 ? "" : "s"} in a row
        </span>
      </div>

      <div className="mt-5 flex gap-2" aria-hidden>
        {streak.week.map((d) => (
          <div key={d.key} className="flex-1 text-center">
            <div
              className={`h-8 border ${
                d.trained ? "bg-signal border-signal" : "border-border/60 bg-surface-raised/40"
              } ${d.isToday ? "ring-1 ring-bone/50" : ""}`}
            />
            <span className="mt-1 block text-[9px] uppercase tracking-widest text-foreground-muted">{d.label}</span>
          </div>
        ))}
      </div>
      <p className="sr-only">
        {streak.thisWeekCount} sessions completed in the last seven days. Longest streak {streak.longest} days.
      </p>

      <dl className="mt-5 space-y-1.5 text-xs">
        <div className="flex justify-between gap-4">
          <dt className="text-foreground-muted">Last 7 days</dt>
          <dd className="text-bone tabular">{streak.thisWeekCount} session{streak.thisWeekCount === 1 ? "" : "s"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-foreground-muted">Longest streak</dt>
          <dd className="text-bone tabular">{streak.longest} day{streak.longest === 1 ? "" : "s"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-foreground-muted">Last trained</dt>
          <dd className="text-bone">
            {streak.lastTrainedAt
              ? new Date(streak.lastTrainedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
              : "—"}
          </dd>
        </div>
      </dl>
    </div>
  );
}