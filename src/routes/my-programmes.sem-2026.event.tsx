import { createFileRoute } from "@tanstack/react-router";
import { SemShell } from "@/components/sem/SemShell";
import { useSemProfile, semStore } from "@/lib/sem/store";
import { useState } from "react";

export const Route = createFileRoute("/my-programmes/sem-2026/event")({
  head: () => ({ meta: [{ title: "S.E.M. 2026 — Race day" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: EventPage,
});

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border pt-6">
      <p className="eyebrow mb-3 text-signal">{title}</p>
      {children}
    </section>
  );
}

function EventPage() {
  const profile = useSemProfile();
  const [openers, setOpeners] = useState({ press: "", squat: "", deadlift: "" });
  const [pacing, setPacing] = useState({ run: "", row: "" });
  const [notes, setNotes] = useState("");

  const isPairs = profile.format === "Pairs";

  return (
    <SemShell eyebrow="Race day" title="Event plan">
      <div className="grid lg:grid-cols-2 gap-10">
        <Card title="Strength attempt planner">
          <div className="space-y-3">
            {(["press", "squat", "deadlift"] as const).map((k) => (
              <label key={k} className="grid grid-cols-[120px_1fr] items-center gap-3 text-sm">
                <span className="text-foreground-muted uppercase tracking-widest text-[10px]">{k}</span>
                <input value={openers[k]} onChange={(e) => setOpeners({ ...openers, [k]: e.target.value.replace(/[^0-9.]/g, "").slice(0, 6) })}
                  className="h-10 bg-transparent border border-border px-3 text-bone tabular" placeholder={`Opener (${profile.units})`} />
              </label>
            ))}
          </div>
        </Card>

        <Card title="Endurance pacing">
          <div className="space-y-3">
            <label className="grid grid-cols-[120px_1fr] items-center gap-3 text-sm">
              <span className="text-foreground-muted uppercase tracking-widest text-[10px]">Run target</span>
              <input value={pacing.run} onChange={(e) => setPacing({ ...pacing, run: e.target.value.slice(0, 12) })} className="h-10 bg-transparent border border-border px-3 text-bone" placeholder="e.g. 4:50 /km" />
            </label>
            <label className="grid grid-cols-[120px_1fr] items-center gap-3 text-sm">
              <span className="text-foreground-muted uppercase tracking-widest text-[10px]">Row target</span>
              <input value={pacing.row} onChange={(e) => setPacing({ ...pacing, row: e.target.value.slice(0, 12) })} className="h-10 bg-transparent border border-border px-3 text-bone" placeholder="e.g. 1:55 /500m" />
            </label>
          </div>
        </Card>

        <Card title="MetCon station plan">
          <ul className="text-sm text-bone space-y-2">
            <li>Open at controlled output — protect station two.</li>
            <li>Plan transitions: chalk, drink, line-up.</li>
            <li>Identify the longest station and pace from it back.</li>
          </ul>
        </Card>

        <Card title="Equipment checklist">
          <ul className="text-sm text-bone grid grid-cols-2 gap-y-1">
            {["Trainers","Lifters","Belt","Chalk","Wraps","Tape","Sleeves","Water","Carbs","Spare top","Sun cover","ID"].map((x) => (
              <li key={x} className="flex items-center gap-2"><span className="h-3 w-3 border border-border inline-block" />{x}</li>
            ))}
          </ul>
        </Card>

        <Card title="Warm-up checklist">
          <ul className="text-sm text-bone space-y-1 list-decimal pl-5">
            <li>Raise: easy bike or row, 5 min.</li>
            <li>Activate: hips, posterior chain.</li>
            <li>Mobilise: ankles, thoracic.</li>
            <li>Potentiate: opener-load singles or controlled doubles.</li>
          </ul>
        </Card>

        <Card title="Between-zone recovery">
          <p className="text-sm text-bone">Hydrate, eat small carbs, breathe nasally for 60–90s, mentally rehearse the next station's opening line.</p>
        </Card>

        {isPairs && (
          <Card title="Pairs split planner">
            <p className="text-sm text-bone">Plan who leads each zone. Decide handover cues (e.g. rep count, time). Note contingency: if A blows up on station two, B takes a longer pull.</p>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value.slice(0, 2000))} className="mt-3 w-full h-32 bg-transparent border border-border p-3 text-bone text-sm" placeholder="Athlete A / Athlete B split notes" />
          </Card>
        )}

        <Card title="Personal notes">
          <textarea defaultValue={""} className="w-full h-28 bg-transparent border border-border p-3 text-bone text-sm" placeholder="One line per cue" maxLength={2000} />
        </Card>
      </div>
      <p className="text-foreground-muted text-[10px] uppercase tracking-widest mt-10">Mode · {profile.format} {profile.category && `· ${profile.category}`}</p>
      <p className="text-foreground-muted text-xs mt-2">Notes stored locally for now; database-backed event plans land in the next release.</p>
      <button onClick={() => { /* placeholder — local plan persistence reserved */ semStore.saveProfile({}); }} className="hidden" />
    </SemShell>
  );
}