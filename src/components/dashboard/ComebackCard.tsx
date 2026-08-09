import { Link } from "@tanstack/react-router";
import { Flame } from "lucide-react";

/**
 * Shown when an athlete has been quiet for a few days. No guilt, no streak
 * shaming — one short line and one obvious way back in.
 */
export function ComebackCard({ daysSince, resumeTo }: { daysSince: number; resumeTo?: string }) {
  const copy =
    daysSince >= 14
      ? "It's been a couple of weeks. Start where you left off — the plan waits for you."
      : daysSince >= 7
        ? "A week off doesn't undo the work. Pick the next session and get one in."
        : "Streak's paused, not gone. One session today puts it back.";

  return (
    <div className="border border-signal/40 bg-signal/[0.06] p-5 hairline">
      <div className="flex items-start gap-3">
        <Flame className="h-5 w-5 text-signal shrink-0 mt-0.5" strokeWidth={1.5} />
        <div className="min-w-0">
          <p className="font-display text-bone uppercase text-[11px] tracking-[0.22em]">
            {daysSince} days since your last session
          </p>
          <p className="body-sm mt-1.5">{copy}</p>
          {resumeTo && (
            <Link
              to={resumeTo}
              className="tap press mt-4 inline-flex h-11 px-5 items-center bg-bone text-obsidian font-display text-[10px] uppercase tracking-[0.24em]"
            >
              Get back in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}