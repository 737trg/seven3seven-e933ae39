import { createFileRoute, Link } from "@tanstack/react-router";
import { HrpShell } from "@/components/hrp/HrpShell";
import { HRP, isCore, sessionId, validationCounts } from "@/lib/hrp/manifest";
import { useHrpProgress } from "@/lib/hrp/progress";
import { useHrpProfile } from "@/lib/hrp/store";
import { useAuth } from "@/lib/useAuth";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/my-programmes/hybrid-race-plan/programme")({
  head: () => ({ meta: [{ title: "HYBRID RACE PLAN — Programme" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: ProgrammePage,
});

function ProgrammePage() {
  const { user } = useAuth();
  const prog = useHrpProgress(user?.id);
  const profile = useHrpProfile();
  const counts = validationCounts();
  const corePct = Math.round((prog.coreCompleted / Math.max(1, counts.core)) * 100);

  return (
    <HrpShell eyebrow="The plan" title="Programme">
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Stat k="Weeks" v={`${counts.weeks}`} />
        <Stat k="Core sessions" v={`${prog.coreCompleted} / ${counts.core}`} sub={`${corePct}%`} />
        <Stat k="Optional sessions" v={`${prog.optionalCompleted} / ${counts.optional}`} />
      </div>

      <div className="space-y-10">
        {HRP.weeks.map((w) => (
          <section key={w.week}>
            <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-3">
              <div>
                <p className="eyebrow text-signal">Week {w.week} · {w.phase}</p>
                <h2 className="font-display text-bone text-xl lg:text-2xl tracking-tight mt-1">{w.title}</h2>
              </div>
              {w.load && <span className="text-[10px] uppercase tracking-widest text-foreground-muted">Load · {w.load}</span>}
            </header>
            <ul className="divide-y divide-border/60">
              {w.sessions.map((s) => {
                const id = sessionId(w.week, s.session);
                const done = prog.perSession[id]?.completed;
                const optional = !isCore(s);
                const hideOptional = optional && profile.mode === "five";
                return (
                  <li key={id} className={`py-4 flex items-center justify-between gap-4 ${hideOptional ? "opacity-60" : ""}`}>
                    <div className="min-w-0">
                      <p className="text-bone text-sm flex items-center gap-2">
                        {done && <CheckCircle2 className="h-3.5 w-3.5 text-signal shrink-0" />}
                        <span className="truncate">{s.title}</span>
                        {optional && <span className="ml-1 inline-block text-[9px] uppercase tracking-widest border border-border px-1.5 py-0.5 text-foreground-muted">Optional</span>}
                      </p>
                      <p className="text-foreground-muted text-[10px] uppercase tracking-widest mt-1 truncate">
                        {s.recommended_day} · {s.pillar} · {s.duration} · {s.purpose}
                      </p>
                    </div>
                    <Link to="/my-programmes/hybrid-race-plan/programme/s/$sessionId" params={{ sessionId: id }} className="shrink-0 text-foreground-muted hover:text-bone inline-flex items-center gap-2 text-[10px] uppercase tracking-widest">
                      View <ArrowRight className="h-3 w-3" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </HrpShell>
  );
}

function Stat({ k, v, sub }: { k: string; v: string; sub?: string }) {
  return (
    <div className="border-t border-border pt-4">
      <p className="eyebrow text-foreground-muted">{k}</p>
      <p className="font-display text-bone text-3xl tabular mt-2 tracking-tight">{v}</p>
      {sub && <p className="text-foreground-muted text-xs mt-1">{sub}</p>}
    </div>
  );
}