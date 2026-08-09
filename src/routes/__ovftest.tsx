import { createFileRoute } from "@tanstack/react-router";
import { MetricStat } from "@/components/dashboard/MetricStat";
import { MacroRing } from "@/components/dashboard/nutrition/MacroRing";

export const Route = createFileRoute("/__ovftest")({ component: T });

function T() {
  return (
    <div className="max-w-[1200px] mx-auto container-x py-6 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricStat label="Movements tracked" value="12" />
        <MetricStat label="Current" value="102.5 kg" delta={{ text: "+3.4 kg since start", good: null }} />
        <MetricStat label="Results logged" value="1284" sub="4 programmes" />
        <MetricStat label="Resting HR" value="52" sub="bpm" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MacroRing label="Calories" consumed={2450} target={2900} size={104} />
        <MacroRing label="Protein" consumed={180} target={190} unit="g" />
        <MacroRing label="Carbs" consumed={300} target={320} unit="g" />
        <MacroRing label="Fat" consumed={70} target={80} unit="g" />
      </div>
    </div>
  );
}
