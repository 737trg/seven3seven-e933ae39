import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { TotalShell } from "@/components/total/TotalShell";
import { findSession, blockId, TOTAL } from "@/lib/total/manifest";

import { Flame } from "lucide-react";

export const Route = createFileRoute("/my-programmes/build-total/programme/s/$sessionId")({
  head: () => ({ meta: [{ title: "TOTAL — Session" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: SessionPage,
});

function SessionPage() {
  const { sessionId: sid } = useParams({ from: "/my-programmes/build-total/programme/s/$sessionId" });
  const ref = findSession(sid);

  if (!ref) {
    return (
      <TotalShell eyebrow="Session" title="Not found">
        <p className="text-foreground-muted">That session does not exist in this programme.</p>
        <Link to="/my-programmes/build-total/programme" className="mt-6 inline-block text-bone underline">Back to programme</Link>
      </TotalShell>
    );
  }
  const { week, session } = ref;

  return (
    <TotalShell eyebrow={`Week ${week.week} · ${week.phase}`} title={session.title}>
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
          {session.education && (
            <div className="mt-4 border-l-2 border-border pl-4">
              <p className="eyebrow mb-1">Why this session</p>
              <p className="text-foreground-muted text-sm">{session.education}</p>
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
                {b.rest && <p className="text-foreground-muted text-xs mt-2"><span className="text-bone">Rest.</span> {b.rest}</p>}
                                {b.standard && <p className="text-foreground-muted text-xs mt-2"><span className="text-bone">Standard.</span> {b.standard}</p>}
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
              <p className="eyebrow mb-2">Readiness rule</p>
              <p className="text-bone text-xs">{session.readiness_adjustment}</p>
              {TOTAL.readiness_options.map((r) => (
                <p key={r.id} className="text-foreground-muted text-xs mt-2"><span className="text-signal eyebrow mr-2">{r.label}</span>{r.action}</p>
              ))}
            </div>
          )}
          {session.log_fields && session.log_fields.length > 0 && (
            <div className="mt-6 border border-border p-5">
              <p className="eyebrow mb-2">Log after training</p>
              <ul className="text-bone text-xs space-y-1">
                {session.log_fields.map((f) => <li key={f}>· {f}</li>)}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </TotalShell>
  );
}