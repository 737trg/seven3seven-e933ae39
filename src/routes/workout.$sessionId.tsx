import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
  useParams,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { resolveSession, type ResolvedSession } from "@/lib/anySession";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Pause, Play, X, Check } from "lucide-react";
import { formatClock } from "@/lib/programmeUtils";
import { store, subscribeStore } from "@/lib/store";
import { LogDrawer } from "@/components/workout/LogDrawer";
import { summariseResult } from "@/components/workout/logKind";
import { ProgrammeAccessGate } from "@/lib/athxAccess";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/workout/$sessionId")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  component: WorkoutRoute,
});

function WorkoutRoute() {
  const isDoneRoute = useRouterState({
    select: (state) => state.location.pathname.endsWith("/done"),
  });
  const { sessionId } = useParams({ from: "/workout/$sessionId" });
  const resolved = resolveSession(sessionId);
  const programme = resolved?.programme;
  const slug = programme?.slug ?? "athx-2026";
  const programmeId = programme?.programmeId ?? "athx-2026";
  const programmeName =
    slug === "basic-training-blueprint-plus"
      ? "Basic Training Blueprint+"
      : slug === "hybrid-race-plan"
        ? "Hybrid Race Plan"
        : slug === "sem-2026"
          ? "S.E.M 2026"
          : "ATHX 2026";

  return (
    <ProgrammeAccessGate slug={slug} programmeId={programmeId} programmeName={programmeName}>
      {isDoneRoute ? <Outlet /> : <WorkoutPage resolved={resolved} />}
    </ProgrammeAccessGate>
  );
}

function WorkoutPage({ resolved }: { resolved: ResolvedSession | undefined }) {
  const { sessionId } = useParams({ from: "/workout/$sessionId" });
  const navigate = useNavigate();
  const s = resolved?.session;
  const programme = resolved?.programme;
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [logOpen, setLogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const startedAt = useRef<string>(new Date().toISOString());
  const restored = useRef(false);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  // Subscribe to store so newly-saved results re-render the summary line.
  const resultsTick = useSyncExternalStore(
    subscribeStore,
    () => store.getResults().length,
    () => 0,
  );

  useEffect(() => {
    const id = window.setTimeout(() => setHydrated(true), 50);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (paused) return;
    tick.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { if (tick.current) clearInterval(tick.current); };
  }, [paused]);

  useEffect(() => {
    if (!s) return;
    const savedWorkout = store.getWorkoutState(s.id);
    if (savedWorkout) {
      startedAt.current = savedWorkout.startedAt;
      setIdx(Math.min(savedWorkout.currentBlockIndex, s.blocks.length - 1));
      setDone(savedWorkout.done);
      setElapsed(savedWorkout.elapsedSec);
    }
    restored.current = true;
  }, [s]);

  useEffect(() => {
    if (!s || !restored.current) return;
    store.saveWorkoutState({
      sessionId: s.id,
      startedAt: startedAt.current,
      updatedAt: new Date().toISOString(),
      currentBlockIndex: idx,
      elapsedSec: elapsed,
      done,
    });
  }, [s, idx, elapsed, done]);

  if (!s) {
    return <div className="min-h-screen flex items-center justify-center text-foreground-muted">Session not found.</div>;
  }

  const block = s.blocks[idx];
  const total = s.blocks.length;
  const doneCount = Object.values(done).filter(Boolean).length;

  // Latest result for this block (any session) and today's saved result (if any).
  const sessionDateISO = s.date ?? new Date().toISOString().slice(0, 10);
  const lastResult = hydrated
    ? store.getLastResultForExercise(block.title, {
        sessionId: s.id,
        blockId: block.id,
        dateISO: sessionDateISO,
      })
    : undefined;
  const todaysResult = (() => {
    if (!hydrated) return undefined;
    const list = store
      .getResultsForBlock(s.id, block.id)
      .filter((r) => r.dateISO === sessionDateISO);
    return list[list.length - 1];
  })();
  // Use the underscored var to silence unused-warnings if any
  void resultsTick;

  const next = () => setIdx((i) => Math.min(total - 1, i + 1));
  const prev = () => setIdx((i) => Math.max(0, i - 1));

  const completeBlock = () => {
    setDone((d) => ({ ...d, [block.id]: true }));
    setConfirmOpen(false);
  };

  const requestComplete = () => {
    if (done[block.id]) {
      setDone((d) => ({ ...d, [block.id]: false }));
      return;
    }
    if (!todaysResult) {
      setConfirmOpen(true);
      return;
    }
    completeBlock();
  };

  const finish = () => {
    store.saveLog({
      sessionId: s.id,
      startedAt: startedAt.current,
      endedAt: new Date().toISOString(),
      durationSec: elapsed,
      completed: true,
      blocks: s.blocks.map((b) => ({ blockId: b.id, completed: !!done[b.id] })),
    });
    store.clearWorkoutState(s.id);
    // Mirror completion to Supabase for non-ATHX programmes so their
    // existing progress pages (which read session_completions) reflect it.
    if (programme && !programme.isAthx) {
      void mirrorCompletionToSupabase({
        slug: programme.slug,
        sessionId: s.id,
        durationSec: elapsed,
      });
    }
    void navigate({
      to: "/workout/$sessionId/done",
      params: { sessionId: s.id },
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* HUD */}
      <header className="border-b border-border">
        <div className="max-w-[720px] mx-auto px-5 lg:px-10 py-4 flex items-center justify-between">
          <Link
            to={programme?.backHref || `/programme/s/${s.id}`}
            className="text-foreground-muted hover:text-bone inline-flex items-center gap-1 text-xs uppercase tracking-widest"
          >
            <X className="h-4 w-4" /> Exit
          </Link>
          <div className="text-center">
            <p className="eyebrow">{s.day} · Week {s.weekNumber === 8 ? "RW" : s.weekNumber}</p>
            <p className="font-display text-bone text-sm">{s.title}</p>
          </div>
          <span
            suppressHydrationWarning
            className="tabular text-bone font-display text-lg w-20 text-right"
          >
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

          {/* Previous / Today result line — muted, single-line */}
          {(todaysResult || lastResult) && (
            <div className="mt-6 border-t border-border pt-4 text-xs">
              {todaysResult ? (
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="eyebrow text-foreground-muted">Logged</span>
                  <span className="text-bone tabular">{summariseResult(todaysResult)}</span>
                  {todaysResult.note && (
                    <span className="text-foreground-muted italic">· {todaysResult.note}</span>
                  )}
                </div>
              ) : lastResult ? (
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="eyebrow text-foreground-muted">Last time</span>
                  <span className="text-foreground-muted tabular">
                    {summariseResult(lastResult)}
                  </span>
                  <span className="text-foreground-muted/70">· {lastResult.dateISO}</span>
                </div>
              ) : null}
            </div>
          )}

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

          {/* Actions: subtle Log work + primary Mark block complete */}
          <div className="mt-10 space-y-3">
            <button
              onClick={() => setLogOpen(true)}
              className="w-full h-11 inline-flex items-center justify-center gap-2 text-[11px] font-display uppercase tracking-widest border border-border text-foreground-muted hover:text-bone hover:border-bone transition-colors rounded-[4px]"
            >
              {todaysResult ? "Edit logged result" : "Log work"}
            </button>
            <button
              onClick={requestComplete}
              className={`w-full h-14 inline-flex items-center justify-center gap-2 text-sm font-display uppercase tracking-wide rounded-[4px] transition-colors ${
                done[block.id]
                  ? "bg-signal text-bone"
                  : "bg-surface-raised text-bone hover:bg-surface-raised/80"
              }`}
            >
              <Check className="h-4 w-4" />
              {done[block.id] ? "Block complete" : "Mark block complete"}
            </button>
          </div>
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
            <button
              onClick={finish}
              className="h-12 px-5 bg-signal text-bone font-display text-xs uppercase tracking-wide inline-flex items-center gap-2"
            >
              Finish
            </button>
          )}
        </div>
      </footer>

      {/* Logging drawer */}
      <LogDrawer
        open={logOpen}
        onOpenChange={setLogOpen}
        session={s}
        block={block}
      />

      {/* Confirm complete without logging */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="bg-background border border-border text-bone rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-bone">
              Complete without logging a result?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-foreground-muted text-sm">
              You can still mark this block done, but nothing will be saved to your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              onClick={() => {
                setConfirmOpen(false);
                setLogOpen(true);
              }}
              className="bg-transparent border border-border text-bone hover:bg-surface-raised rounded-none text-[11px] uppercase tracking-widest"
            >
              Log result
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={completeBlock}
              className="bg-signal text-bone hover:bg-signal/90 rounded-none text-[11px] uppercase tracking-widest"
            >
              Complete without result
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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