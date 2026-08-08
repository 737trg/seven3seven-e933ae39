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

  return (
    <article className="border border-signal/40 bg-surface/40 p-5 md:p-8">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="eyebrow text-signal">{isNew ? "Ready to start" : "Up next"}</p>
          <h2 className="font-display font-bold text-bone text-2xl md:text-4xl tracking-[-0.025em] mt-2 leading-[1.05]">
            {next?.title ?? programme.name}
          </h2>
          <p className="text-foreground-muted text-xs uppercase tracking-[0.2em] mt-2 truncate">
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
        <div className="h-[3px] bg-surface-raised overflow-hidden">
          <div className="h-full bg-signal" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Link
          to={next?.href ?? overviewHref}
          className="h-12 px-6 inline-flex items-center justify-center gap-2 bg-signal text-bone font-display text-[11px] uppercase tracking-[0.28em] rounded-[4px]"
        >
          {isNew ? "Start programme" : "Start session"}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          to={overviewHref}
          className="h-12 px-6 inline-flex items-center justify-center border border-border text-bone font-display text-[11px] uppercase tracking-[0.28em] rounded-[4px] hover:border-bone"
        >
          Programme
        </Link>
      </div>
    </article>
  );
}
