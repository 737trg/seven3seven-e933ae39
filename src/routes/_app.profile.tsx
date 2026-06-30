import { createFileRoute, Link } from "@tanstack/react-router";
import { useSyncExternalStore, useState } from "react";
import { store, subscribeStore } from "@/lib/store";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const athlete = useSyncExternalStore(subscribeStore, store.getAthlete, store.getAthlete);
  const settings = useSyncExternalStore(subscribeStore, store.getSettings, store.getSettings);
  const [pbs, setPbs] = useState(athlete.pbs);

  const save = () => store.updateAthlete({ pbs });

  return (
    <div className="max-w-[720px] mx-auto px-5 lg:px-10 py-8 lg:py-14">
      <header className="mb-10">
        <p className="eyebrow mb-3">Profile</p>
        <h1 className="font-display font-bold text-bone text-4xl lg:text-6xl leading-none">
          {athlete.name}.
        </h1>
        <p className="text-foreground-muted mt-3 text-sm">{athlete.category}</p>
      </header>

      <section className="border-y border-border py-6 mb-10 space-y-2 text-sm">
        <Row label="Competition" value={athlete.competition} />
        <Row label="Race date" value="23 Aug 2026" />
        <Row label="Units" value="kg · km · 24-hour" />
      </section>

      <section className="mb-10">
        <h2 className="eyebrow mb-4">Personal bests</h2>
        <div className="grid grid-cols-2 gap-4">
          <NumberField label="Strict press 1RM" value={pbs.strictPress1RM} onChange={(v) => setPbs({ ...pbs, strictPress1RM: v })} unit="kg" />
          <NumberField label="Back squat 1RM" value={pbs.backSquat1RM} onChange={(v) => setPbs({ ...pbs, backSquat1RM: v })} unit="kg" />
          <NumberField label="Deadlift 1RM" value={pbs.deadlift1RM} onChange={(v) => setPbs({ ...pbs, deadlift1RM: v })} unit="kg" />
          <NumberField label="Clean & jerk" value={pbs.cleanJerk} onChange={(v) => setPbs({ ...pbs, cleanJerk: v })} unit="kg" />
          <NumberField label="Snatch" value={pbs.snatch} onChange={(v) => setPbs({ ...pbs, snatch: v })} unit="kg" />
          <NumberField label="Working DB" value={athlete.workingDbKg} onChange={(v) => store.updateAthlete({ workingDbKg: v })} unit="kg" />
        </div>
        <button
          onClick={save}
          className="mt-6 h-11 px-6 bg-bone text-obsidian text-xs uppercase tracking-wide font-display"
        >
          Save numbers
        </button>
      </section>

      <section className="mb-10">
        <h2 className="eyebrow mb-4">Cues</h2>
        <Toggle
          label="Sound cues"
          value={settings.sound}
          onChange={(v) => store.saveSettings({ sound: v })}
        />
        <Toggle
          label="Vibration"
          value={settings.vibration}
          onChange={(v) => store.saveSettings({ vibration: v })}
        />
      </section>

      <section className="mb-10">
        <h2 className="eyebrow mb-4">Tools</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/calculator" className="border border-border p-4 hover:border-bone text-sm">
            Load calculator →
          </Link>
          <Link to="/race" className="border border-border p-4 hover:border-bone text-sm">
            Race-day plan →
          </Link>
        </div>
      </section>

      <section>
        <button
          onClick={() => {
            if (confirm("Reset all logged data?")) store.reset();
          }}
          className="text-xs uppercase tracking-widest text-signal hover:underline"
        >
          Reset local data
        </button>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-foreground-muted text-xs uppercase tracking-widest">{label}</span>
      <span className="text-bone">{value}</span>
    </div>
  );
}

function NumberField({
  label, value, unit, onChange,
}: { label: string; value: number; unit: string; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="block eyebrow mb-1.5">{label}</span>
      <div className="flex items-baseline gap-2 border-b border-border focus-within:border-bone py-2">
        <input
          type="number"
          step="0.5"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="bg-transparent outline-none text-bone tabular text-2xl font-display w-full min-w-0"
        />
        <span className="text-foreground-muted text-xs uppercase tracking-widest">{unit}</span>
      </div>
    </label>
  );
}

function Toggle({
  label, value, onChange,
}: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-full flex items-center justify-between py-3 border-b border-border"
    >
      <span className="text-bone text-sm">{label}</span>
      <span
        className={`h-5 w-9 rounded-full relative transition-colors ${
          value ? "bg-signal" : "bg-surface-raised"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-bone transition-transform ${
            value ? "translate-x-4" : ""
          }`}
        />
      </span>
    </button>
  );
}