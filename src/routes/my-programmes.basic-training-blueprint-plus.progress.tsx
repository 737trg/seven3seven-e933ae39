import { createFileRoute } from "@tanstack/react-router";
import { BtbShell } from "@/components/btb/BtbShell";
import { useAuth } from "@/lib/useAuth";
import { useBtbProgress } from "@/lib/btb/progress";
import { useBtbProfile, currentBtbWeek } from "@/lib/btb/store";
import { validationCounts, BTB, isCore, sessionId } from "@/lib/btb/manifest";

export const Route = createFileRoute("/my-programmes/basic-training-blueprint-plus/progress")({
  head: () => ({ meta: [{ title: "Basic Training Blueprint+ — Progress" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: ProgressPage,
});

function ProgressPage() {
  const { user } = useAuth();
  const p = useBtbProgress(user?.id);
  const profile = useBtbProfile();
  const counts = validationCounts();
  const week = currentBtbWeek(profile.startDate) ?? 1;
  const pct = Math.round((p.coreCompleted / Math.max(1, counts.core)) * 100);

  return (
    <BtbShell eyebrow="Performance" title="Progress">
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <Stat k="Core completed" v={`${p.coreCompleted} / ${counts.core}`} sub={`${pct}%`} />
        <Stat k="Results logged" v={`${p.resultsLogged}`} />
        <Stat k="Current week" v={`${week}`} />
        <Stat k="Weeks total" v={`${counts.weeks}`} />
      </div>

      <section>
        <p className="eyebrow mb-4">Weekly consistency</p>
        <ul className="divide-y divide-border/60">
          {BTB.weeks.map((w) => {
            const core = w.sessions.filter(isCore);
            const coreDone = core.filter((s) => p.perSession[sessionId(w.week, s.session)]?.completed).length;
            return (
              <li key={w.week} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-bone text-sm">Week {w.week} · {w.phase}</p>
                  <p className="text-foreground-muted text-[10px] uppercase tracking-widest">{w.title}</p>
                </div>
                <div className="text-right text-[10px] uppercase tracking-widest text-foreground-muted">
                  Core <span className="text-bone tabular">{coreDone}/{core.length}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="text-foreground-muted text-xs mt-10 max-w-[60ch]">
        Strength trends, 2 km pace history and Mid-Thigh Pull PBs populate from your logged results. Complete sessions in the runner to see metrics here.
      </p>
    </BtbShell>
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