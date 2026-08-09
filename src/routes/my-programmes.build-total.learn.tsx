import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TotalShell } from "@/components/total/TotalShell";
import { TOTAL } from "@/lib/total/manifest";

export const Route = createFileRoute("/my-programmes/build-total/learn")({
  head: () => ({ meta: [{ title: "TOTAL — Learn" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: LearnPage,
});

type Tab = "foundation" | "learn" | "standards" | "rpe" | "attempts" | "equipment" | "reference";

type LiftStandard = { commands?: string[]; standard?: string; common_failures?: string[] };

function LearnPage() {
  const [tab, setTab] = useState<Tab>("foundation");
  const tabs: { id: Tab; label: string }[] = [
    { id: "foundation", label: "Foundation" },
    { id: "learn", label: "Modules" },
    { id: "standards", label: "Standards" },
    { id: "rpe", label: "RPE" },
    { id: "attempts", label: "Attempts" },
    { id: "equipment", label: "Equipment" },
    { id: "reference", label: "Reference" },
  ];

  const standards = TOTAL.competition_standards as Record<string, unknown>;
  const lifts: { key: string; label: string }[] = [
    { key: "squat", label: "Squat" },
    { key: "bench_press", label: "Bench press" },
    { key: "deadlift", label: "Deadlift" },
  ];
  const planner = TOTAL.attempt_planner as Record<string, unknown>;
  const equipment = TOTAL.equipment as {
    primary?: string[];
    competition_specific?: string[];
    principle?: string;
  };

  return (
    <TotalShell eyebrow="Coaching" title="Learn">
      <div className="flex flex-wrap gap-2 mb-10">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`h-10 px-4 text-[10px] uppercase tracking-[0.22em] font-display border ${tab === t.id ? "bg-bone text-obsidian border-bone" : "border-border text-bone"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "foundation" && (
        <div className="space-y-10">
          <section className="border border-border p-5">
            <p className="eyebrow mb-2">Entry gate</p>
            <ul className="text-bone text-sm space-y-1.5">
              {TOTAL.entry_gate.map((g) => <li key={g}>· {g}</li>)}
            </ul>
          </section>
          <section className="border border-border p-5">
            <p className="eyebrow mb-2">Not for</p>
            <ul className="text-foreground-muted text-sm space-y-1.5">
              {TOTAL.not_for.map((g) => <li key={g}>· {g}</li>)}
            </ul>
          </section>
          {TOTAL.foundation.map((f) => (
            <article key={f.id} className="border-t border-border pt-6">
              <h2 className="font-display text-bone text-xl tracking-tight">{f.title}</h2>
              <p className="text-foreground-muted text-sm mt-2 max-w-[70ch]">{f.summary}</p>
              <ul className="text-bone text-sm space-y-1.5 mt-4">
                {(f.points ?? []).map((p) => <li key={p}>· {p}</li>)}
              </ul>
              {f.coach_rule && <p className="text-signal text-xs mt-5 uppercase tracking-[0.18em]">{f.coach_rule}</p>}
            </article>
          ))}
          <p className="text-foreground-muted text-xs max-w-[70ch] border-t border-border pt-5">{TOTAL.safety}</p>
        </div>
      )}

      {tab === "learn" && (
        <div className="space-y-8">
          {TOTAL.learn.map((m) => (
            <article key={m.id} className="border-t border-border pt-5">
              <h2 className="font-display text-bone text-lg tracking-tight">{m.title}</h2>
              <p className="text-foreground-muted text-sm mt-2 max-w-[70ch]">{m.summary}</p>
              <ul className="text-bone text-sm space-y-1.5 mt-4">
                {(m.points ?? []).map((p) => <li key={p}>· {p}</li>)}
              </ul>
              {m.coach_rule && <p className="text-signal text-xs mt-4 uppercase tracking-[0.18em]">{m.coach_rule}</p>}
            </article>
          ))}
        </div>
      )}

      {tab === "standards" && (
        <div className="space-y-8">
          <p className="text-foreground-muted text-sm max-w-[70ch]">{String(standards.scope ?? "")}</p>
          {lifts.map(({ key, label }) => {
            const l = standards[key] as LiftStandard | undefined;
            if (!l) return null;
            return (
              <article key={key} className="border-t border-border pt-5">
                <h2 className="font-display text-bone text-lg tracking-tight">{label}</h2>
                {l.commands && <p className="eyebrow text-signal mt-2">Commands · {l.commands.join(" / ")}</p>}
                <p className="text-foreground-muted text-sm mt-2 max-w-[70ch]">{l.standard}</p>
                <ul className="text-bone text-sm space-y-1.5 mt-3">
                  {(l.common_failures ?? []).map((f) => <li key={f}>· {f}</li>)}
                </ul>
              </article>
            );
          })}
        </div>
      )}

      {tab === "rpe" && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-foreground-muted text-[10px] uppercase tracking-widest">
                <th className="py-2 pr-4">RPE</th>
                <th className="py-2 pr-4">RIR</th>
                <th className="py-2 pr-4">Meaning</th>
                <th className="py-2">Use in this programme</th>
              </tr>
            </thead>
            <tbody className="text-bone">
              {TOTAL.rpe_scale.map((r) => (
                <tr key={r.rpe} className="border-t border-border/60 align-top">
                  <td className="py-3 pr-4">{r.rpe}</td>
                  <td className="py-3 pr-4 text-foreground-muted">{r.rir}</td>
                  <td className="py-3 pr-4 text-foreground-muted">{r.meaning}</td>
                  <td className="py-3 text-foreground-muted">{r.programme_use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "attempts" && (
        <div className="space-y-6">
          <p className="text-foreground-muted text-sm max-w-[70ch]">{String(planner.scope ?? "")}</p>
          {(["opener", "second", "third"] as const).map((k) => {
            const a = planner[k] as { starting_band?: string; effort?: string; rule?: string } | undefined;
            if (!a) return null;
            return (
              <div key={k} className="border-t border-border pt-4">
                <p className="eyebrow text-signal mb-1">{k === "second" ? "Second attempt" : k === "third" ? "Third attempt" : "Opener"}</p>
                <p className="text-bone text-sm">{a.starting_band}</p>
                <p className="text-foreground-muted text-xs mt-1">Effort · {a.effort}</p>
                <p className="text-foreground-muted text-xs mt-1">{a.rule}</p>
              </div>
            );
          })}
        </div>
      )}

      {tab === "equipment" && (
        <div className="space-y-6">
          <div>
            <p className="eyebrow mb-2">Primary kit</p>
            <ul className="text-bone text-sm space-y-1.5">
              {(equipment.primary ?? []).map((e) => <li key={e}>· {e}</li>)}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-2">Competition specific</p>
            <ul className="text-bone text-sm space-y-1.5">
              {(equipment.competition_specific ?? []).map((e) => <li key={e}>· {e}</li>)}
            </ul>
          </div>
          <p className="text-foreground-muted text-sm max-w-[70ch]">{equipment.principle}</p>
          <div>
            <p className="eyebrow mb-2">Variation library</p>
            <ul className="text-bone text-sm space-y-3">
              {TOTAL.variation_library.map((v) => (
                <li key={v.need} className="border-t border-border/60 pt-3">
                  <span className="text-foreground-muted">{v.need} —</span> {v.default}
                  <span className="block text-foreground-muted text-xs mt-1">Alternatives: {v.alternatives.join(", ")}</span>
                  <span className="block text-foreground-muted text-xs mt-1">{v.rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === "reference" && (
        <div className="space-y-8">
          <div>
            <p className="eyebrow mb-2">Phases</p>
            <ul className="text-bone text-sm space-y-2">
              {TOTAL.phases.map((p) => (
                <li key={p.name} className="border-t border-border/60 pt-2">
                  {p.name} · Weeks {p.weeks}
                  <span className="block text-foreground-muted text-xs mt-1">{p.purpose}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-2">Weekly structure</p>
            <ul className="text-bone text-sm space-y-1.5">
              {TOTAL.weekly_structure.map((w) => (
                <li key={w.day}>{w.day} · <span className="text-foreground-muted">{w.focus}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-2">Sources</p>
            <ul className="text-sm space-y-1.5">
              {TOTAL.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-bone underline hover:text-signal">{s.title}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </TotalShell>
  );
}
