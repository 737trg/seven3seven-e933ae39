import { createFileRoute } from "@tanstack/react-router";
import { useSyncExternalStore, useState } from "react";
import { store, subscribeStore } from "@/lib/store";

export const Route = createFileRoute("/_app/race")({
  component: RacePage,
});

function RacePage() {
  const rs = useSyncExternalStore(subscribeStore, store.getRaceStrategy, store.getRaceStrategy);
  const ps = useSyncExternalStore(subscribeStore, store.getPartnerSplit, store.getPartnerSplit);

  return (
    <div className="max-w-[1080px] mx-auto px-5 lg:px-10 py-8 lg:py-14">
      <header className="mb-12">
        <p className="eyebrow mb-3">23 August 2026 · Birmingham</p>
        <h1 className="font-display font-bold text-bone text-4xl lg:text-6xl leading-none">
          Race day.
        </h1>
        <p className="text-foreground-muted mt-3 max-w-xl">
          Simple decisions made before adrenaline arrives.
        </p>
      </header>

      <section className="mb-14">
        <h2 className="eyebrow mb-4">Strength attempt planner</h2>
        <AttemptTable
          rs={rs}
          onSave={(next) => store.saveRaceStrategy(next)}
        />
        <p className="mt-4 text-xs text-foreground-muted leading-relaxed max-w-2xl">
          Attempt 1 puts a score on the board. Attempt 2 should be highly likely. Attempt 3
          is earned by the speed and quality of Attempt 2.
        </p>
      </section>

      <section className="mb-14">
        <h2 className="eyebrow mb-4">MetCon-X split planner</h2>
        <SplitPlanner ps={ps} onSave={(p) => store.savePartnerSplit(p)} />
      </section>

      <section className="grid lg:grid-cols-2 gap-10 mb-14">
        <Block title="Equipment checklist" items={[
          "Shoes (training + lifting)", "Belt", "Knee sleeves", "Elbow sleeves",
          "Wrist wraps", "Chalk", "Race kit", "Spare top", "Towel",
        ]} />
        <Block title="Food & hydration" items={[
          "Normal breakfast 2–3 h before",
          "Carb snack 60–90 min before Strength zone",
          "Sip electrolytes between zones",
          "Avoid new foods or supplements",
        ]} />
      </section>

      <section className="mb-14">
        <h2 className="eyebrow mb-4">Final reminders</h2>
        <ul className="space-y-3 text-sm text-bone/90 leading-relaxed border-y border-border py-6">
          <li>· Warm up all three lifts before entering the Strength Zone.</li>
          <li>· Runner controls the changeover timing during Endurance.</li>
          <li>· One clear changeover cue. No mid-event committee meetings.</li>
          <li>· First MetCon turn is the most expensive — keep it controlled.</li>
          <li>· No straps. No sumo. Conventional deadlift only.</li>
        </ul>
      </section>
    </div>
  );
}

type RS = ReturnType<typeof store.getRaceStrategy>;
function AttemptTable({ rs, onSave }: { rs: RS; onSave: (rs: RS) => void }) {
  const [v, setV] = useState(rs);
  const set = (k: keyof RS, n: "one" | "two" | "three", val: number) => {
    const next = { ...v, [k]: { ...v[k], [n]: val } };
    setV(next);
    onSave(next);
  };
  const rows: Array<{ k: keyof RS; label: string }> = [
    { k: "press", label: "Strict press (1RM)" },
    { k: "squat3rm", label: "Back squat (3RM)" },
    { k: "deadlift5rm", label: "Deadlift (5RM)" },
  ];
  return (
    <div className="border border-border">
      <div className="grid grid-cols-4 text-[10px] uppercase tracking-widest text-foreground-muted border-b border-border">
        <div className="p-3">Lift</div>
        <div className="p-3 text-center">Attempt 1</div>
        <div className="p-3 text-center">Attempt 2</div>
        <div className="p-3 text-center">Attempt 3</div>
      </div>
      {rows.map((r) => (
        <div key={r.k} className="grid grid-cols-4 border-b border-border last:border-0 items-center">
          <div className="p-3 text-bone text-sm">{r.label}</div>
          {(["one", "two", "three"] as const).map((n) => (
            <input
              key={n}
              type="number"
              step="2.5"
              value={v[r.k][n] ?? ""}
              onChange={(e) => set(r.k, n, Number(e.target.value))}
              className="bg-transparent outline-none text-bone tabular font-display text-center text-xl py-3 border-l border-border focus:bg-surface-raised"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

type PS = ReturnType<typeof store.getPartnerSplit>;
function SplitPlanner({ ps, onSave }: { ps: PS; onSave: (p: PS) => void }) {
  const [v, setV] = useState(ps);
  const set = (k: keyof PS, val: PS[keyof PS]) => {
    const next = { ...v, [k]: val };
    setV(next);
    onSave(next);
  };
  const rows: Array<{ label: string; note: string; a: keyof PS; b?: keyof PS }> = [
    { label: "SkiErg 1 (60 cal)", note: "Suggested 10–15 cal turns", a: "ski1A", b: "ski1B" },
    { label: "Dual DB GTOH (60)", note: "Short clean sets 4–6 reps", a: "gtohA", b: "gtohB" },
    { label: "Box jump overs (60)", note: "Sets of 5–10", a: "boxJumpA", b: "boxJumpB" },
    { label: "Front-rack lunges (60 m)", note: "Marked distances", a: "lungeA", b: "lungeB" },
    { label: "Burpee broad jumps (60 m)", note: "Change before jump length collapses", a: "burpeeA", b: "burpeeB" },
    { label: "SkiErg 2 (60 cal)", note: "Expect shorter final turns", a: "ski2A", b: "ski2B" },
  ];
  return (
    <div className="border border-border divide-y divide-border">
      {rows.map((r) => (
        <div key={r.label} className="grid grid-cols-12 items-center p-3 gap-3">
          <div className="col-span-12 lg:col-span-5">
            <p className="text-bone text-sm">{r.label}</p>
            <p className="text-[10px] uppercase tracking-widest text-foreground-muted">{r.note}</p>
          </div>
          <input
            type="number"
            placeholder="A"
            value={(v[r.a] as number | undefined) ?? ""}
            onChange={(e) => set(r.a, Number(e.target.value) as any)}
            className="col-span-6 lg:col-span-3 bg-transparent border-b border-border focus:border-bone outline-none py-2 text-bone tabular text-center"
          />
          {r.b && (
            <input
              type="number"
              placeholder="B"
              value={(v[r.b] as number | undefined) ?? ""}
              onChange={(e) => set(r.b!, Number(e.target.value) as any)}
              className="col-span-6 lg:col-span-3 bg-transparent border-b border-border focus:border-bone outline-none py-2 text-bone tabular text-center"
            />
          )}
        </div>
      ))}
      <div className="p-3">
        <textarea
          placeholder="Handover cues / notes…"
          value={v.notes ?? ""}
          onChange={(e) => set("notes", e.target.value as any)}
          className="w-full bg-transparent outline-none text-bone text-sm placeholder:text-foreground-muted resize-none"
          rows={2}
        />
      </div>
    </div>
  );
}

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h2 className="eyebrow mb-3">{title}</h2>
      <ul className="space-y-2 border-y border-border py-4">
        {items.map((i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-bone/90">
            <span className="h-1 w-1 rounded-full bg-signal mt-2 shrink-0" />
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}