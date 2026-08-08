import { Link } from "@tanstack/react-router";
import { ArrowRight, Flame } from "lucide-react";
import type { CustomerProgramme } from "@/lib/useCustomerDashboard";
import type { NextSession } from "@/lib/nextSession";

/**
 * The one thing an athlete opens the app for: their next session, one tap away.
 * Sits directly under the page header so it is above the fold on a phone.
 */
export function NextSessionCard({
  programme,
  next,
  overviewHref,
}: {
  programme: CustomerProgramme;
  next: NextSession | null;
  overviewHref: string;
}) {
  // Fall back to completed-session count when no percentage is stored yet.
  const stored = programme.enrolment?.completion_pct ?? null;
  const derived = next && next.total > 0 ? Math.round((next.done / next.total) * 100) : 0;
  const pct = stored !== null && stored > 0 ? Math.round(stored) : derived;
  const isNew = programme.state === "ready";

  // Plans advance by completion, not by calendar — so a missed week never
  // leaves stale sessions behind. Say so, rather than letting a long gap
  // feel like failure.
  const lastAt = programme.completions
    .map((c) => c.completed_at)
    .sort()
    .pop();
  const daysSince = lastAt
    ? Math.floor((Date.now() - new Date(lastAt).getTime()) / 86_400_000)
    : null;
  const returning = !isNew && daysSince !== null && daysSince >= 10;

  return (
    <article className="hairline border-signal/40 elevated p-5 md:p-8">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="eyebrow text-signal">{isNew ? "Ready to start" : "Up next"}</p>
          <h2 className="display-md text-bone mt-2">
            {next?.title ?? programme.name}
          </h2>
          <p className="text-foreground-muted text-[11px] uppercase tracking-[0.18em] mt-2 break-words">
            {programme.name}
            {next?.week ? ` · Week ${next.week}` : ""}
          </p>
        </div>
        <Flame className="h-5 w-5 text-signal shrink-0" strokeWidth={1.5} />
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-foreground-muted mb-2">
          <span>{next ? `${next.done} of ${next.total} sessions` : "Progress"}</span>
          <span className="text-bone tabular">{pct}%</span>
        </div>
        <div className="h-[3px] bg-surface-raised overflow-hidden rounded-full">
          <div className="h-full bg-signal transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Link
          to={next?.href ?? overviewHref}
          className="press h-12 px-6 inline-flex items-center justify-center gap-2 bg-signal text-bone font-display text-[11px] uppercase tracking-[0.24em] rounded-[4px]"
        >
          {isNew ? "Start programme" : "Start session"}
          <ArrowRight className="h-3.5 w-3.5 shrink-0" />
        </Link>
        <Link
          to={overviewHref}
          className="press h-12 px-6 inline-flex items-center justify-center border border-border text-bone font-display text-[11px] uppercase tracking-[0.24em] rounded-[4px] hover:border-bone"
        >
          Programme
        </Link>
      </div>
    </article>
  );
}
