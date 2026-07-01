import { createFileRoute, Link } from "@tanstack/react-router";
import { SemShell } from "@/components/sem/SemShell";
import { SEM, allSessions, isCore, sessionId } from "@/lib/sem/manifest";
import { semStore, useSemProfile, useSemReadiness, currentSemWeek, type SemReadiness } from "@/lib/sem/store";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/my-programmes/sem-2026/today")({
  head: () => ({ meta: [{ title: "S.E.M. 2026 — Today" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: TodayPage,
});

function TodayPage() {
  const profile = useSemProfile();
  const readiness = useSemReadiness();
  const week = currentSemWeek(profile.startDate) ?? 1;
  const wk = SEM.weeks.find((w) => w.week === week)!;
  const todayName = new Date().toLocaleDateString("en-GB", { weekday: "long" });
  const todayCore = wk.sessions.find((s) => isCore(s) && s.recommended_day.toLowerCase() === todayName.toLowerCase());
  const current = todayCore ?? wk.sessions.find(isCore)!;
  const currentId = sessionId(wk.week, current.session);
  const readinessValue = (readiness[currentId] ?? "ready") as SemReadiness;
  const adj = current.readiness_adjustment ?? {};

  return (
    <SemShell eyebrow={`Week ${wk.week} · ${wk.phase}`} title={profile.displayName ? `Good work, ${profile.displayName}.` : "Today."}>
      {!profile.setupComplete && (
        <div className="mb-8 border border-signal/40 bg-signal/10 p-5">
          <p className="eyebrow text-signal mb-1">Setup</p>
          <p className="text-bone text-sm">Complete your profile to lock in start date, units and benchmarks.</p>
          <Link to="/my-programmes/sem-2026/profile" className="mt-3 inline-flex items-center gap-2 text-bone text-xs uppercase tracking-widest font-display">Open profile <ArrowRight className="h-3 w-3" /></Link>
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
            <Link to="/my-programmes/sem-2026/programme/s/$sessionId" params={{ sessionId: currentId }} className="h-11 px-6 inline-flex items-center bg-signal text-bone text-[11px] uppercase tracking-[0.28em] font-display">Start session</Link>
            <Link to="/my-programmes/sem-2026/programme/s/$sessionId" params={{ sessionId: currentId }} className="h-11 px-6 inline-flex items-center border border-border text-bone text-[11px] uppercase tracking-[0.28em] font-display">View detail</Link>
          </div>

          <div className="mt-10">
            <p className="eyebrow mb-3">Readiness</p>
            <div className="flex gap-2">
              {(["ready", "average", "heavy"] as SemReadiness[]).map((r) => (
                <button key={r} onClick={() => semStore.setReadiness(currentId, r)}
                  className={`h-10 px-5 text-[10px] uppercase tracking-[0.22em] font-display border ${readinessValue === r ? "bg-bone text-obsidian border-bone" : "border-border text-bone"}`}>
                  {r}
                </button>
              ))}
            </div>
            <p className="text-foreground-muted text-xs mt-3 max-w-[60ch]">
              {readinessValue === "ready" && (adj.ready ?? "Follow the session as written.")}
              {readinessValue === "average" && (adj.average ?? "Use the standard session and stay at the lower end of the prescribed effort.")}
              {readinessValue === "heavy" && (adj.heavy ?? "Apply the coach-written reduction in the programme manifest.")}
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
                    <p className="text-foreground-muted text-[10px] uppercase tracking-widest">{s.recommended_day} · {s.pillar} · {s.duration}{!isCore(s) && " · OPTIONAL"}</p>
                  </div>
                  <Link to="/my-programmes/sem-2026/programme/s/$sessionId" params={{ sessionId: id }} className="text-foreground-muted hover:text-bone"><ArrowRight className="h-4 w-4" /></Link>
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
    </SemShell>
  );
}

function nextSessionTitle(week: number, session: number): string {
  const all = allSessions();
  const idx = all.findIndex((x) => x.week.week === week && x.session.session === session);
  if (idx < 0 || idx + 1 >= all.length) return "Programme complete";
  const n = all[idx + 1];
  return `${n.session.title} · W${n.week.week}`;
}