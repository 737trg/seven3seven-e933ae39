import { createFileRoute } from "@tanstack/react-router";
import { SemShell } from "@/components/sem/SemShell";
import { useAuth } from "@/lib/useAuth";
import { useSemProgress } from "@/lib/sem/progress";
import { useSemProfile, currentSemWeek } from "@/lib/sem/store";
import { validationCounts, SEM, isCore, sessionId } from "@/lib/sem/manifest";

export const Route = createFileRoute("/my-programmes/sem-2026/progress")({
  head: () => ({ meta: [{ title: "S.E.M 2026 — Progress" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: ProgressPage,
});

function ProgressPage() {
  const { user } = useAuth();
  const p = useSemProgress(user?.id);
  const profile = useSemProfile();
  const counts = validationCounts();
  const week = currentSemWeek(profile.startDate) ?? 1;
  const pct = Math.round((p.coreCompleted / Math.max(1, counts.core)) * 100);

  return (
    <SemShell eyebrow="Performance" title="Progress">
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <Stat k="Core completed" v={`${p.coreCompleted} / ${counts.core}`} sub={`${pct}%`} />
        <Stat k="Optional completed" v={`${p.optionalCompleted} / ${counts.optional}`} />
        <Stat k="Results logged" v={`${p.resultsLogged}`} />
        <Stat k="Current week" v={`${week}`} />
      </div>

      <section>
        <p className="eyebrow mb-4">Weekly consistency</p>
        <ul className="divide-y divide-border/60">
          {SEM.weeks.map((w) => {
            const core = w.sessions.filter(isCore);
            const opt = w.sessions.filter((s) => !isCore(s));
            const coreDone = core.filter((s) => p.perSession[sessionId(w.week, s.session)]?.completed).length;
            const optDone = opt.filter((s) => p.perSession[sessionId(w.week, s.session)]?.completed).length;
            return (
              <li key={w.week} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-bone text-sm">Week {w.week} · {w.phase}</p>
                  <p className="text-foreground-muted text-[10px] uppercase tracking-widest">{w.title}</p>
                </div>
                <div className="text-right text-[10px] uppercase tracking-widest text-foreground-muted">
                  Core <span className="text-bone tabular">{coreDone}/{core.length}</span>
                  <span className="mx-2">·</span>
                  Optional <span className="text-bone tabular">{optDone}/{opt.length}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="text-foreground-muted text-xs mt-10 max-w-[60ch]">
        Strength trend lines, pace charts and per-block analytics populate from your logged results. Complete sessions in the live runner to see metrics here.
      </p>
    </SemShell>
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