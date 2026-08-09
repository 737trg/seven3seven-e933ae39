import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TotalShell } from "@/components/total/TotalShell";
import { TOTAL } from "@/lib/total/manifest";

export const Route = createFileRoute("/my-programmes/build-total/calculator")({
  head: () => ({ meta: [{ title: "TOTAL — Calculators" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: CalculatorPage,
});

function CalculatorPage() {
  const [load, setLoad] = useState("");
  const [reps, setReps] = useState("5");
  const [best, setBest] = useState("");
  const [worst, setWorst] = useState("");
  const [total, setTotal] = useState("");
  const [rounds, setRounds] = useState("");

  const e1rm = Number(load) > 0 && Number(reps) > 0 ? Number(load) * (1 + Number(reps) / 30) : null;
  const dropOff = Number(best) > 0 && Number(worst) > 0 ? ((Number(best) - Number(worst)) / Number(best)) * 100 : null;
  const avgRound = Number(total) > 0 && Number(rounds) > 0 ? Number(total) / Number(rounds) : null;

  return (
    <TotalShell eyebrow="Tools" title="Calculators">
      <div className="grid lg:grid-cols-3 gap-8">
        <Card title="Estimated 1RM" guardrail="An estimate for planning, not a maximal attempt. Use sets of 3-5 for the cleanest number.">
          <Field label="Load (kg)" value={load} onChange={setLoad} />
          <Field label="Reps" value={reps} onChange={setReps} />
          <Result v={e1rm ? `${e1rm.toFixed(1)} kg` : "—"} />
        </Card>

        <Card title="Interval drop-off" guardrail="More than about 10% drop-off usually means the opening pace was too aggressive.">
          <Field label="Best interval (sec or metres)" value={best} onChange={setBest} />
          <Field label="Worst interval" value={worst} onChange={setWorst} />
          <Result v={dropOff !== null ? `${dropOff.toFixed(1)}%` : "—"} />
        </Card>

        <Card title="Average round time" guardrail="Compare rounds within one workout only; changing the load or movement resets the comparison.">
          <Field label="Total time (sec)" value={total} onChange={setTotal} />
          <Field label="Rounds" value={rounds} onChange={setRounds} />
          <Result v={avgRound ? `${avgRound.toFixed(0)} sec` : "—"} />
        </Card>
      </div>

      <section className="mt-14">
        <p className="eyebrow mb-4">How these are calculated</p>
        <ul className="space-y-4 text-sm">
          {TOTAL.calculators?.map((c) => (
            <li key={c.id} className="border-t border-border/60 pt-3">
              <p className="text-bone">{c.name}</p>
              <p className="text-foreground-muted text-xs mt-1">{c.formula}</p>
              <p className="text-foreground-muted text-xs mt-1">{c.guardrail}</p>
            </li>
          ))}
        </ul>
      </section>
    </TotalShell>
  );
}

function Card({ title, guardrail, children }: { title: string; guardrail: string; children: React.ReactNode }) {
  return (
    <div className="border border-border p-5">
      <p className="eyebrow mb-4">{title}</p>
      <div className="space-y-3">{children}</div>
      <p className="text-foreground-muted text-xs mt-4">{guardrail}</p>
    </div>
  );
}
function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-foreground-muted">{label}</span>
      <input
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full h-11 bg-transparent border border-border px-3 text-bone"
      />
    </label>
  );
}
function Result({ v }: { v: string }) {
  return <p className="font-display text-bone text-3xl tabular pt-2">{v}</p>;
}