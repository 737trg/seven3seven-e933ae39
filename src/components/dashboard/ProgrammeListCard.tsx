import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Star } from "lucide-react";
import type { CustomerProgramme } from "@/lib/useCustomerDashboard";

/** A whole-card tap target for one owned programme. */
export function ProgrammeListCard({
  programme,
  href,
  cta,
  stateLabel,
  isPrimary,
  onPin,
}: {
  programme: CustomerProgramme;
  href: string;
  cta: string;
  stateLabel: string;
  isPrimary: boolean;
  onPin: (p: CustomerProgramme) => void;
}) {
  const pct = Math.round(programme.enrolment?.completion_pct ?? 0);
  const showProgress = !!programme.enrolment && (pct > 0 || programme.completions.length > 0);

  return (
    <article className="relative hairline bg-surface/20 hover:border-bone/40 transition-colors">
      <Link to={href} className="press block p-5 md:p-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0 pr-12">
            <p className="eyebrow text-foreground-muted break-words">{programme.collection}</p>
            <h3 className="display-sm md:display-md text-bone mt-1.5">
              {programme.name}
            </h3>
          </div>
        </div>

        <ul className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] uppercase tracking-[0.2em] text-foreground-muted">
          <li className="inline-flex items-center gap-2">
            <CalendarDays className="h-3 w-3 shrink-0" />
            {programme.duration_weeks ? `${programme.duration_weeks} weeks` : "Programme"}
          </li>
          <li className="border border-border/60 px-2 py-1 text-bone leading-none">{stateLabel}</li>
        </ul>

        {showProgress && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-foreground-muted mb-2">
              <span>Progress</span>
              <span className="text-bone tabular">{pct}%</span>
            </div>
        <div className="h-[2px] bg-surface-raised overflow-hidden rounded-full">
              <div className="h-full bg-signal transition-[width] duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        <span className="mt-5 inline-flex items-center gap-2 text-bone font-display uppercase text-[11px] tracking-[0.28em]">
          {cta} <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </Link>

      <button
        type="button"
        onClick={() => onPin(programme)}
        aria-pressed={isPrimary}
        title={isPrimary ? "Remove as focus programme" : "Make this my focus programme"}
        className={`absolute top-2 right-2 tap inline-flex items-center justify-center transition-colors ${
          isPrimary ? "text-signal" : "text-foreground-muted hover:text-bone"
        }`}
      >
        <Star className="h-4 w-4" fill={isPrimary ? "currentColor" : "none"} />
        <span className="sr-only">{isPrimary ? "Focus programme" : "Set as focus programme"}</span>
      </button>
    </article>
  );
}
