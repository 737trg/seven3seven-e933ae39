import { useState } from "react";
import { CalendarDays, Undo2 } from "lucide-react";
import { DAYS, type ScheduleOverride, type OverrideAction } from "@/lib/useScheduleOverrides";

/**
 * Per-session schedule controls: move a session to another day or skip it.
 * The coach-written plan is untouched — this only records the athlete's tweak.
 */
export function SessionScheduleControls({
  sessionId,
  override,
  onSet,
  onClear,
}: {
  sessionId: string;
  override: ScheduleOverride | undefined;
  onSet: (sessionId: string, action: OverrideAction, day?: string | null) => void;
  onClear: (sessionId: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-1">
      <div className="flex items-center gap-3">
        {override ? (
          <span className="text-[10px] uppercase tracking-widest text-signal">
            {override.action === "skip" ? "Skipped" : `Moved to ${override.day_of_week}`}
          </span>
        ) : null}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-foreground-muted hover:text-bone"
        >
          <CalendarDays className="h-3 w-3" /> {override ? "Change" : "Reschedule"}
        </button>
        {override && (
          <button
            type="button"
            onClick={() => { onClear(sessionId); setOpen(false); }}
            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-foreground-muted hover:text-bone"
          >
            <Undo2 className="h-3 w-3" /> Reset
          </button>
        )}
      </div>
      {open && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {DAYS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => { onSet(sessionId, "move", d); setOpen(false); }}
              className={`h-7 px-2 border text-[10px] uppercase tracking-widest font-display ${
                override?.day_of_week === d ? "bg-bone text-obsidian border-bone" : "border-border text-bone hover:border-bone"
              }`}
            >
              {d.slice(0, 3)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => { onSet(sessionId, "skip", null); setOpen(false); }}
            className={`h-7 px-2 border text-[10px] uppercase tracking-widest font-display ${
              override?.action === "skip" ? "bg-signal text-bone border-signal" : "border-border text-foreground-muted hover:text-bone"
            }`}
          >
            Skip
          </button>
        </div>
      )}
    </div>
  );
}