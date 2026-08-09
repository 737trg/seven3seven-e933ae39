import { createFileRoute, Link } from "@tanstack/react-router";
import { MixedShell } from "@/components/mixed/MixedShell";
import { MIXED, isCore, sessionId } from "@/lib/mixed/manifest";
import { mixedStore, useMixedProfile, useMixedReadiness, useMixedTracks, currentMixedWeek, type MixedReadiness, type MixedTrack } from "@/lib/mixed/store";
import { ArrowRight } from "lucide-react";
import pdfAsset from "@/assets/mixed-download.pdf.asset.json";
import { PdfDownloadLink } from "@/components/dashboard/PdfDownloadLink";
import { useScheduleOverrides } from "@/lib/useScheduleOverrides";
import { SessionScheduleControls } from "@/components/dashboard/SessionScheduleControls";

export const Route = createFileRoute("/my-programmes/mixed/today")({
  head: () => ({ meta: [{ title: "MIXED — Today" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: TodayPage,
});

function TodayPage() {
  const profile = useMixedProfile();
  const readiness = useMixedReadiness();
  const tracks = useMixedTracks();
  const schedule = useScheduleOverrides("mixed");
  const week = currentMixedWeek(profile.startDate) ?? 1;
  const wk = MIXED.weeks.find((w) => w.week === week) ?? MIXED.weeks[0];
  const todayName = new Date().toLocaleDateString("en-GB", { weekday: "long" });
  const todayCore = wk.sessions.find((s) => isCore(s) && s.recommended_day.toLowerCase() === todayName.toLowerCase());
  const current = todayCore ?? wk.sessions.find(isCore)!;
  const currentId = sessionId(wk.week, current.session);
  const readinessValue = (readiness[currentId] ?? "ready") as MixedReadiness;
  const track = (tracks[currentId] ?? profile.defaultTrack) as MixedTrack;
  const adj = current.readiness_adjustment ?? {};

  return (
    <MixedShell eyebrow={`Week ${wk.week} · ${wk.phase}`} title={profile.displayName ? `Good work, ${profile.displayName}.` : "Today."}>
      {!profile.setupComplete && (
        <div className="mb-8 border border-signal/40 bg-signal/10 p-5">
          <p className="eyebrow text-signal mb-1">Setup</p>
          <p className="text-bone text-sm">Set your start date, equipment and movement options so sessions match what you can actually do.</p>
          <Link to="/my-programmes/mixed/profile" className="mt-3 inline-flex items-center gap-2 text-bone text-xs uppercase tracking-widest font-display">Open profile <ArrowRight className="h-3 w-3" /></Link>
        </div>
      )}

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10">
        <section>
          <p className="eyebrow text-foreground-muted">Current session</p>
          <h2 className="font-display text-bone text-3xl lg:text-4xl mt-2 tracking-tight">{current.title}</h2>
          <p className="text-foreground-muted text-sm mt-3 max-w-[60ch]">{current.purpose}</p>

          <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-[10px] uppercase tracking-[0.22em] text-foreground-muted">
            <li>Pillar · <span className="text-bone">{current.pillar}</span></li>
            <li>Duration · <span className="text-bone">{current.duration}</span></li>
            <li>Blocks · <span className="text-bone">{current.blocks.length}</span></li>
          </ul>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/my-programmes/mixed/programme/s/$sessionId" params={{ sessionId: currentId }} className="h-11 px-6 inline-flex items-center bg-signal text-bone text-[11px] uppercase tracking-[0.28em] font-display">Start session</Link>
            <Link to="/my-programmes/mixed/programme" className="h-11 px-6 inline-flex items-center border border-border text-bone text-[11px] uppercase tracking-[0.28em] font-display">Full programme</Link>
            <PdfDownloadLink slug="mixed" href={pdfAsset.url} label="PDF" />
          </div>

          <div className="mt-10">
            <p className="eyebrow mb-3">Today's track</p>
            <div className="flex gap-2">
              {(["rx", "scaled"] as MixedTrack[]).map((t) => (
                <button key={t} onClick={() => mixedStore.setTrack(currentId, t)}
                  className={`h-10 px-5 text-[10px] uppercase tracking-[0.22em] font-display border ${track === t ? "bg-bone text-obsidian border-bone" : "border-border text-bone"}`}>
                  {t === "rx" ? "RX" : "Scaled"}
                </button>
              ))}
            </div>
            <p className="text-foreground-muted text-xs mt-3 max-w-[60ch]">
              Scaled is coached training, not a failed version of RX. Choose RX only when the prescription keeps the stated stimulus, set sizes and target time.
            </p>
          </div>

          <div className="mt-10">
            <p className="eyebrow mb-3">Readiness</p>
            <div className="flex flex-wrap gap-2">
              {MIXED.readiness_options.map((r) => (
                <button key={r.id} onClick={() => mixedStore.setReadiness(currentId, r.id as MixedReadiness)}
                  className={`h-10 px-4 text-[10px] uppercase tracking-[0.22em] font-display border ${readinessValue === r.id ? "bg-bone text-obsidian border-bone" : "border-border text-bone"}`}>
                  {r.label}
                </button>
              ))}
            </div>
            <p className="text-foreground-muted text-xs mt-3 max-w-[60ch]">
              {adj[readinessValue] ?? MIXED.readiness_options.find((r) => r.id === readinessValue)?.action}
            </p>
          </div>
        </section>

        <aside>
          <p className="eyebrow mb-4">This week</p>
          <ul className="divide-y divide-border/60">
            {wk.sessions.map((s) => {
              const id = sessionId(wk.week, s.session);
              return (
                <li key={id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-bone text-sm break-words">{s.title}</p>
                    <p className="text-foreground-muted text-[10px] uppercase tracking-widest">{s.recommended_day} · {s.pillar} · {s.duration}{!isCore(s) && " · OPTIONAL"}</p>
                    <SessionScheduleControls sessionId={id} override={schedule.bySession[id]} onSet={schedule.set} onClear={schedule.clear} />
                  </div>
                  <Link to="/my-programmes/mixed/programme/s/$sessionId" params={{ sessionId: id }} className="text-foreground-muted hover:text-bone"><ArrowRight className="h-4 w-4" /></Link>
                </li>
              );
            })}
          </ul>

          {wk.checkpoint && (
            <div className="mt-8 border-t border-border pt-5">
              <p className="eyebrow mb-2">Key checkpoint</p>
              <p className="text-bone text-sm">{wk.checkpoint}</p>
            </div>
          )}

          {wk.objective && (
            <div className="mt-8 border-t border-border pt-5">
              <p className="eyebrow mb-2">Week objective</p>
              <p className="text-bone text-sm">{wk.objective}</p>
            </div>
          )}
        </aside>
      </div>
    </MixedShell>
  );
}