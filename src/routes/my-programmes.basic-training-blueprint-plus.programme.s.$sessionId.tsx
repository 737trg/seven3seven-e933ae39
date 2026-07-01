import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { BtbShell } from "@/components/btb/BtbShell";
import { findSession, blockId } from "@/lib/btb/manifest";

export const Route = createFileRoute("/my-programmes/basic-training-blueprint-plus/programme/s/$sessionId")({
  head: () => ({ meta: [{ title: "Basic Training Blueprint+ — Session" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: SessionPage,
});

function SessionPage() {
  const { sessionId: sid } = useParams({ from: "/my-programmes/basic-training-blueprint-plus/programme/s/$sessionId" });
  const ref = findSession(sid);

  if (!ref) {
    return (
      <BtbShell eyebrow="Session" title="Not found">
        <p className="text-foreground-muted">That session does not exist in this programme.</p>
        <Link to="/my-programmes/basic-training-blueprint-plus/programme" className="mt-6 inline-block text-bone underline">Back to programme</Link>
      </BtbShell>
    );
  }
  const { week, session } = ref;

  return (
    <BtbShell eyebrow={`Week ${week.week} · ${week.phase}`} title={session.title}>
      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-10">
        <div>
          <p className="text-foreground-muted text-sm max-w-[60ch]">{session.purpose}</p>
          <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-[10px] uppercase tracking-[0.22em] text-foreground-muted">
            <li>Session · <span className="text-bone">{session.session}</span></li>
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
          <div className="border border-border p-5">
            <p className="eyebrow mb-2">Live runner</p>
            <p className="text-foreground-muted text-sm">The block-by-block runner with timers and per-set logging arrives in the next release. Results logged in the database appear in your progress.</p>
          </div>
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
    </BtbShell>
  );
}