import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { HrpShell } from "@/components/hrp/HrpShell";
import { HRP } from "@/lib/hrp/manifest";
import { useHrpProfile } from "@/lib/hrp/store";

export const Route = createFileRoute("/my-programmes/hybrid-race-plan/calculator")({
  head: () => ({ meta: [{ title: "HYBRID RACE PLAN — Calculator" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: CalcPage,
});

const LIFT_LABEL: Record<string, string> = { back_squat: "Back squat", deadlift: "Deadlift" };

function round(v: number, step: number) { return Math.round(v / step) * step; }

function parseMMSS(s: string | null): number | null {
  if (!s) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const sec = Number(m[1]) * 60 + Number(m[2]);
  if (sec <= 0 || sec > 60 * 90) return null;
  return sec;
}
function fmt(sec: number) {
  const s = Math.max(0, Math.round(sec));
  const mm = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function CalcPage() {
  const cfg = (HRP as any).calculator as { lifts: string[]; percentages: number[]; rounding_kg: number; rpe_guide: Record<string, string>; sled_note: string; run_paces: string[] };
  const profile = useHrpProfile();
  const [fiveK, setFiveK] = useState<string>(profile.recent5k ?? "");
  const benchmarks: Record<string, number | null> = { back_squat: profile.backSquat, deadlift: profile.deadlift };
  const step = profile.units === "lb" ? 5 : cfg.rounding_kg;

  const pacePerMetre = useMemo(() => {
    const sec = parseMMSS(fiveK);
    if (!sec) return null;
    return sec / 5000; // seconds per metre
  }, [fiveK]);

  const distanceMetres: Record<string, number> = { "200 m": 200, "300 m": 300, "400 m": 400, "600 m": 600, "800 m": 800, "1 km": 1000 };

  return (
    <HrpShell eyebrow="Loads & pace" title="Calculator">
      <section className="mb-12">
        <p className="eyebrow mb-3 text-signal">Running pace reference</p>
        <div className="flex flex-wrap items-center gap-4">
          <label className="grid grid-cols-[160px_1fr] items-center gap-3 text-sm">
            <span className="text-foreground-muted uppercase tracking-widest text-[10px]">Recent 5 km</span>
            <input value={fiveK} onChange={(e) => setFiveK(e.target.value.slice(0, 8))} placeholder="mm:ss" className="h-10 bg-transparent border border-border px-3 text-bone tabular" />
          </label>
          <p className="text-foreground-muted text-xs max-w-[48ch]">Starting references only. RPE, terrain, fatigue and repeatability make the final training decision.</p>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-[420px] text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-foreground-muted border-b border-border">
                <th className="py-3 pr-6">Distance</th><th className="py-3 pr-6">Target time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {cfg.run_paces.map((label) => {
                const d = distanceMetres[label] ?? 0;
                const sec = pacePerMetre ? pacePerMetre * d : null;
                return (
                  <tr key={label}>
                    <td className="py-2 pr-6 text-bone">{label}</td>
                    <td className="py-2 pr-6 text-bone tabular">{sec ? fmt(sec) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <p className="eyebrow mb-3 text-signal">Race-load calculator</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-foreground-muted border-b border-border">
                <th className="py-3 pr-4">%</th>
                {cfg.lifts.map((l) => <th key={l} className="py-3 pr-4">{LIFT_LABEL[l] ?? l}</th>)}
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
        <p className="mt-4 text-foreground-muted text-xs max-w-[64ch]">{cfg.sled_note}</p>
      </section>

      <section className="mt-12">
        <p className="eyebrow mb-3">RPE guide</p>
        <ul className="divide-y divide-border/60 max-w-md">
          {Object.entries(cfg.rpe_guide).map(([rpe, desc]) => (
            <li key={rpe} className="py-2 flex justify-between gap-3 text-sm">
              <span className="text-bone tabular">RPE {rpe}</span>
              <span className="text-foreground-muted text-right">{desc}</span>
            </li>
          ))}
        </ul>
      </section>
    </HrpShell>
  );
}
