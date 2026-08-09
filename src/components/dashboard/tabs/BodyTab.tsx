import { BodyOverviewPanel } from "@/components/dashboard/BodyOverviewPanel";
import { ClubLock } from "@/components/dashboard/ClubLock";
import { SectionCard } from "@/components/dashboard/SectionCard";

export function BodyTab({
  userId,
  units,
  club,
}: {
  userId: string | undefined;
  units: "kg" | "lb";
  club: boolean;
}) {
  return (
    <div className="space-y-6">
      <SectionCard title="Body metrics">
        <ClubLock unlocked={club} blurb="Track bodyweight, body fat and resting heart rate alongside your training.">
          <BodyOverviewPanel userId={userId} units={units} />
        </ClubLock>
      </SectionCard>

      <p className="body-sm">
        Log honestly and often — weekly at the same time of day is enough to see a real trend.
      </p>
    </div>
  );
}
