import { Link } from "@tanstack/react-router";
import { ArrowRight, Activity } from "lucide-react";
import type { CustomerProgramme, ActivityItem } from "@/lib/useCustomerDashboard";
import type { NextSession } from "@/lib/nextSession";
import type { StreakSummary } from "@/lib/streak";
import { NextSessionCard } from "@/components/dashboard/NextSessionCard";
import { ProgrammeListCard } from "@/components/dashboard/ProgrammeListCard";
import { StreakCard } from "@/components/dashboard/StreakCard";
import { SectionCard } from "@/components/dashboard/SectionCard";

export function TrainTab({
  loading,
  focus,
  focusNext,
  others,
  completed,
  primaryId,
  onPin,
  streak,
  recent,
  programmePath,
  stateLabel,
}: {
  loading: boolean;
  focus: CustomerProgramme | undefined;
  focusNext: NextSession | null;
  others: CustomerProgramme[];
  completed: CustomerProgramme[];
  primaryId: string | null;
  onPin: (p: CustomerProgramme) => void;
  streak: StreakSummary;
  recent: ActivityItem[];
  programmePath: (p: CustomerProgramme, intent: "cover" | "continue") => string;
  stateLabel: (s: CustomerProgramme["state"]) => string;
}) {
  const empty = !loading && !focus && others.length === 0 && completed.length === 0;

  return (
    <div className="space-y-6">
      {loading && !focus && (
        <div className="space-y-4" aria-hidden>
          <div className="h-44 hairline bg-surface/20 animate-pulse" />
          <div className="h-28 hairline bg-surface/20 animate-pulse" />
        </div>
      )}

      {focus && (
        <NextSessionCard programme={focus} next={focusNext} overviewHref={programmePath(focus, "cover")} />
      )}

      {empty && (
        <div className="hairline elevated p-8 text-center">
          <p className="display-sm text-bone">No programmes yet.</p>
          <p className="body-sm mt-2">Pick a plan and your first session appears here.</p>
          <Link to="/programmes" className="tap press mt-5 inline-flex items-center gap-2 eyebrow text-signal">
            Browse programmes <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {others.length > 0 && (
        <SectionCard title="Your programmes">
          <div className="space-y-4">
            {others.map((programme) => (
              <ProgrammeListCard
                key={programme.product_id}
                programme={programme}
                href={programmePath(programme, programme.state === "active" ? "continue" : "cover")}
                cta={programme.state === "ready" ? "Start programme" : "Continue training"}
                stateLabel={stateLabel(programme.state)}
                isPrimary={primaryId === programme.product_id}
                onPin={onPin}
              />
            ))}
          </div>
        </SectionCard>
      )}

      {completed.length > 0 && (
        <SectionCard title="Completed">
          <div className="space-y-4">
            {completed.map((programme) => (
              <ProgrammeListCard
                key={programme.product_id}
                programme={programme}
                href={programmePath(programme, "cover")}
                cta="View programme"
                stateLabel={stateLabel(programme.state)}
                isPrimary={primaryId === programme.product_id}
                onPin={onPin}
              />
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard title="Consistency">
        <StreakCard streak={streak} />
      </SectionCard>

      <SectionCard title="Recent activity">
        {recent.length === 0 ? (
          <div>
            <p className="body-sm">Nothing logged yet. Your completed sessions appear here.</p>
            <Link to="/programmes" className="tap press mt-4 inline-flex items-center gap-2 eyebrow text-signal">
              Browse programmes <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {recent.map((item, i) => (
              <li key={`${item.ts}-${i}`} className="flex items-start gap-3">
                <Activity className="h-3.5 w-3.5 text-signal mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-bone text-xs">{item.title}</p>
                  <p className="text-foreground-muted text-[10px] truncate">{item.sub}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
