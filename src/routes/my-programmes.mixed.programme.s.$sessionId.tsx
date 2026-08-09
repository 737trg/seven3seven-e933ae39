import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { MixedShell } from "@/components/mixed/MixedShell";
import { findSession, blockId, MIXED } from "@/lib/mixed/manifest";
import { mixedStore, useMixedTracks, useMixedProfile, type MixedTrack } from "@/lib/mixed/store";
import { Flame } from "lucide-react";

export const Route = createFileRoute("/my-programmes/mixed/programme/s/$sessionId")({
  head: () => ({ meta: [{ title: "MIXED — Session" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: SessionPage,
});

function SessionPage() {
  const { sessionId: sid } = useParams({ from: "/my-programmes/mixed/programme/s/$sessionId" });
  const ref = findSession(sid);
  const profile = useMixedProfile();
  const tracks = useMixedTracks();

  if (!ref) {
    return (
      <MixedShell eyebrow="Session" title="Not found">
        <p className="text-foreground-muted">That session does not exist in this programme.</p>
        <Link to="/my-programmes/mixed/programme" className="mt-6 inline-block text-bone underline">Back to programme</Link>
      </MixedShell>
    );
  }
  const { week, session } = ref;
  const track = (tracks[sid] ?? profile.defaultTrack) as MixedTrack;

  return (
    <MixedShell eyebrow={`Week ${week.week} · ${week.phase}`} title={session.title}>
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

          <div className="mt-8">
            <p className="eyebrow mb-3">Track for this session</p>
            <div className="flex gap-2">
              {(["rx", "scaled"] as MixedTrack[]).map((t) => (
                <button key={t} onClick={() => mixedStore.setTrack(sid, t)}
                  className={`h-10 px-5 text-[10px] uppercase tracking-[0.22em] font-display border ${track === t ? "bg-bone text-obsidian border-bone" : "border-border text-bone"}`}>
                  {t === "rx" ? "RX" : "Scaled"}
                </button>
              ))}
            </div>
          </div>

          <ol className="mt-10 space-y-6">
            {session.blocks.map((b, i) => (
              <li key={blockId(week.week, session.session, i)} className="border-t border-border pt-5">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="eyebrow text-foreground-muted">Block {String(i + 1).padStart(2, "0")}</p>
                  {b.timer && <span className="text-[10px] uppercase tracking-widest text-foreground-muted">Timer · {b.timer}</span>}
                </div>
                <h3 className="font-display text-bone text-lg lg:text-xl mt-2 tracking-tight">{b.name}</h3>
                {b.instruction && <p className="text-foreground-muted text-sm mt-2 whitespace-pre-line">{b.instruction}</p>}
                {(b.rx || b.scaled) && (
                  <div className="mt-3 text-xs text-bone bg-surface-raised/40 border border-border p-3">
                    <span className="eyebrow text-signal mr-2">{track === "rx" ? "RX" : "Scaled"}</span>
                    {track === "rx" ? b.rx ?? b.scaled : b.scaled ?? b.rx}
                  </div>
                )}
                {b.stimulus && <p className="text-foreground-muted text-xs mt-2"><span className="text-bone">Stimulus.</span> {b.stimulus}</p>}
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
              <p className="eyebrow mb-2">Readiness adjustments</p>
              {MIXED.readiness_options.map((r) =>
                session.readiness_adjustment?.[r.id] ? (
                  <p key={r.id} className="text-bone text-xs mt-2"><span className="text-signal eyebrow mr-2">{r.label}</span>{session.readiness_adjustment[r.id]}</p>
                ) : null,
              )}
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
    </MixedShell>
  );
}