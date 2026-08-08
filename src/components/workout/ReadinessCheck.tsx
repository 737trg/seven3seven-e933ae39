import { useState } from "react";
import { Activity, ChevronDown } from "lucide-react";
import type { ReadinessAdaptation, ReadinessInput } from "@/lib/readiness";

const bandClass: Record<ReadinessAdaptation["band"], string> = {
  primed: "border-earned/50 text-earned",
  steady: "border-border text-bone",
  guarded: "border-signal/40 text-signal",
  depleted: "border-signal text-signal",
};

function Scale({
  label,
  low,
  high,
  value,
  onChange,
}: {
  label: string;
  low: string;
  high: string;
  value: number | null | undefined;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="eyebrow text-foreground-muted">{label}</span>
        <span className="text-[10px] text-foreground-muted/70">{low} → {high}</span>
      </div>
      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${label} ${n}`}
            aria-pressed={value === n}
            onClick={() => onChange(n)}
            className={`press h-10 text-xs font-display tabular border transition-colors ${
              value === n
                ? "border-signal bg-signal/15 text-bone"
                : "border-border text-foreground-muted hover:text-bone hover:border-bone"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Morning check-in that actually changes the session: the reported numbers
 * drive the suggested loads in the log drawer, not just a line of advice.
 */
export function ReadinessCheck({
  input,
  adaptation,
  logged,
  onSave,
}: {
  input: ReadinessInput;
  adaptation: ReadinessAdaptation | null;
  logged: boolean;
  onSave: (next: ReadinessInput) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ReadinessInput>(input);
  const expanded = open || !logged;

  const patch = (p: Partial<ReadinessInput>) => setDraft((d) => ({ ...d, ...p }));

  return (
    <section className={`border ${adaptation ? bandClass[adaptation.band] : "border-border"} bg-surface/40`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3 flex items-center gap-3 text-left"
      >
        <Activity className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        <span className="min-w-0 flex-1">
          <span className="block eyebrow text-foreground-muted">Readiness</span>
          <span className="block text-bone text-sm leading-snug">
            {adaptation ? `${adaptation.label} · ${adaptation.advice}` : "Check in to adapt today's loads"}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-foreground-muted transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border/60 pt-4">
          <div>
            <div className="flex items-baseline justify-between">
              <span className="eyebrow text-foreground-muted">Sleep</span>
              <span className="text-[10px] text-foreground-muted/70">hours</span>
            </div>
            <div className="mt-2 grid grid-cols-6 gap-1.5">
              {[4, 5, 6, 7, 8, 9].map((h) => (
                <button
                  key={h}
                  type="button"
                  aria-pressed={draft.sleepHours === h}
                  onClick={() => patch({ sleepHours: h })}
                  className={`press h-10 text-xs font-display tabular border transition-colors ${
                    draft.sleepHours === h
                      ? "border-signal bg-signal/15 text-bone"
                      : "border-border text-foreground-muted hover:text-bone hover:border-bone"
                  }`}
                >
                  {h === 4 ? "<5" : h === 9 ? "9+" : h}
                </button>
              ))}
            </div>
          </div>
          <Scale label="Soreness" low="none" high="wrecked" value={draft.soreness} onChange={(v) => patch({ soreness: v })} />
          <Scale label="Stress" low="calm" high="fried" value={draft.stress} onChange={(v) => patch({ stress: v })} />
          <Scale label="Energy" low="flat" high="buzzing" value={draft.energy} onChange={(v) => patch({ energy: v })} />
          <button
            type="button"
            onClick={() => {
              onSave(draft);
              setOpen(false);
            }}
            className="press w-full h-11 bg-bone text-obsidian font-display text-[11px] uppercase tracking-[0.24em]"
          >
            {logged ? "Update check-in" : "Save check-in"}
          </button>
        </div>
      )}
    </section>
  );
}