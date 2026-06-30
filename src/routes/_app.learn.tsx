import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GLOSSARY, MOVEMENT_STANDARDS, COMPETITION_RULES } from "@/data/glossary";

export const Route = createFileRoute("/_app/learn")({
  component: LearnPage,
});

function LearnPage() {
  const [tab, setTab] = useState<"terms" | "standards" | "rules">("terms");
  const [q, setQ] = useState("");

  const filtered = GLOSSARY.filter((g) =>
    g.term.toLowerCase().includes(q.toLowerCase()) ||
    g.short.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="max-w-[920px] mx-auto px-5 lg:px-10 py-8 lg:py-14">
      <header className="mb-10">
        <p className="eyebrow mb-3">Learn</p>
        <h1 className="font-display font-bold text-bone text-4xl lg:text-6xl leading-none">
          Terms & standards.
        </h1>
      </header>

      <div className="flex gap-6 border-b border-border mb-8">
        {(
          [
            ["terms", "Training terms"],
            ["standards", "Movement standards"],
            ["rules", "Competition rules"],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`pb-3 text-xs uppercase tracking-widest border-b-2 -mb-px transition-colors ${
              tab === k
                ? "border-signal text-bone"
                : "border-transparent text-foreground-muted hover:text-bone"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === "terms" && (
        <div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search terms…"
            className="w-full bg-transparent border-b border-border focus:border-bone outline-none py-3 text-bone placeholder:text-foreground-muted text-sm mb-6"
          />
          <dl className="divide-y divide-border border-y border-border">
            {filtered.map((g) => (
              <div key={g.term} className="py-5 grid grid-cols-1 lg:grid-cols-4 gap-3">
                <dt className="font-display text-bone uppercase tracking-wide text-sm">
                  {g.term}
                </dt>
                <dd className="lg:col-span-3 text-foreground-muted text-sm leading-relaxed">
                  {g.short}
                  {g.example && (
                    <span className="block mt-1 text-bone/70 text-xs italic">
                      {g.example}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {tab === "standards" && (
        <div className="space-y-6">
          {MOVEMENT_STANDARDS.map((m) => (
            <article key={m.movement} className="border border-border p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-3 mb-2">
                <h3 className="font-display text-bone text-lg">{m.movement}</h3>
                {m.eventLoad && (
                  <span className="text-[10px] uppercase tracking-widest text-foreground-muted">
                    {m.eventLoad}
                  </span>
                )}
              </div>
              <p className="text-sm text-bone/90 leading-relaxed">{m.validRep}</p>
              {m.cue && (
                <p className="mt-3 text-xs text-signal uppercase tracking-widest">
                  Cue · {m.cue}
                </p>
              )}
            </article>
          ))}
        </div>
      )}

      {tab === "rules" && (
        <ul className="space-y-4">
          {COMPETITION_RULES.map((r, i) => (
            <li key={i} className="border border-border p-5 text-sm text-bone/90 leading-relaxed">
              {r}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}