import { useState } from "react";
import { Check } from "lucide-react";
import { usePersonalRecords } from "@/lib/usePersonalRecords";
import { STANDARD_GROUPS, formatStandardValue, standardProgress } from "@/lib/benchmarks";

/** Reference standards measured against the athlete's logged personal bests. */
export function BenchmarksPanel({ userId }: { userId: string | undefined }) {
  const { items, loading } = usePersonalRecords(userId);
  const [groupKey, setGroupKey] = useState(STANDARD_GROUPS[0].key);
  const group = STANDARD_GROUPS.find((g) => g.key === groupKey) ?? STANDARD_GROUPS[0];
  const rows = group.standards.map((s) => standardProgress(s, items));
  const metCount = rows.filter((r) => r.met).length;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {STANDARD_GROUPS.map((g) => (
          <button
            key={g.key}
            type="button"
            onClick={() => setGroupKey(g.key)}
            aria-pressed={g.key === group.key}
            className={`tap press px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] font-display border ${
              g.key === group.key
                ? "border-bone text-bone"
                : "border-border/60 text-foreground-muted hover:text-bone"
            }`}
          >
            {g.title}
          </button>
        ))}
      </div>

      <p className="mt-3 text-foreground-muted text-xs">{group.blurb}</p>
      <p className="mt-1 text-foreground-muted text-[10px] uppercase tracking-widest">
        {loading ? "Loading…" : `${metCount} of ${rows.length} targets met`}
      </p>

      <ul className="mt-4 space-y-3">
        {rows.map(({ standard, best, pct, met }) => (
          <li key={standard.key}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-bone text-sm truncate">{standard.label}</p>
              <p className="text-[11px] tabular shrink-0">
                <span className={met ? "text-earned" : best ? "text-bone" : "text-foreground-muted"}>
                  {best ? formatStandardValue(best.value, best.unit) : "—"}
                </span>
                <span className="text-foreground-muted">
                  {" "}
                  / {formatStandardValue(standard.target, standard.unit)}
                </span>
              </p>
            </div>
            <div className="mt-1.5 h-1 bg-surface-raised/50 overflow-hidden">
              <div
                className={`h-full ${met ? "bg-earned" : "bg-signal"}`}
                style={{ width: `${Math.round(pct * 100)}%` }}
              />
            </div>
            {met && (
              <p className="mt-1 inline-flex items-center gap-1 text-earned text-[10px] uppercase tracking-widest">
                <Check className="h-3 w-3" /> Standard met
              </p>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-foreground-muted text-[10px] leading-relaxed">
        Reference targets for training only. SEVEN3SEVEN is independent — always check the current
        official standard for your event or assessment.
      </p>
    </div>
  );
}
