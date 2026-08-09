import { createFileRoute } from "@tanstack/react-router";
import { TotalShell } from "@/components/total/TotalShell";
import { useAuth } from "@/lib/useAuth";
import { useTotalProgress } from "@/lib/total/progress";
import { useTotalProfile, currentTotalWeek } from "@/lib/total/store";
import { validationCounts, TOTAL, isCore, sessionId } from "@/lib/total/manifest";

export const Route = createFileRoute("/my-programmes/build-total/progress")({
  head: () => ({ meta: [{ title: "TOTAL — Progress" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: ProgressPage,
});

function ProgressPage() {
  const { user } = useAuth();
  const p = useTotalProgress(user?.id);
  const profile = useTotalProfile();
  const counts = validationCounts();
  const week = currentTotalWeek(profile.startDate) ?? 1;
  const pct = Math.round((p.coreCompleted / Math.max(1, counts.core)) * 100);
  const tests = (TOTAL.progress as { tests?: string[] }).tests ?? [];

  return (
    <TotalShell eyebrow="Performance" title="Progress">
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <Stat k="Core completed" v={`${p.coreCompleted} / ${counts.core}`} sub={`${pct}%`} />
        <Stat k="Optional completed" v={`${p.optionalCompleted} / ${counts.optional}`} />
        <Stat k="Results logged" v={`${p.resultsLogged}`} />
        <Stat k="Current week" v={`${week}`} />
      </div>

      <section>
        <p className="eyebrow mb-4">Weekly consistency</p>
        <ul className="divide-y divide-border/60">
          {TOTAL.weeks.map((w) => {
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

      {tests.length > 0 && (
        <section className="mt-12">
          <p className="eyebrow mb-4">Reference tests</p>
          <ul className="text-bone text-sm space-y-2">
            {tests.map((t) => <li key={t} className="border-t border-border/60 pt-2">{t}</li>)}
          </ul>
        </section>
      )}

      <p className="text-foreground-muted text-xs mt-10 max-w-[60ch]">
        Core completion and optional completion are counted separately. Five core sessions is a full week.
      </p>
    </TotalShell>
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