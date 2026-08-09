import { createFileRoute, Link } from "@tanstack/react-router";
import { MixedShell } from "@/components/mixed/MixedShell";
import { MIXED, isCore, sessionId, validationCounts } from "@/lib/mixed/manifest";
import { useMixedProgress } from "@/lib/mixed/progress";
import { useAuth } from "@/lib/useAuth";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/my-programmes/mixed/programme/")({
  head: () => ({ meta: [{ title: "MIXED — Programme" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: ProgrammePage,
});

function ProgrammePage() {
  const { user } = useAuth();
  const prog = useMixedProgress(user?.id);
  const counts = validationCounts();
  const corePct = Math.round((prog.coreCompleted / Math.max(1, counts.core)) * 100);

  return (
    <MixedShell eyebrow="The plan" title="Programme">
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Stat k="Weeks" v={`${counts.weeks}`} />
        <Stat k="Core sessions" v={`${prog.coreCompleted} / ${counts.core}`} sub={`${corePct}%`} />
        <Stat k="Optional sessions" v={`${prog.optionalCompleted} / ${counts.optional}`} />
      </div>

      <div className="space-y-10">
        {MIXED.weeks.map((w) => (
          <section key={w.week}>
            <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-3">
              <div>
                <p className="eyebrow text-signal">Week {w.week} · {w.phase}</p>
                <h2 className="font-display text-bone text-xl lg:text-2xl tracking-tight mt-1">{w.title}</h2>
              </div>
              {w.intensity && <span className="text-[10px] uppercase tracking-widest text-foreground-muted">Intensity · {w.intensity}</span>}
            </header>
            <ul className="divide-y divide-border/60">
              {w.sessions.map((s) => {
                const id = sessionId(w.week, s.session);
                const done = prog.perSession[id]?.completed;
                const optional = !isCore(s);
                return (
                  <li key={id} className="py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-bone text-sm flex flex-wrap items-center gap-2">
                        {done && <CheckCircle2 className="h-3.5 w-3.5 text-signal shrink-0" />}
                        <span className="min-w-0 break-words">{s.title}</span>
                        {optional && <span className="ml-1 inline-block text-[9px] uppercase tracking-widest border border-border px-1.5 py-0.5 text-foreground-muted">Optional</span>}
                      </p>
                      <p className="text-foreground-muted text-[10px] uppercase tracking-widest mt-1 break-words">
                        {s.recommended_day} · {s.pillar} · {s.duration} · {s.purpose}
                      </p>
                    </div>
                    <Link to="/my-programmes/mixed/programme/s/$sessionId" params={{ sessionId: id }} className="tap press shrink-0 text-foreground-muted hover:text-bone inline-flex items-center justify-end gap-2 text-[10px] uppercase tracking-widest">
                      View <ArrowRight className="h-3 w-3" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </MixedShell>
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