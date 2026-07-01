import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SemShell } from "@/components/sem/SemShell";
import { SEM } from "@/lib/sem/manifest";

export const Route = createFileRoute("/my-programmes/sem-8/learn")({
  head: () => ({ meta: [{ title: "S.E.M. 8 — Learn" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: LearnPage,
});

const TABS = [
  { id: "training_terms", label: "Training terms" },
  { id: "movement_standards", label: "Movement standards" },
  { id: "competition_rules", label: "Competition guidance" },
] as const;

function LearnPage() {
  const tabs = (SEM as any).learn?.tabs as Record<string, string[]> | undefined;
  const [tab, setTab] = useState<typeof TABS[number]["id"]>("training_terms");
  const [q, setQ] = useState("");

  const items = useMemo(() => {
    const arr = tabs?.[tab] ?? [];
    if (!q.trim()) return arr;
    const needle = q.trim().toLowerCase();
    return arr.filter((s) => s.toLowerCase().includes(needle));
  }, [tab, q, tabs]);

  return (
    <SemShell eyebrow="Learn" title="Terms, standards, rules">
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`h-10 px-4 text-[10px] uppercase tracking-[0.22em] font-display border ${tab === t.id ? "bg-bone text-obsidian border-bone" : "border-border text-bone"}`}>{t.label}</button>
        ))}
      </div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value.slice(0, 80))}
        placeholder="Search…"
        className="w-full max-w-md h-11 bg-transparent border border-border px-3 text-bone placeholder:text-foreground-muted text-sm"
      />
      <ul className="mt-8 divide-y divide-border/60 max-w-3xl">
        {items.length === 0 ? (
          <li className="py-4 text-foreground-muted text-sm">No entries.</li>
        ) : items.map((s) => (
          <li key={s} className="py-4">
            <p className="text-bone text-sm">{s}</p>
          </li>
        ))}
      </ul>
      <p className="mt-12 text-foreground-muted text-xs max-w-[60ch]">{SEM.independent_disclaimer}</p>
    </SemShell>
  );
}