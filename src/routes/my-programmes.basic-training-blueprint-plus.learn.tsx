import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BtbShell } from "@/components/btb/BtbShell";
import { BTB } from "@/lib/btb/manifest";

export const Route = createFileRoute("/my-programmes/basic-training-blueprint-plus/learn")({
  head: () => ({ meta: [{ title: "Basic Training Blueprint+ — Learn" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: LearnPage,
});

type Term = { term: string; short: string };

function LearnPage() {
  const terms: Term[] = (BTB as any).learn?.training_terms ?? [];
  const [q, setQ] = useState("");
  const items = useMemo(() => {
    if (!q.trim()) return terms;
    const n = q.trim().toLowerCase();
    return terms.filter((t) => t.term.toLowerCase().includes(n) || t.short.toLowerCase().includes(n));
  }, [q, terms]);

  return (
    <BtbShell eyebrow="Reference" title="Learn">
      <div className="max-w-2xl">
        <label className="block">
          <span className="eyebrow text-foreground-muted">Search</span>
          <input value={q} onChange={(e) => setQ(e.target.value.slice(0, 60))}
            className="mt-2 h-11 w-full bg-transparent border border-border px-3 text-bone" placeholder="Search terms" />
        </label>

        <p className="eyebrow mt-10 mb-3">Training terms</p>
        <ul className="divide-y divide-border/60">
          {items.map((t) => (
            <li key={t.term} className="py-3">
              <p className="text-bone text-sm">{t.term}</p>
              <p className="text-foreground-muted text-xs mt-1">{t.short}</p>
            </li>
          ))}
          {items.length === 0 && <li className="py-6 text-foreground-muted text-xs">No matches.</li>}
        </ul>

        <p className="text-foreground-muted text-[10px] uppercase tracking-widest mt-10">{(BTB as any).independent_disclaimer}</p>
      </div>
    </BtbShell>
  );
}