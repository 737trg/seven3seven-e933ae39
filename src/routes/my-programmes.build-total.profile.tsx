import { createFileRoute } from "@tanstack/react-router";
import { NumberText } from "@/components/forms/NumberText";
import { TotalShell } from "@/components/total/TotalShell";
import { TOTAL } from "@/lib/total/manifest";
import { totalStore, useTotalProfile } from "@/lib/total/store";

export const Route = createFileRoute("/my-programmes/build-total/profile")({
  head: () => ({ meta: [{ title: "TOTAL — Profile" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const p = useTotalProfile();
  const equipment = (TOTAL.equipment as { primary?: string[] }).primary ?? [];
  const policy = TOTAL.reference_max_policy as { definition?: string; rules?: string[] };

  return (
    <TotalShell eyebrow="Setup" title="Profile">
      <div className="grid lg:grid-cols-2 gap-10 max-w-4xl">
        <div className="space-y-5">
          <Text label="Display name" value={p.displayName} onChange={(v) => totalStore.saveProfile({ displayName: v })} />
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-foreground-muted">Programme start date</span>
            <input type="date" value={p.startDate ?? ""} onChange={(e) => totalStore.saveProfile({ startDate: e.target.value || null })}
              className="mt-1 w-full h-11 bg-transparent border border-border px-3 text-bone" />
          </label>
          <Select label="Week 8 outcome" value={p.week8Path} options={["Competition", "Gym test", "Training peak without max test"]}
            onChange={(v) => totalStore.saveProfile({ week8Path: v as typeof p.week8Path })} />
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-foreground-muted">Competition or test date</span>
            <input type="date" value={p.eventDate ?? ""} onChange={(e) => totalStore.saveProfile({ eventDate: e.target.value || null })}
              className="mt-1 w-full h-11 bg-transparent border border-border px-3 text-bone" />
          </label>
          <Text label="Federation / ruleset" value={p.ruleset} onChange={(v) => totalStore.saveProfile({ ruleset: v })} />
        </div>

        <div className="space-y-5">
          <NumberText label="Squat reference max (kg)" value={p.squatKg}
            onCommit={(n) => totalStore.saveProfile({ squatKg: n })} />
          <NumberText label="Bench press reference max (kg)" value={p.benchKg}
            onCommit={(n) => totalStore.saveProfile({ benchKg: n })} />
          <NumberText label="Deadlift reference max (kg)" value={p.deadliftKg}
            onCommit={(n) => totalStore.saveProfile({ deadliftKg: n })} />
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-foreground-muted">Pain, limitations and coaching notes</span>
            <textarea rows={4} value={p.limitations} onChange={(e) => totalStore.saveProfile({ limitations: e.target.value })}
              className="mt-1 w-full bg-transparent border border-border p-3 text-bone text-sm" />
          </label>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-foreground-muted mb-2">Available equipment</p>
            <div className="flex flex-wrap gap-2">
              {equipment.map((e) => {
                const on = p.equipment.includes(e);
                return (
                  <button key={e} onClick={() => totalStore.saveProfile({ equipment: on ? p.equipment.filter((x) => x !== e) : [...p.equipment, e] })}
                    className={`h-9 px-3 text-[10px] uppercase tracking-[0.18em] font-display border ${on ? "bg-bone text-obsidian border-bone" : "border-border text-bone"}`}>
                    {e}
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={() => totalStore.saveProfile({ setupComplete: true })}
            className="h-11 px-6 inline-flex items-center bg-signal text-bone text-[11px] uppercase tracking-[0.28em] font-display">
            Save setup
          </button>
        </div>
      </div>

      <section className="mt-14 max-w-3xl border-t border-border pt-6">
        <p className="eyebrow mb-2">Reference max policy</p>
        <p className="text-foreground-muted text-sm">{policy?.definition}</p>
        <ul className="text-bone text-sm space-y-1.5 mt-3">
          {(policy?.rules ?? []).map((r) => <li key={r}>· {r}</li>)}
        </ul>
      </section>
    </TotalShell>
  );
}

function Text({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-foreground-muted">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full h-11 bg-transparent border border-border px-3 text-bone" />
    </label>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-foreground-muted">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full h-11 bg-background border border-border px-3 text-bone">
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
