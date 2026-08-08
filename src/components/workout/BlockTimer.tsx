import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Timer as TimerIcon } from "lucide-react";
import { formatClock } from "@/lib/programmeUtils";
import { cueEnd, cueRound, cueTick, primeAudio } from "@/lib/alertCue";
import type { TimerSpec } from "@/types/programme";

type Mode = "down" | "up";

interface Plan {
  mode: Mode;
  /** Seconds for countdown modes, or cap for count-up modes (0 = uncapped). */
  seconds: number;
  label: string;
  /** Boundary length in seconds for EMOM / interval cues (0 = none). */
  boundarySec: number;
  rounds: number;
  intervals?: { workSec: number; restSec: number };
}

function planFor(t: TimerSpec): Plan | null {
  switch (t.type) {
    case "countdown":
      return t.durationSec
        ? { mode: "down", seconds: t.durationSec, label: "Countdown", boundarySec: 0, rounds: 1 }
        : null;
    case "amrap":
      return t.durationSec
        ? { mode: "down", seconds: t.durationSec, label: "AMRAP", boundarySec: 0, rounds: 1 }
        : null;
    case "rest":
      return t.restSec
        ? { mode: "down", seconds: t.restSec, label: "Rest", boundarySec: 0, rounds: 1 }
        : null;
    case "emom": {
      const mins = t.minutes ?? 0;
      return mins
        ? { mode: "down", seconds: mins * 60, label: "EMOM", boundarySec: 60, rounds: mins }
        : null;
    }
    case "rft":
      return { mode: "up", seconds: t.capSec ?? 0, label: t.capSec ? "For time · cap" : "For time", boundarySec: 0, rounds: 1 };
    case "stopwatch":
      return { mode: "up", seconds: 0, label: "Stopwatch", boundarySec: 0, rounds: 1 };
    case "intervals": {
      const work = t.workSec ?? 0;
      const rest = t.restSec ?? 0;
      const rounds = t.rounds ?? 0;
      if (!work || !rounds) return null;
      return {
        mode: "down",
        seconds: (work + rest) * rounds,
        label: "Intervals",
        boundarySec: 0,
        rounds,
        intervals: { workSec: work, restSec: rest },
      };
    }
    default:
      return null;
  }
}

export function timerIsRunnable(t: TimerSpec | undefined): boolean {
  return !!t && planFor(t) !== null;
}

export function BlockTimer({ timer, onFinished }: { timer: TimerSpec; onFinished?: () => void }) {
  const plan = useMemo(() => planFor(timer), [timer]);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const lastBoundary = useRef(0);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const total = plan?.seconds ?? 0;
  const remaining = plan?.mode === "down" ? Math.max(0, total - elapsed) : 0;

  // Audible cues: last-3-second ticks, boundary tones, and a finish tone.
  useEffect(() => {
    if (!plan || !running) return;
    if (plan.mode === "down") {
      if (remaining > 0 && remaining <= 3) cueTick();
      if (remaining === 0 && !finishedRef.current) {
        finishedRef.current = true;
        cueEnd();
        setRunning(false);
        onFinished?.();
      }
    } else if (total > 0 && elapsed >= total && !finishedRef.current) {
      finishedRef.current = true;
      cueEnd();
      setRunning(false);
      onFinished?.();
    }
    const boundary = plan.intervals
      ? null
      : plan.boundarySec > 0
        ? plan.boundarySec
        : null;
    if (boundary && elapsed > 0 && elapsed % boundary === 0 && elapsed !== lastBoundary.current && remaining > 0) {
      lastBoundary.current = elapsed;
      cueRound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, running]);

  // Interval work/rest phase cue.
  const phase = useMemo(() => {
    if (!plan?.intervals) return null;
    const cycle = plan.intervals.workSec + plan.intervals.restSec;
    const round = Math.min(plan.rounds, Math.floor(elapsed / cycle) + 1);
    const within = elapsed % cycle;
    const isWork = within < plan.intervals.workSec;
    const left = isWork ? plan.intervals.workSec - within : cycle - within;
    return { round, isWork, left };
  }, [plan, elapsed]);

  const prevPhase = useRef<boolean | null>(null);
  useEffect(() => {
    if (!phase || !running) return;
    if (prevPhase.current !== null && prevPhase.current !== phase.isWork) cueRound();
    prevPhase.current = phase.isWork;
  }, [phase, running]);

  if (!plan) return null;

  const reset = () => {
    setRunning(false);
    setElapsed(0);
    finishedRef.current = false;
    lastBoundary.current = 0;
    prevPhase.current = null;
  };

  const toggle = () => {
    primeAudio();
    if (finishedRef.current) reset();
    setRunning((r) => !r);
  };

  const bigValue = phase
    ? formatClock(phase.left)
    : plan.mode === "down"
      ? formatClock(remaining)
      : formatClock(elapsed);

  const pct = total > 0 ? Math.min(100, (elapsed / total) * 100) : 0;

  const emomRound = plan.boundarySec === 60 && plan.rounds > 1
    ? Math.min(plan.rounds, Math.floor(elapsed / 60) + 1)
    : null;

  return (
    <div className="mt-8 border border-border bg-surface/40">
      <div className="flex items-center justify-between px-5 pt-4">
        <p className="eyebrow inline-flex items-center gap-1.5">
          <TimerIcon className="h-3 w-3" /> {plan.label}
        </p>
        <p className="text-[10px] uppercase tracking-widest text-foreground-muted tabular">
          {phase
            ? `${phase.isWork ? "Work" : "Rest"} · Round ${phase.round}/${plan.rounds}`
            : emomRound
              ? `Minute ${emomRound}/${plan.rounds}`
              : total > 0
                ? `of ${formatClock(total)}`
                : "Free run"}
        </p>
      </div>

      <p
        suppressHydrationWarning
        className={`px-5 pt-2 font-display font-bold tabular leading-none text-[clamp(3rem,16vw,5rem)] ${
          phase && !phase.isWork ? "text-foreground-muted" : "text-bone"
        }`}
      >
        {bigValue}
      </p>

      <div className="h-[2px] bg-surface-raised mt-4">
        <div className="h-full bg-signal transition-all" style={{ width: `${pct}%` }} />
      </div>

      <div className="flex gap-2 p-4">
        <button
          onClick={toggle}
          className="flex-1 h-12 inline-flex items-center justify-center gap-2 text-xs font-display uppercase tracking-widest bg-bone text-obsidian rounded-[4px]"
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {running ? "Pause" : elapsed > 0 ? "Resume" : "Start timer"}
        </button>
        <button
          onClick={reset}
          className="h-12 w-12 border border-border text-foreground-muted hover:text-bone inline-flex items-center justify-center rounded-[4px]"
          aria-label="Reset timer"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
