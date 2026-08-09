import { createFileRoute } from "@tanstack/react-router";
import { Sem27Shell } from "@/components/sem2027/Sem27Shell";
import { SEM27 } from "@/lib/sem2027/manifest";
import { useSem27Profile } from "@/lib/sem2027/store";

export const Route = createFileRoute("/my-programmes/sem-2027/calculator")({
  head: () => ({ meta: [{ title: "S.E.M. 2027 — Calculator" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: CalcPage,
});

const LIFT_LABEL: Record<string, string> = {
  strict_press: "Strict press",
  back_squat: "Back squat",
  deadlift: "Deadlift",
};

function round(v: number, step: number) {
  return Math.round(v / step) * step;
}

function CalcPage() {
  const cfg = (SEM27 as any).calculator as { lifts: string[]; percentages: number[]; rounding_kg: number; rpe_guide: Record<string, string> };
  const profile = useSem27Profile();
  const benchmarks: Record<string, number | null> = {
    strict_press: profile.strictPress,
    back_squat: profile.backSquat,
    deadlift: profile.deadlift,
  };
  const step = profile.units === "lb" ? 5 : cfg.rounding_kg;

  return (
    <Sem27Shell eyebrow="Loads & effort" title="Calculator">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-widest text-foreground-muted border-b border-border">
              <th className="py-3 pr-4">%</th>
              {cfg.lifts.map((l) => (
                <th key={l} className="py-3 pr-4">{LIFT_LABEL[l] ?? l}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {cfg.percentages.map((pct) => (
              <tr key={pct}>
                <td className="py-3 pr-4 text-foreground-muted tabular">{pct}%</td>
                {cfg.lifts.map((l) => {
                  const bm = benchmarks[l];
                  return (
                    <td key={l} className="py-3 pr-4 text-bone tabular">
                      {bm && bm > 0 ? `${round((bm * pct) / 100, step)} ${profile.units}` : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 grid md:grid-cols-2 gap-8">
        <div>
          <p className="eyebrow mb-3">RPE guide</p>
          <ul className="divide-y divide-border/60">
            {Object.entries(cfg.rpe_guide).map(([rpe, desc]) => (
              <li key={rpe} className="py-2 flex justify-between gap-3 text-sm">
                <span className="text-bone tabular">RPE {rpe}</span>
                <span className="text-foreground-muted">{desc}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">Your benchmarks</p>
          <ul className="divide-y divide-border/60">
            {cfg.lifts.map((l) => {
              const bm = benchmarks[l];
              return (
                <li key={l} className="py-2 flex justify-between gap-3 text-sm">
                  <span className="text-bone">{LIFT_LABEL[l]}</span>
                  <span className="text-foreground-muted tabular">{bm ? `${bm} ${profile.units}` : "Not set"}</span>
                </li>
              );
            })}
          </ul>
          <p className="text-foreground-muted text-xs mt-4">Update benchmarks in your profile to recalculate.</p>
        </div>
      </div>

      <p className="mt-10 text-foreground-muted text-xs max-w-[60ch]">
        Attempt planning: from a comfortable opener, add small even jumps. Avoid maximal lifts in the final week of build.
      </p>
    </Sem27Shell>
  );
}