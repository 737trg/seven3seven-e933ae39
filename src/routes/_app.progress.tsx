import { createFileRoute } from "@tanstack/react-router";
import { useSyncExternalStore } from "react";
import { store, subscribeStore } from "@/lib/store";
import { PROGRAMME, allSessions } from "@/data/programme";
import { weeklyCompletion } from "@/lib/programmeUtils";

export const Route = createFileRoute("/_app/progress")({
  component: ProgressPage,
});

function ProgressPage() {
  const logs = useSyncExternalStore(subscribeStore, store.getLogs, store.getLogs);
  const athlete = useSyncExternalStore(subscribeStore, store.getAthlete, store.getAthlete);
  const sessions = allSessions();
  const completed = sessions.filter((s) => logs[s.id]?.completed).length;

  return (
    <div className="max-w-[1080px] mx-auto px-5 lg:px-10 py-8 lg:py-14">
      <header className="mb-12">
        <p className="eyebrow mb-3">Progress</p>
        <h1 className="font-display font-bold text-bone text-4xl lg:text-6xl leading-none">
          Performance.
        </h1>
      </header>

      {/* Top stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-14 border-y border-border py-8">
        <BigStat label="Sessions complete" value={`${completed}/${sessions.length}`} />
        <BigStat label="Press 1RM" value={`${athlete.pbs.strictPress1RM} kg`} />
        <BigStat label="Squat 1RM" value={`${athlete.pbs.backSquat1RM} kg`} />
        <BigStat label="Deadlift 1RM" value={`${athlete.pbs.deadlift1RM} kg`} />
      </section>

      {/* Weekly grid */}
      <section className="mb-14">
        <h2 className="eyebrow mb-5">Weekly consistency</h2>
        <div className="space-y-3">
          {PROGRAMME.weeks.map((w) => {
            const c = weeklyCompletion(w, logs);
            return (
              <div key={w.number} className="flex items-center gap-4">
                <span className="w-24 text-xs text-foreground-muted uppercase tracking-widest">
                  {w.label}
                </span>
                <div className="flex-1 grid grid-cols-6 gap-1">
                  {w.sessions.map((s) => (
                    <div
                      key={s.id}
                      className={`h-4 ${
                        logs[s.id]?.completed ? "bg-signal" : "bg-surface-raised"
                      }`}
                    />
                  ))}
                </div>
                <span className="w-12 tabular text-xs text-bone text-right">
                  {c.done}/{c.total}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border border-border p-6">
        <h2 className="eyebrow mb-3">Benchmarks</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
          <BigStat label="5 km" value={fmtPace(athlete.pbs.run5kSec)} />
          <BigStat label="10 km" value={fmtPace(athlete.pbs.run10kSec)} />
          <BigStat label="Clean & jerk" value={`${athlete.pbs.cleanJerk} kg`} />
          <BigStat label="Snatch" value={`${athlete.pbs.snatch} kg`} />
        </div>
        <p className="text-xs text-foreground-muted mt-6">
          Logged session results will appear here as the programme progresses.
        </p>
      </section>
    </div>
  );
}

function BigStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="eyebrow mb-2">{label}</p>
      <p className="font-display font-bold tabular text-bone text-2xl lg:text-3xl">
        {value}
      </p>
    </div>
  );
}

const fmtPace = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};