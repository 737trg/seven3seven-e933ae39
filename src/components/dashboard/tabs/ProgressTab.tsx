import { PerformancePanel } from "@/components/dashboard/PerformancePanel";
import { BenchmarksPanel } from "@/components/dashboard/BenchmarksPanel";
import { ClubLock } from "@/components/dashboard/ClubLock";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { MetricStat } from "@/components/dashboard/MetricStat";

export function ProgressTab({
  userId,
  units,
  club,
  totals,
}: {
  userId: string | undefined;
  units: "kg" | "lb";
  club: boolean;
  totals: { sessions: number; results: number; programmes: number; pct: number };
}) {
  return (
    <div className="space-y-6">
      <SectionCard title="Your progress">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:items-stretch">
          <div className="hairline elevated p-4 flex items-center gap-4 col-span-2">
            <ProgressRing pct={totals.pct} />
            <div>
              <p className="eyebrow text-foreground-muted">Programme completion</p>
              <p className="text-bone text-sm mt-1">Across every programme you own.</p>
            </div>
          </div>
          <MetricStat label="Sessions done" value={String(totals.sessions)} />
          <MetricStat label="Results logged" value={String(totals.results)} sub={`${totals.programmes} programmes`} />
        </div>
      </SectionCard>

      <SectionCard title="Performance">
        <PerformancePanel userId={userId} units={units} />
      </SectionCard>

      <SectionCard title="Standards">
        <ClubLock unlocked={club} blurb="Score your bests against military entry, hybrid race and strength standards.">
          <BenchmarksPanel userId={userId} />
        </ClubLock>
      </SectionCard>
    </div>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const off = c * (1 - pct / 100);
  return (
    <div className="relative h-[80px] w-[80px] shrink-0">
      <svg viewBox="0 0 70 70" className="h-full w-full -rotate-90">
        <circle cx="35" cy="35" r={r} stroke="var(--surface-raised)" strokeWidth="4" fill="none" />
        <circle cx="35" cy="35" r={r} stroke="var(--signal)" strokeWidth="4" fill="none" strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-bone font-display text-sm tabular">{pct}%</span>
    </div>
  );
}
