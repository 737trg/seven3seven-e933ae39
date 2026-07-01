import { createFileRoute } from "@tanstack/react-router";
import { HrpShell } from "@/components/hrp/HrpShell";
import { useHrpProfile } from "@/lib/hrp/store";
import { HRP } from "@/lib/hrp/manifest";
import { useState } from "react";

export const Route = createFileRoute("/my-programmes/hybrid-race-plan/event")({
  head: () => ({ meta: [{ title: "HYBRID RACE PLAN — Race day" }, { name: "robots", content: "noindex, nofollow" }] }),
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
  const profile = useHrpProfile();
  const [notes, setNotes] = useState("");
  const [pacing, setPacing] = useState({ open: "", target: "", drop: "" });
  const eventProfiles = (HRP as any).event_profiles as any;
  const eventKey = profile.event === "HYROX" ? "HYROX" : "The Hybrid Games";
  const categoryKey = profile.event === "HYROX"
    ? `${profile.sex || "Men"} ${profile.category || "Open"}`
    : `${profile.sex || "Male"} ${profile.format || "Solo"}`;
  const prescription = eventProfiles?.[eventKey]?.[categoryKey] ?? null;

  return (
    <HrpShell eyebrow="Race day" title="Event plan">
      <div className="mb-8 border border-border p-5 max-w-3xl">
        <p className="eyebrow mb-2">Your event</p>
        <p className="text-bone text-lg">{eventKey} · {categoryKey} · {profile.track}</p>
        {prescription && (
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-foreground-muted">
            {Object.entries(prescription).map(([k, v]) => (
              <li key={k}><span className="text-bone">{String(v)}</span> · {k.replace(/_/g, " ")}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <Card title="Running plan">
          <div className="space-y-3">
            <label className="grid grid-cols-[160px_1fr] items-center gap-3 text-sm">
              <span className="text-foreground-muted uppercase tracking-widest text-[10px]">Opening pace</span>
              <input value={pacing.open} onChange={(e) => setPacing({ ...pacing, open: e.target.value.slice(0, 12) })} className="h-10 bg-transparent border border-border px-3 text-bone" placeholder="e.g. 4:50 /km" />
            </label>
            <label className="grid grid-cols-[160px_1fr] items-center gap-3 text-sm">
              <span className="text-foreground-muted uppercase tracking-widest text-[10px]">Target average</span>
              <input value={pacing.target} onChange={(e) => setPacing({ ...pacing, target: e.target.value.slice(0, 12) })} className="h-10 bg-transparent border border-border px-3 text-bone" placeholder="e.g. 4:55 /km" />
            </label>
            <label className="grid grid-cols-[160px_1fr] items-center gap-3 text-sm">
              <span className="text-foreground-muted uppercase tracking-widest text-[10px]">Max drop-off</span>
              <input value={pacing.drop} onChange={(e) => setPacing({ ...pacing, drop: e.target.value.slice(0, 12) })} className="h-10 bg-transparent border border-border px-3 text-bone" placeholder="e.g. 5%" />
            </label>
          </div>
        </Card>

        <Card title="Machines">
          <ul className="text-sm text-bone space-y-2">
            <li>Damper / footplate settings recorded in rehearsal.</li>
            <li>Opening output kept controlled; do not chase the first split.</li>
            <li>Practise exit routine: monitor, drink, transition line.</li>
          </ul>
        </Card>

        <Card title="Sled">
          <ul className="text-sm text-bone space-y-2">
            <li>Footwear tested on race surface where possible.</li>
            <li>Body position: hips low on push, shoulders back on pull.</li>
            <li>Rope organisation and lane turn plan.</li>
            <li>Slow-surface contingency: shorter cycles, keep the sled moving.</li>
          </ul>
        </Card>

        <Card title="Wall balls">
          <ul className="text-sm text-bone space-y-2">
            <li>Opening set size decided in advance (not mid-set).</li>
            <li>Planned breaks and breathing pattern.</li>
            <li>No-rep response: reset, reset breath, resume.</li>
          </ul>
        </Card>

        <Card title="Carries & lunges">
          <ul className="text-sm text-bone space-y-2">
            <li>Grip strategy and turn method.</li>
            <li>Planned break locations.</li>
            <li>Posture cue: chest tall, patient steps.</li>
          </ul>
        </Card>

        <Card title="Burpees">
          <ul className="text-sm text-bone space-y-2">
            <li>Cadence and jump length.</li>
            <li>Point at which shorter legal jumps become more efficient.</li>
          </ul>
        </Card>

        {profile.format === "Doubles" && (
          <Card title="Doubles plan">
            <p className="text-sm text-bone">Plan A / B station splits, handover cues and contingency for a blown station.</p>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value.slice(0, 2000))} className="mt-3 w-full h-32 bg-transparent border border-border p-3 text-bone text-sm" placeholder="Athlete A / Athlete B split notes" />
          </Card>
        )}

        <Card title="Fuel & hydration">
          <ul className="text-sm text-bone space-y-2">
            <li>Pre-race meal (practised in rehearsal).</li>
            <li>Fluids and carbohydrate plan.</li>
            <li>Timing between last intake and race start.</li>
          </ul>
        </Card>

        <Card title="Equipment checklist">
          <ul className="text-sm text-bone grid grid-cols-2 gap-y-1">
            {["Trainers","Race top","Shorts","Socks","Chalk","Grips/gloves","Tape","Water","Carbs","Cap","Warm layer","ID / bib"].map((x) => (
              <li key={x} className="flex items-center gap-2"><span className="h-3 w-3 border border-border inline-block" />{x}</li>
            ))}
          </ul>
        </Card>

        <Card title="Race review">
          <p className="text-foreground-muted text-xs">After the race, log finish time, placing, penalties, splits, break pattern, no-reps, transition losses, what worked, what changed and the next training priority.</p>
        </Card>
      </div>

      <p className="text-foreground-muted text-[10px] uppercase tracking-widest mt-10">Event · {eventKey} · {profile.format}</p>
    </HrpShell>
  );
}
