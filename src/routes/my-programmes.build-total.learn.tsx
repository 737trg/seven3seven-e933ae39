import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TotalShell } from "@/components/total/TotalShell";
import { TOTAL } from "@/lib/total/manifest";

export const Route = createFileRoute("/my-programmes/build-total/learn")({
  head: () => ({ meta: [{ title: "TOTAL — Learn" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: LearnPage,
});

type Tab = "foundation" | "learn" | "scaling" | "equipment" | "reference";

function LearnPage() {
  const [tab, setTab] = useState<Tab>("foundation");
  const tabs: { id: Tab; label: string }[] = [
    { id: "foundation", label: "Foundation" },
    { id: "learn", label: "Modules" },
    { id: "scaling", label: "RX / Scaled" },
    { id: "equipment", label: "Equipment" },
    { id: "reference", label: "Reference" },
  ];

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
          {TOTAL.foundation.map((f) => (
            <article key={f.id} className="border-t border-border pt-6">
              <h2 className="font-display text-bone text-xl tracking-tight">{f.title}</h2>
              <p className="text-foreground-muted text-sm mt-2 max-w-[70ch]">{f.summary}</p>
              <div className="mt-5 grid md:grid-cols-2 gap-6">
                {f.sections?.map((s) => (
                  <div key={s.title}>
                    <p className="eyebrow mb-2">{s.title}</p>
                    <ul className="text-bone text-sm space-y-1.5">
                      {s.points.map((p) => <li key={p}>· {p}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
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
                {m.points?.map((p) => <li key={p}>· {p}</li>)}
              </ul>
              {m.coach_rule && <p className="text-signal text-xs mt-4 uppercase tracking-[0.18em]">{m.coach_rule}</p>}
            </article>
          ))}
        </div>
      )}

      {tab === "scaling" && (
        <div className="space-y-8">
          <p className="text-bone text-sm max-w-[70ch]">{String((TOTAL.rx_scaled_policy as Record<string, unknown>).rule ?? "")}</p>
          <p className="text-signal text-xs uppercase tracking-[0.18em]">{String((TOTAL.rx_scaled_policy as Record<string, unknown>).no_shame_copy ?? "")}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-foreground-muted text-[10px] uppercase tracking-widest">
                  <th className="py-2 pr-4">Movement</th>
                  <th className="py-2 pr-4">RX</th>
                  <th className="py-2 pr-4">Scaled</th>
                  <th className="py-2">Standard</th>
                </tr>
              </thead>
              <tbody className="text-bone">
                {TOTAL.movement_scaling.map((m) => (
                  <tr key={m.movement} className="border-t border-border/60 align-top">
                    <td className="py-3 pr-4">{m.movement}</td>
                    <td className="py-3 pr-4 text-foreground-muted">{m.rx}</td>
                    <td className="py-3 pr-4 text-foreground-muted">{m.scaled}</td>
                    <td className="py-3 text-foreground-muted">{m.success_standard}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "equipment" && (
        <div className="space-y-6">
          <div>
            <p className="eyebrow mb-2">Primary kit</p>
            <ul className="text-bone text-sm space-y-1.5">
              {((TOTAL.equipment as { primary?: string[] }).primary ?? []).map((e) => <li key={e}>· {e}</li>)}
            </ul>
          </div>
          <p className="text-foreground-muted text-sm max-w-[70ch]">{String((TOTAL.equipment as Record<string, unknown>).substitution_principle ?? "")}</p>
          <ul className="text-bone text-sm space-y-3">
            {(((TOTAL.equipment as Record<string, unknown>).substitutions as { if_missing: string; use: string; keep_the_same?: string }[]) ?? []).map((s) => (
              <li key={s.if_missing} className="border-t border-border/60 pt-3">
                <span className="text-foreground-muted">No {s.if_missing.toLowerCase()} —</span> {s.use}
                {s.keep_the_same && <span className="block text-foreground-muted text-xs mt-1">Keep the same: {s.keep_the_same}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "reference" && (
        <div className="space-y-8">
          <pre className="text-foreground-muted text-xs whitespace-pre-wrap font-sans max-w-[80ch]">
            {JSON.stringify(TOTAL.training_reference, null, 2)
              .replace(/[{}"[\],]/g, "")
              .replace(/_/g, " ")
              .split("\n")
              .filter((l) => l.trim())
              .join("\n")}
          </pre>
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