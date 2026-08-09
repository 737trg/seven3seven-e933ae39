import type { ReactNode } from "react";

/** Compact stat widget: label, big figure, and a signed change beneath it. */
export function MetricStat({
  label,
  value,
  sub,
  delta,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  /** Positive means "better", negative means "worse". Null hides the row. */
  delta?: { text: string; good: boolean | null } | null;
  icon?: ReactNode;
}) {
  return (
    <div className="hairline elevated p-4 min-w-[9.5rem]">
      <div className="flex items-center justify-between gap-2">
        <p className="eyebrow text-foreground-muted">{label}</p>
        {icon && <span className="text-foreground-muted">{icon}</span>}
      </div>
      <p className="font-display text-bone text-2xl md:text-3xl tabular mt-2 tracking-tight">{value}</p>
      {delta && (
        <p
          className={`mt-1.5 text-[11px] tabular ${
            delta.good === null ? "text-foreground-muted" : delta.good ? "text-earned" : "text-signal"
          }`}
        >
          {delta.text}
        </p>
      )}
      {sub && <p className="mt-1 text-foreground-muted text-[10px] uppercase tracking-widest">{sub}</p>}
    </div>
  );
}