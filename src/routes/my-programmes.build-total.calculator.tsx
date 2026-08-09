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
  const [reps, setReps] = useState("3");
  const [refMax, setRefMax] = useState("");
  const [pct, setPct] = useState("70");
  const [sets, setSets] = useState("");
  const [vReps, setVReps] = useState("");
  const [vLoad, setVLoad] = useState("");
  const [squat, setSquat] = useState("");
  const [bench, setBench] = useState("");
  const [dead, setDead] = useState("");

  const e1rm = Number(load) > 0 && Number(reps) > 0 ? Number(load) * (1 + Number(reps) / 30) : null;
  const pctLoad = Number(refMax) > 0 && Number(pct) > 0 ? (Number(refMax) * Number(pct)) / 100 : null;
  const volume = Number(sets) > 0 && Number(vReps) > 0 && Number(vLoad) > 0 ? Number(sets) * Number(vReps) * Number(vLoad) : null;
  const total = Number(squat) + Number(bench) + Number(dead);

  return (
    <TotalShell eyebrow="Tools" title="Calculators">
      <div className="grid lg:grid-cols-2 gap-8">
        <Card title="Estimated 1RM" guardrail="Use only for 2-5 technically clean competition-standard repetitions. It is an estimate, not a result.">
          <Field label="Load (kg)" value={load} onChange={setLoad} />
          <Field label="Reps" value={reps} onChange={setReps} />
          <Result v={e1rm ? `${e1rm.toFixed(1)} kg` : "—"} />
        </Card>

        <Card title="Percentage load" guardrail="Round down to the nearest available increment and obey the RPE cap.">
          <Field label="Reference max (kg)" value={refMax} onChange={setRefMax} />
          <Field label="Percentage" value={pct} onChange={setPct} />
          <Result v={pctLoad ? `${pctLoad.toFixed(1)} kg` : "—"} />
        </Card>

        <Card title="Volume load" guardrail="Compare like with like — the same lift, standard and rep range.">
          <Field label="Sets" value={sets} onChange={setSets} />
          <Field label="Reps" value={vReps} onChange={setVReps} />
          <Field label="Load (kg)" value={vLoad} onChange={setVLoad} />
          <Result v={volume ? `${volume.toFixed(0)} kg` : "—"} />
        </Card>

        <Card title="Competition total" guardrail="A total is the sum of the best valid squat, bench press and deadlift.">
          <Field label="Best squat (kg)" value={squat} onChange={setSquat} />
          <Field label="Best bench press (kg)" value={bench} onChange={setBench} />
          <Field label="Best deadlift (kg)" value={dead} onChange={setDead} />
          <Result v={total > 0 ? `${total.toFixed(1)} kg` : "—"} />
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
      <input inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full h-11 bg-transparent border border-border px-3 text-bone" />
    </label>
  );
}

function Result({ v }: { v: string }) {
  return <p className="font-display text-bone text-3xl tabular mt-2 tracking-tight">{v}</p>;
}
