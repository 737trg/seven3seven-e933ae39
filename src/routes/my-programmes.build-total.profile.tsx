import { createFileRoute } from "@tanstack/react-router";
import { TotalShell } from "@/components/total/TotalShell";
import { TOTAL } from "@/lib/total/manifest";
import { totalStore, useTotalProfile, type TotalTrack } from "@/lib/total/store";

export const Route = createFileRoute("/my-programmes/build-total/profile")({
  head: () => ({ meta: [{ title: "TOTAL — Profile" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const p = useTotalProfile();
  const equipment = ((TOTAL.equipment as { primary?: string[] }).primary ?? []);

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
          <Select label="Published load reference" value={p.loadReference} options={["Male", "Female"]}
            onChange={(v) => totalStore.saveProfile({ loadReference: v as "Male" | "Female" })} />
          <Select label="Default track" value={p.defaultTrack === "rx" ? "RX" : "Scaled"} options={["RX", "Scaled"]}
            onChange={(v) => totalStore.saveProfile({ defaultTrack: (v === "RX" ? "rx" : "scaled") as TotalTrack })} />
          <Select label="Current pulling option" value={p.pullingOption} options={["Pull-up", "Banded pull-up", "Ring row"]}
            onChange={(v) => totalStore.saveProfile({ pullingOption: v })} />
          <Select label="Current hanging trunk option" value={p.hangingTrunkOption} options={["Toes-to-bar", "Hanging knee raise", "Sit-up"]}
            onChange={(v) => totalStore.saveProfile({ hangingTrunkOption: v })} />
          <Select label="Current rope option" value={p.ropeOption} options={["Double under", "Single under", "Line hop"]}
            onChange={(v) => totalStore.saveProfile({ ropeOption: v })} />
        </div>

        <div className="space-y-5">
          <Text label="Back squat reference (kg)" value={p.backSquatKg?.toString() ?? ""}
            onChange={(v) => totalStore.saveProfile({ backSquatKg: v ? Number(v) : null })} />
          <Text label="Strict press reference (kg)" value={p.strictPressKg?.toString() ?? ""}
            onChange={(v) => totalStore.saveProfile({ strictPressKg: v ? Number(v) : null })} />
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

          <button
            onClick={() => totalStore.saveProfile({ setupComplete: true })}
            className="h-11 px-6 inline-flex items-center bg-signal text-bone text-[11px] uppercase tracking-[0.28em] font-display"
          >
            {p.setupComplete ? "Saved" : "Save profile"}
          </button>
        </div>
      </div>
    </TotalShell>
  );
}

function Text({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-foreground-muted">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full h-11 bg-transparent border border-border px-3 text-bone" />
    </label>
  );
}
function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-foreground-muted">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full h-11 bg-background border border-border px-3 text-bone">
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}