import { createFileRoute } from "@tanstack/react-router";
import { BtbShell } from "@/components/btb/BtbShell";
import { BTB } from "@/lib/btb/manifest";
import { useBtbProfile, btbStore } from "@/lib/btb/store";
import { useState } from "react";

export const Route = createFileRoute("/my-programmes/basic-training-blueprint-plus/assessment")({
  head: () => ({ meta: [{ title: "Basic Training Blueprint+ — Assessment day" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AssessmentPage,
});

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border pt-6">
      <p className="eyebrow mb-3 text-signal">{title}</p>
      {children}
    </section>
  );
}

function AssessmentPage() {
  const profile = useBtbProfile();
  const assessment: any = (BTB as any).assessment ?? {};
  const tests: { name: string; protocol: string }[] = assessment.tests ?? [];
  const roleRows: { role: string; mtp: string; throw: string; twoKm: string }[] = assessment.role_examples ?? [];
  const [targets, setTargets] = useState({ mtp: "", throw: "", twoKm: "" });
  const [notes, setNotes] = useState("");

  return (
    <BtbShell eyebrow="Assessment day" title="Test plan">
      <div className="grid lg:grid-cols-2 gap-10">
        <Card title="Tests">
          <ul className="space-y-4">
            {tests.map((t) => (
              <li key={t.name}>
                <p className="text-bone text-sm">{t.name}</p>
                <p className="text-foreground-muted text-xs mt-1">{t.protocol}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Role targets">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[420px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-widest text-foreground-muted border-b border-border">
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">MTP</th>
                  <th className="py-2 pr-4">Throw</th>
                  <th className="py-2 pr-4">2 km</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {roleRows.map((r) => (
                  <tr key={r.role}>
                    <td className="py-2 pr-4 text-bone">{r.role}</td>
                    <td className="py-2 pr-4 text-foreground-muted tabular">{r.mtp}</td>
                    <td className="py-2 pr-4 text-foreground-muted tabular">{r.throw}</td>
                    <td className="py-2 pr-4 text-foreground-muted tabular">{r.twoKm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-foreground-muted text-[10px] mt-4">Reference targets only. SEVEN3SEVEN does not represent the British Army or the Ministry of Defence.</p>
        </Card>

        <Card title="Your personal targets">
          <div className="space-y-3">
            <label className="grid grid-cols-[120px_1fr] items-center gap-3 text-sm">
              <span className="text-foreground-muted uppercase tracking-widest text-[10px]">MTP</span>
              <input value={targets.mtp} onChange={(e) => setTargets({ ...targets, mtp: e.target.value.replace(/[^0-9.]/g, "").slice(0, 6) })} className="h-10 bg-transparent border border-border px-3 text-bone tabular" placeholder="kg" />
            </label>
            <label className="grid grid-cols-[120px_1fr] items-center gap-3 text-sm">
              <span className="text-foreground-muted uppercase tracking-widest text-[10px]">Throw</span>
              <input value={targets.throw} onChange={(e) => setTargets({ ...targets, throw: e.target.value.replace(/[^0-9.]/g, "").slice(0, 6) })} className="h-10 bg-transparent border border-border px-3 text-bone tabular" placeholder="m" />
            </label>
            <label className="grid grid-cols-[120px_1fr] items-center gap-3 text-sm">
              <span className="text-foreground-muted uppercase tracking-widest text-[10px]">2 km</span>
              <input value={targets.twoKm} onChange={(e) => setTargets({ ...targets, twoKm: e.target.value.slice(0, 8) })} className="h-10 bg-transparent border border-border px-3 text-bone" placeholder="mm:ss" />
            </label>
          </div>
        </Card>

        <Card title="Warm-up checklist">
          <ul className="text-sm text-bone space-y-1 list-decimal pl-5">
            <li>Raise: 5 min easy bike or brisk walk.</li>
            <li>Mobilise: ankles, hips, thoracic.</li>
            <li>Activate: glute bridges, band pull-aparts.</li>
            <li>Potentiate: two light MTP pulls at 40–60% effort.</li>
          </ul>
        </Card>

        <Card title="Equipment checklist">
          <ul className="text-sm text-bone grid grid-cols-2 gap-y-1">
            {["Trainers","ID","Water","Snack","Warm layer","Notes","Watch","Tape"].map((x) => (
              <li key={x} className="flex items-center gap-2"><span className="h-3 w-3 border border-border inline-block" />{x}</li>
            ))}
          </ul>
        </Card>

        <Card title="Personal notes">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value.slice(0, 2000))} className="w-full h-28 bg-transparent border border-border p-3 text-bone text-sm" placeholder="One line per cue" maxLength={2000} />
        </Card>
      </div>

      <p className="text-foreground-muted text-[10px] uppercase tracking-widest mt-10">
        Assessment date · {profile.assessmentDate ?? "Not set"} · Role · {profile.role || "Not set"}
      </p>
      <p className="text-foreground-muted text-xs mt-2">Notes stored locally for now; database-backed test plans land in the next release.</p>
      <button onClick={() => { btbStore.saveProfile({}); }} className="hidden" />
    </BtbShell>
  );
}