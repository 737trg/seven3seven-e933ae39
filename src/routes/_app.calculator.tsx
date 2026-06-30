import { createFileRoute } from "@tanstack/react-router";
import { useSyncExternalStore, useState } from "react";
import { store, subscribeStore } from "@/lib/store";
import { LOAD_PERCENTAGES, RPE_GUIDE, round2_5 } from "@/data/loadGuide";

export const Route = createFileRoute("/_app/calculator")({
  component: CalculatorPage,
});

function CalculatorPage() {
  const athlete = useSyncExternalStore(subscribeStore, store.getAthlete, store.getAthlete);
  const [press, setPress] = useState(athlete.pbs.strictPress1RM);
  const [squat, setSquat] = useState(athlete.pbs.backSquat1RM);
  const [dl, setDl] = useState(athlete.pbs.deadlift1RM);

  return (
    <div className="max-w-[920px] mx-auto px-5 lg:px-10 py-8 lg:py-14">
      <header className="mb-10">
        <p className="eyebrow mb-3">Calculator</p>
        <h1 className="font-display font-bold text-bone text-4xl lg:text-6xl leading-none">
          Loads & effort.
        </h1>
      </header>

      <section className="grid grid-cols-3 gap-4 mb-10 border-y border-border py-6">
        <Field label="Strict press" value={press} onChange={setPress} />
        <Field label="Back squat" value={squat} onChange={setSquat} />
        <Field label="Deadlift" value={dl} onChange={setDl} />
      </section>

      <section>
        <h2 className="eyebrow mb-4">Personal load guide</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm tabular">
            <thead>
              <tr className="text-left text-foreground-muted">
                <th className="py-2 font-normal eyebrow">%</th>
                <th className="py-2 font-normal eyebrow">Press</th>
                <th className="py-2 font-normal eyebrow">Squat</th>
                <th className="py-2 font-normal eyebrow">Deadlift</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border border-y border-border">
              {LOAD_PERCENTAGES.map((p) => (
                <tr key={p}>
                  <td className="py-2.5 text-foreground-muted">{p}%</td>
                  <td className="py-2.5 text-bone">{round2_5((press * p) / 100)} kg</td>
                  <td className="py-2.5 text-bone">{round2_5((squat * p) / 100)} kg</td>
                  <td className="py-2.5 text-bone">{round2_5((dl * p) / 100)} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 text-xs text-foreground-muted">
          Percentages are a starting point. Technique and rep speed still matter.
        </p>
      </section>

      <section className="mt-14">
        <h2 className="eyebrow mb-4">RPE guide</h2>
        <div className="divide-y divide-border border-y border-border">
          {RPE_GUIDE.map((r) => (
            <div key={r.rpe} className="grid grid-cols-12 py-3 gap-3 items-baseline">
              <span className="col-span-2 font-display tabular text-bone text-xl">RPE {r.rpe}</span>
              <span className="col-span-3 text-bone text-sm">{r.feel}</span>
              <span className="col-span-7 text-foreground-muted text-sm">{r.meaning}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="block eyebrow mb-1.5">{label}</span>
      <div className="flex items-baseline gap-1">
        <input
          type="number"
          step="2.5"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="bg-transparent outline-none text-bone tabular text-2xl lg:text-3xl font-display font-bold w-full min-w-0 border-b border-border focus:border-bone py-1"
        />
        <span className="text-foreground-muted text-xs">kg</span>
      </div>
    </label>
  );
}