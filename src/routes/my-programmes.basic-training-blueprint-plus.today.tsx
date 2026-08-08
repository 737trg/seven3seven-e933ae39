import { createFileRoute, Link } from "@tanstack/react-router";
import { BtbShell } from "@/components/btb/BtbShell";
import { BTB, sessionId, allSessions } from "@/lib/btb/manifest";
import { btbStore, useBtbProfile, useBtbReadiness, currentBtbWeek, type BtbReadiness } from "@/lib/btb/store";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/my-programmes/basic-training-blueprint-plus/today")({
  head: () => ({ meta: [{ title: "Basic Training Blueprint+ — Today" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: TodayPage,
});

function TodayPage() {
  const profile = useBtbProfile();
  const readiness = useBtbReadiness();
  const week = currentBtbWeek(profile.startDate) ?? 1;
  const wk = BTB.weeks.find((w) => w.week === week)!;
  const current = wk.sessions[0];
  const currentId = sessionId(wk.week, current.session);
  const readinessValue = (readiness[currentId] ?? "ready") as BtbReadiness;
  const adj = current.readiness_adjustment ?? {};

  return (
    <BtbShell eyebrow={`Week ${wk.week} · ${wk.phase}`} title={profile.displayName ? `Good work, ${profile.displayName}.` : "Today."}>
      {!profile.setupComplete && (
        <div className="mb-8 border border-signal/40 bg-signal/10 p-5">
          <p className="eyebrow text-signal mb-1">Setup</p>
          <p className="text-bone text-sm">Complete your profile to lock in start date, units and baselines.</p>
          <Link to="/my-programmes/basic-training-blueprint-plus/profile" className="mt-3 inline-flex items-center gap-2 text-bone text-xs uppercase tracking-widest font-display">Open profile <ArrowRight className="h-3 w-3" /></Link>
        </div>
      )}

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10">
        <section>
          <p className="eyebrow text-foreground-muted">Current session</p>
          <h2 className="font-display text-bone text-3xl lg:text-4xl mt-2 tracking-tight">{current.title}</h2>
          <p className="text-foreground-muted text-sm mt-3 max-w-[60ch]">{current.purpose}</p>

          <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-[10px] uppercase tracking-[0.22em] text-foreground-muted">
            <li>Duration · <span className="text-bone">{current.duration}</span></li>
            <li>Blocks · <span className="text-bone">{current.blocks.length}</span></li>
            <li>Priority · <span className="text-bone uppercase">{current.priority}</span></li>
          </ul>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/my-programmes/basic-training-blueprint-plus/programme/s/$sessionId" params={{ sessionId: currentId }} className="h-11 px-6 inline-flex items-center bg-signal text-bone text-[11px] uppercase tracking-[0.28em] font-display">Start session</Link>
            <Link to="/my-programmes/basic-training-blueprint-plus/programme/s/$sessionId" params={{ sessionId: currentId }} className="h-11 px-6 inline-flex items-center border border-border text-bone text-[11px] uppercase tracking-[0.28em] font-display">View detail</Link>
          </div>

          <div className="mt-10">
            <p className="eyebrow mb-3">Readiness</p>
            <div className="flex gap-2">
              {(["ready", "average", "heavy"] as BtbReadiness[]).map((r) => (
                <button key={r} onClick={() => btbStore.setReadiness(currentId, r)}
                  className={`h-10 px-5 text-[10px] uppercase tracking-[0.22em] font-display border ${readinessValue === r ? "bg-bone text-obsidian border-bone" : "border-border text-bone"}`}>
                  {r}
                </button>
              ))}
            </div>
            <p className="text-foreground-muted text-xs mt-3 max-w-[60ch]">
              {readinessValue === "ready" && (adj.ready ?? "Follow the session as written.")}
              {readinessValue === "average" && (adj.average ?? "Complete every block but stay at the low end of prescribed RPE. Skip the finisher if fatigue is high.")}
              {readinessValue === "heavy" && (adj.heavy ?? "Reduce main-lift load by ~10% and cut top sets. Prioritise easy aerobic work and skip conditioning.")}
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
                    <p className="text-bone text-sm truncate">{s.title}</p>
                    <p className="text-foreground-muted text-[10px] uppercase tracking-widest">Session {s.session} · {s.duration}</p>
                    <SessionScheduleControls sessionId={id} override={schedule.bySession[id]} onSet={schedule.set} onClear={schedule.clear} />
                  </div>
                  <Link to="/my-programmes/basic-training-blueprint-plus/programme/s/$sessionId" params={{ sessionId: id }} className="text-foreground-muted hover:text-bone"><ArrowRight className="h-4 w-4" /></Link>
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

          <div className="mt-8 border-t border-border pt-5">
            <p className="eyebrow mb-2">Next session</p>
            <p className="text-bone text-sm">{nextSessionTitle(week, current.session)}</p>
          </div>
        </aside>
      </div>
    </BtbShell>
  );
}

function nextSessionTitle(week: number, session: number): string {
  const all = allSessions();
  const idx = all.findIndex((x) => x.week.week === week && x.session.session === session);
  if (idx < 0 || idx + 1 >= all.length) return "Programme complete";
  const n = all[idx + 1];
  return `${n.session.title} · W${n.week.week}`;
}