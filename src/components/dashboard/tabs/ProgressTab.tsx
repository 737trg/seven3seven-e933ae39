import { PersonalRecordsPanel } from "@/components/dashboard/PersonalRecordsPanel";
import { PbTrendPanel } from "@/components/dashboard/PbTrendPanel";
import { BenchmarksPanel } from "@/components/dashboard/BenchmarksPanel";
import { ClubLock } from "@/components/dashboard/ClubLock";
import { SectionCard } from "@/components/dashboard/SectionCard";

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
        <div className="flex items-center gap-5">
          <ProgressRing pct={totals.pct} />
          <div className="space-y-1.5 text-xs min-w-0 flex-1">
            <Row k="Sessions completed" v={String(totals.sessions)} />
            <Row k="Results logged" v={String(totals.results)} />
            <Row k="Programmes owned" v={String(totals.programmes)} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Personal records">
        <PersonalRecordsPanel userId={userId} defaultUnit={units} />
      </SectionCard>

      <SectionCard title="PB trend">
        <ClubLock unlocked={club} blurb="See how each lift has moved over time.">
          <PbTrendPanel userId={userId} />
        </ClubLock>
      </SectionCard>

      <SectionCard title="Standards">
        <ClubLock unlocked={club} blurb="Score your bests against military entry, hybrid race and strength standards.">
          <BenchmarksPanel userId={userId} />
        </ClubLock>
      </SectionCard>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-foreground-muted">{k}</span>
      <span className="text-bone tabular">{v}</span>
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
