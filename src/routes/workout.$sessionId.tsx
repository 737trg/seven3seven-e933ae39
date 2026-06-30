import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { getSessionById } from "@/data/programme";
import { ChevronLeft, ChevronRight, Pause, Play, X, Check } from "lucide-react";
import { formatClock } from "@/lib/programmeUtils";
import { store } from "@/lib/store";

export const Route = createFileRoute("/workout/$sessionId")({
  component: WorkoutPage,
});

function WorkoutPage() {
  const { sessionId } = useParams({ from: "/workout/$sessionId" });
  const s = getSessionById(sessionId);
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef<string>(new Date().toISOString());
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) return;
    tick.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { if (tick.current) clearInterval(tick.current); };
  }, [paused]);

  if (!s) {
    return <div className="min-h-screen flex items-center justify-center text-foreground-muted">Session not found.</div>;
  }

  const block = s.blocks[idx];
  const total = s.blocks.length;
  const doneCount = Object.values(done).filter(Boolean).length;

  const next = () => setIdx((i) => Math.min(total - 1, i + 1));
  const prev = () => setIdx((i) => Math.max(0, i - 1));

  const finish = () => {
    store.saveLog({
      sessionId: s.id,
      startedAt: startedAt.current,
      endedAt: new Date().toISOString(),
      durationSec: elapsed,
      completed: true,
      blocks: s.blocks.map((b) => ({ blockId: b.id, completed: !!done[b.id] })),
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* HUD */}
      <header className="border-b border-border">
        <div className="max-w-[720px] mx-auto px-5 lg:px-10 py-4 flex items-center justify-between">
          <Link
            to="/programme/s/$sessionId"
            params={{ sessionId: s.id }}
            className="text-foreground-muted hover:text-bone inline-flex items-center gap-1 text-xs uppercase tracking-widest"
          >
            <X className="h-4 w-4" /> Exit
          </Link>
          <div className="text-center">
            <p className="eyebrow">{s.day} · Week {s.weekNumber === 8 ? "RW" : s.weekNumber}</p>
            <p className="font-display text-bone text-sm">{s.title}</p>
          </div>
          <span className="tabular text-bone font-display text-lg w-20 text-right">
            {formatClock(elapsed)}
          </span>
        </div>
        {/* progress */}
        <div className="h-[2px] bg-surface-raised">
          <div
            className="h-full bg-signal transition-all"
            style={{ width: `${((idx + 1) / total) * 100}%` }}
          />
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <div className="max-w-[720px] mx-auto w-full px-5 lg:px-10 py-10 flex-1">
          <p className="eyebrow mb-4">
            Block {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} · {block.timeWindow ?? ""}
          </p>
          <h1 className="font-display font-bold text-bone text-3xl lg:text-5xl leading-[0.95] tracking-tight">
            {block.title}
          </h1>

          <ul className="mt-10 space-y-3">
            {block.lines.map((l, i) => (
              <li key={i} className="flex items-start gap-3 text-bone text-base lg:text-lg leading-snug">
                <span className="text-signal h-1.5 w-1.5 rounded-full mt-2.5 shrink-0" />
                <span>{l}</span>
              </li>
            ))}
          </ul>

          {block.timer && (
            <div className="mt-10 border border-border p-5 text-sm text-foreground-muted">
              <p className="eyebrow mb-2">Timer</p>
              <p className="text-bone tabular font-display text-2xl">
                {timerLabel(block.timer)}
              </p>
            </div>
          )}

          {block.note && (
            <p className="mt-8 text-xs text-foreground-muted italic">{block.note}</p>
          )}

          <button
            onClick={() => setDone({ ...done, [block.id]: !done[block.id] })}
            className={`mt-10 w-full h-14 inline-flex items-center justify-center gap-2 text-sm font-display uppercase tracking-wide rounded-[4px] transition-colors ${
              done[block.id]
                ? "bg-signal text-bone"
                : "bg-surface-raised text-bone hover:bg-surface-raised/80"
            }`}
          >
            <Check className="h-4 w-4" />
            {done[block.id] ? "Block complete" : "Mark block complete"}
          </button>
        </div>
      </main>

      <footer
        className="border-t border-border bg-background"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="max-w-[720px] mx-auto px-5 lg:px-10 py-4 flex items-center gap-3">
          <button
            onClick={prev}
            disabled={idx === 0}
            className="h-12 w-12 border border-border text-bone disabled:opacity-30 flex items-center justify-center"
            aria-label="Previous block"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setPaused(!paused)}
            className="h-12 px-4 border border-border text-bone inline-flex items-center gap-2 text-xs uppercase tracking-widest"
          >
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {paused ? "Resume" : "Pause"}
          </button>
          <span className="tabular text-foreground-muted text-xs ml-auto">
            {doneCount}/{total} blocks
          </span>
          {idx < total - 1 ? (
            <button
              onClick={next}
              className="h-12 px-5 bg-bone text-obsidian font-display text-xs uppercase tracking-wide inline-flex items-center gap-2"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <Link
              to="/workout/$sessionId/done"
              params={{ sessionId: s.id }}
              onClick={finish}
              className="h-12 px-5 bg-signal text-bone font-display text-xs uppercase tracking-wide inline-flex items-center gap-2"
            >
              Finish
            </Link>
          )}
        </div>
      </footer>
    </div>
  );
}

function timerLabel(t: NonNullable<ReturnType<typeof getSessionById>>["blocks"][number]["timer"]) {
  if (!t) return "—";
  switch (t.type) {
    case "countdown": return `Countdown · ${formatClock(t.durationSec ?? 0)}`;
    case "stopwatch": return "Stopwatch";
    case "emom": return `EMOM · ${t.minutes} min`;
    case "amrap": return `AMRAP · ${formatClock(t.durationSec ?? 0)}`;
    case "intervals": return `Intervals · ${t.rounds ?? "?"} rounds`;
    case "rft": return `RFT · cap ${formatClock(t.capSec ?? 0)}`;
    case "rest": return `Rest · ${t.restSec}s`;
    default: return "—";
  }
}