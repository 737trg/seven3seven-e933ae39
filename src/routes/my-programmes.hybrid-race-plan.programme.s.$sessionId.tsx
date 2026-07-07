import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { HrpShell } from "@/components/hrp/HrpShell";
import { findSession, blockId } from "@/lib/hrp/manifest";
import { useHrpProfile } from "@/lib/hrp/store";
import { Flame } from "lucide-react";

export const Route = createFileRoute("/my-programmes/hybrid-race-plan/programme/s/$sessionId")({
  head: () => ({ meta: [{ title: "HYBRID RACE PLAN — Session" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: SessionPage,
});

function SessionPage() {
  const { sessionId: sid } = useParams({ from: "/my-programmes/hybrid-race-plan/programme/s/$sessionId" });
  const ref = findSession(sid);
  const profile = useHrpProfile();

  if (!ref) {
    return (
      <HrpShell eyebrow="Session" title="Not found">
        <p className="text-foreground-muted">That session does not exist in this programme.</p>
        <Link to="/my-programmes/hybrid-race-plan/programme" className="mt-6 inline-block text-bone underline">Back to programme</Link>
      </HrpShell>
    );
  }
  const { week, session } = ref;
  const categoryKey = profile.event === "HYROX" ? "HYROX" : "HYBRID_GAMES";

  return (
    <HrpShell eyebrow={`Week ${week.week} · ${week.phase}`} title={session.title}>
      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-10">
        <div>
          <p className="text-foreground-muted text-sm max-w-[60ch]">{session.purpose}</p>
          <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-[10px] uppercase tracking-[0.22em] text-foreground-muted">
            <li>Day · <span className="text-bone">{session.recommended_day}</span></li>
            <li>Pillar · <span className="text-bone">{session.pillar}</span></li>
            <li>Duration · <span className="text-bone">{session.duration}</span></li>
            <li>Blocks · <span className="text-bone">{session.blocks.length}</span></li>
            <li>Priority · <span className="text-bone uppercase">{session.priority}</span></li>
          </ul>
          {session.coach_note && (
            <div className="mt-6 border-l-2 border-signal pl-4">
              <p className="eyebrow text-signal mb-1">Coach note</p>
              <p className="text-bone text-sm">{session.coach_note}</p>
            </div>
          )}

          <ol className="mt-10 space-y-6">
            {session.blocks.map((b, i) => (
              <li key={blockId(week.week, session.session, i)} className="border-t border-border pt-5">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="eyebrow text-foreground-muted">Block {String(i + 1).padStart(2, "0")}</p>
                  {b.timer && <span className="text-[10px] uppercase tracking-widest text-foreground-muted">Timer · {b.timer}</span>}
                </div>
                <h3 className="font-display text-bone text-lg lg:text-xl mt-2 tracking-tight">{b.name}</h3>
                {b.instruction && <p className="text-foreground-muted text-sm mt-2 whitespace-pre-line">{b.instruction}</p>}
                {b.category_specific && b.category_specific[categoryKey] && (
                  <div className="mt-3 text-xs text-bone bg-surface-raised/40 border border-border p-3">
                    <span className="eyebrow text-signal mr-2">{categoryKey.replace("_", " · ")}</span>
                    {typeof b.category_specific[categoryKey] === "string" ? b.category_specific[categoryKey] : JSON.stringify(b.category_specific[categoryKey])}
                  </div>
                )}
                {b.rpe && <p className="text-[10px] uppercase tracking-widest text-foreground-muted mt-3">RPE · <span className="text-bone">{b.rpe}</span></p>}
                {b.rest && <p className="text-[10px] uppercase tracking-widest text-foreground-muted mt-1">Rest · <span className="text-bone">{b.rest}</span></p>}
                {b.scaling && <p className="text-foreground-muted text-xs mt-2"><span className="text-bone">Scaling.</span> {b.scaling}</p>}
                {b.log && b.log.length > 0 && (
                  <p className="mt-3 text-[10px] uppercase tracking-widest text-foreground-muted">Log · <span className="text-bone">{b.log.join(", ")}</span></p>
                )}
              </li>
            ))}
          </ol>
        </div>

        <aside>
          <Link
            to="/workout/$sessionId"
            params={{ sessionId: sid }}
            className="w-full inline-flex items-center justify-center gap-2 h-14 px-7 text-sm font-display font-medium uppercase tracking-wide bg-signal text-bone hover:bg-signal/90 rounded-[4px]"
          >
            <Flame className="h-4 w-4" /> Start session
          </Link>
          <p className="mt-3 text-foreground-muted text-xs">
            Launches the block-by-block runner with timers, per-set logging and autosave.
          </p>
          {session.readiness_adjustment && (
            <div className="mt-6 border border-border p-5">
              <p className="eyebrow mb-2">Readiness adjustments</p>
              {session.readiness_adjustment.ready && <p className="text-bone text-xs mt-2"><span className="text-signal eyebrow mr-2">Ready</span>{session.readiness_adjustment.ready}</p>}
              {session.readiness_adjustment.average && <p className="text-bone text-xs mt-2"><span className="text-signal eyebrow mr-2">Average</span>{session.readiness_adjustment.average}</p>}
              {session.readiness_adjustment.heavy && <p className="text-bone text-xs mt-2"><span className="text-signal eyebrow mr-2">Heavy</span>{session.readiness_adjustment.heavy}</p>}
            </div>
          )}
        </aside>
      </div>
    </HrpShell>
  );
}