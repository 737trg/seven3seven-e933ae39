import { useEffect, useMemo, useRef, useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { store } from "@/lib/store";
import { PROGRAMME } from "@/data/programme";
import { formatClock } from "@/lib/programmeUtils";
import { inferLogKind, kindLabel, summariseResult } from "./logKind";
import type {
  BlockResult,
  BlockResultDraft,
  HoldEntry,
  IntervalEntry,
  LogKind,
  Session,
  SessionBlock,
  StrengthSetEntry,
  StrengthSetGroup,
} from "@/types/programme";
import { Check, Plus, X, Minus, Timer } from "lucide-react";

/* ---------------------------------------------------------------- *
 * Small primitives kept local so we don't introduce generic form chrome
 * into the workout aesthetic.
 * ---------------------------------------------------------------- */

function Field({
  label,
  children,
  suffix,
}: {
  label: string;
  children: React.ReactNode;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-widest text-foreground-muted mb-1.5">
        {label}
        {suffix && (
          <span className="ml-1 text-foreground-muted/60">({suffix})</span>
        )}
      </span>
      <span className="flex items-baseline gap-2 border-b border-border focus-within:border-bone transition-colors">
        {children}
      </span>
    </label>
  );
}

function NumInput({
  value,
  onChange,
  step = 1,
  placeholder,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  step?: number;
  placeholder?: string;
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      step={step}
      value={value ?? ""}
      onChange={(e) => {
        const raw = e.target.value;
        onChange(raw === "" ? undefined : Number(raw));
      }}
      placeholder={placeholder}
      className="flex-1 bg-transparent outline-none text-bone tabular text-lg py-1.5 placeholder:text-foreground-muted/50"
    />
  );
}

function Pills<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T | undefined;
  options: { label: string; value: T }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={String(o.value)}
            type="button"
            onClick={() => onChange(o.value)}
            className={`h-9 px-3 text-[11px] uppercase tracking-widest border ${
              active
                ? "border-signal bg-signal/10 text-bone"
                : "border-border text-foreground-muted hover:text-bone"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------- *
 * Initial draft per kind
 * ---------------------------------------------------------------- */

function makeInitial(
  kind: LogKind,
  block: SessionBlock,
  last?: BlockResult,
): BlockResultDraft {
  const base: BlockResultDraft = {
    sessionId: "",
    blockId: block.id,
    exercise: block.title,
    kind,
    prescribed: block.lines[0],
  };
  if (kind === "strength" || kind === "olympic") {
    const lastSets = last?.sets;
    return {
      ...base,
      sets:
        lastSets && lastSets.length > 0
          ? lastSets.map((s) => ({ ...s, missed: false }))
          : [
              {
                group: "top",
                weightKg: undefined,
                reps: undefined,
                rpe: undefined,
              },
            ],
    };
  }
  if (kind === "intervals") return { ...base, intervals: [{}] };
  if (kind === "hold") return { ...base, holds: [{}] };
  return base;
}

/* ---------------------------------------------------------------- *
 * Strength block (full set logging + rest timer)
 * ---------------------------------------------------------------- */

function StrengthForm({
  state,
  setState,
  block,
}: {
  state: BlockResultDraft;
  setState: (s: BlockResultDraft) => void;
  block: SessionBlock;
}) {
  const sets = state.sets ?? [];
  const restSec = block.timer?.restSec ?? 90;
  const [restRemaining, setRestRemaining] = useState<number | null>(null);
  const restTick = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (restRemaining == null) return;
    restTick.current = setInterval(() => {
      setRestRemaining((r) => {
        if (r == null) return null;
        if (r <= 1) return null;
        return r - 1;
      });
    }, 1000);
    return () => {
      if (restTick.current) clearInterval(restTick.current);
    };
  }, [restRemaining]);

  const updateSet = (i: number, patch: Partial<StrengthSetEntry>) => {
    const next = sets.map((s, k) => (k === i ? { ...s, ...patch } : s));
    setState({ ...state, sets: next });
  };

  const removeSet = (i: number) => {
    setState({ ...state, sets: sets.filter((_, k) => k !== i) });
  };

  const addSet = (group: StrengthSetGroup) => {
    const prev = sets[sets.length - 1];
    setState({
      ...state,
      sets: [
        ...sets,
        {
          group,
          weightKg: prev?.weightKg,
          reps: prev?.reps,
          rpe: undefined,
        },
      ],
    });
  };

  const groupLabel: Record<StrengthSetGroup, string> = {
    warmup: "Warm-up",
    top: "Top set",
    backoff: "Back-off",
    assistance: "Assistance",
  };

  // Group sets sequentially while preserving order
  const grouped = useMemo(() => {
    const out: { group: StrengthSetGroup; indices: number[] }[] = [];
    sets.forEach((s, i) => {
      const last = out[out.length - 1];
      if (last && last.group === s.group) last.indices.push(i);
      else out.push({ group: s.group, indices: [i] });
    });
    return out;
  }, [sets]);

  return (
    <div className="space-y-6">
      {restRemaining != null && (
        <div className="border border-signal/40 bg-signal/5 px-4 py-3 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-foreground-muted inline-flex items-center gap-1.5">
            <Timer className="h-3 w-3" /> Rest
          </span>
          <span className="font-display tabular text-bone text-2xl">
            {formatClock(restRemaining)}
          </span>
          <button
            type="button"
            onClick={() => setRestRemaining(null)}
            className="text-[10px] uppercase tracking-widest text-foreground-muted hover:text-bone"
          >
            Skip
          </button>
        </div>
      )}

      {grouped.map((g, gi) => (
        <section key={`${g.group}-${gi}`}>
          <p className="eyebrow mb-3">{groupLabel[g.group]}</p>
          <div className="space-y-4">
            {g.indices.map((i, n) => {
              const s = sets[i];
              return (
                <div key={i} className="border-b border-border pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-widest text-foreground-muted">
                      Set {n + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateSet(i, { missed: !s.missed })}
                        className={`h-7 px-2 text-[10px] uppercase tracking-widest border ${
                          s.missed
                            ? "border-signal text-signal"
                            : "border-border text-foreground-muted hover:text-bone"
                        }`}
                      >
                        {s.missed ? "Missed" : "Mark missed"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSet(i)}
                        className="h-7 w-7 inline-flex items-center justify-center border border-border text-foreground-muted hover:text-bone"
                        aria-label="Remove set"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Weight" suffix="kg">
                      <NumInput
                        value={s.weightKg}
                        onChange={(v) => updateSet(i, { weightKg: v })}
                        step={2.5}
                      />
                    </Field>
                    <Field label="Reps">
                      <NumInput
                        value={s.reps}
                        onChange={(v) => updateSet(i, { reps: v })}
                      />
                    </Field>
                    <Field label="RPE">
                      <NumInput
                        value={s.rpe}
                        onChange={(v) => updateSet(i, { rpe: v })}
                        step={0.5}
                      />
                    </Field>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <div className="flex flex-wrap gap-2 pt-2">
        {(
          ["warmup", "top", "backoff", "assistance"] as StrengthSetGroup[]
        ).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => addSet(g)}
            className="h-9 px-3 text-[10px] uppercase tracking-widest border border-border text-foreground-muted hover:text-bone inline-flex items-center gap-1.5"
          >
            <Plus className="h-3 w-3" /> {groupLabel[g]}
          </button>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => setRestRemaining(restSec)}
          className="flex-1 h-11 bg-surface-raised text-bone text-[11px] uppercase tracking-widest font-display inline-flex items-center justify-center gap-2"
        >
          <Timer className="h-3.5 w-3.5" /> Start rest · {restSec}s
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- *
 * Other kinds — compact field sets
 * ---------------------------------------------------------------- */

function RxScaledRpe({
  state,
  setState,
  rx = true,
}: {
  state: BlockResultDraft;
  setState: (s: BlockResultDraft) => void;
  rx?: boolean;
}) {
  return (
    <div className="space-y-4">
      {rx && (
        <div>
          <p className="eyebrow mb-2">Standard</p>
          <Pills
            value={state.rxOrScaled}
            options={[
              { label: "RX", value: "rx" as const },
              { label: "Scaled", value: "scaled" as const },
            ]}
            onChange={(v) => setState({ ...state, rxOrScaled: v })}
          />
        </div>
      )}
      <div>
        <p className="eyebrow mb-2">Session RPE</p>
        <Pills
          value={state.rpe}
          options={[5, 6, 7, 8, 9, 10].map((n) => ({ label: String(n), value: n }))}
          onChange={(v) => setState({ ...state, rpe: v })}
        />
      </div>
    </div>
  );
}

function AmrapForm({ state, setState }: any) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Full rounds">
          <NumInput value={state.rounds} onChange={(v) => setState({ ...state, rounds: v })} />
        </Field>
        <Field label="Extra reps">
          <NumInput
            value={state.extraReps}
            onChange={(v) => setState({ ...state, extraReps: v })}
          />
        </Field>
      </div>
      <Field label="Load" suffix="kg">
        <NumInput
          value={state.weightKg}
          onChange={(v) => setState({ ...state, weightKg: v })}
          step={2.5}
        />
      </Field>
      <RxScaledRpe state={state} setState={setState} />
    </div>
  );
}

function EmomForm({ state, setState }: any) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Min completed">
          <NumInput
            value={state.minutesCompleted}
            onChange={(v) => setState({ ...state, minutesCompleted: v })}
          />
        </Field>
        <Field label="Failed min">
          <NumInput
            value={state.failedMinutes}
            onChange={(v) => setState({ ...state, failedMinutes: v })}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Load" suffix="kg">
          <NumInput
            value={state.weightKg}
            onChange={(v) => setState({ ...state, weightKg: v })}
            step={2.5}
          />
        </Field>
        <Field label="Lowest rest" suffix="s">
          <NumInput
            value={state.lowestRestSec}
            onChange={(v) => setState({ ...state, lowestRestSec: v })}
          />
        </Field>
      </div>
      <RxScaledRpe state={state} setState={setState} rx={false} />
    </div>
  );
}

function RftForm({ state, setState }: any) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Time" suffix="sec">
          <NumInput value={state.timeSec} onChange={(v) => setState({ ...state, timeSec: v })} />
        </Field>
        <Field label="Capped">
          <Pills
            value={state.capped ? "yes" : "no"}
            options={[
              { label: "Finished", value: "no" },
              { label: "Capped", value: "yes" },
            ]}
            onChange={(v) => setState({ ...state, capped: v === "yes" })}
          />
        </Field>
      </div>
      {state.capped && (
        <Field label="Stopped at">
          <input
            type="text"
            value={state.stoppedAt ?? ""}
            onChange={(e) => setState({ ...state, stoppedAt: e.target.value })}
            placeholder="e.g. Round 3, 4th burpee"
            className="flex-1 bg-transparent outline-none text-bone text-base py-1.5 placeholder:text-foreground-muted/50"
          />
        </Field>
      )}
      <RxScaledRpe state={state} setState={setState} />
    </div>
  );
}

function TimeCapForm({ state, setState }: any) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Full rounds">
          <NumInput value={state.rounds} onChange={(v) => setState({ ...state, rounds: v })} />
        </Field>
        <Field label="Extra reps">
          <NumInput
            value={state.extraReps}
            onChange={(v) => setState({ ...state, extraReps: v })}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Extra distance" suffix="m">
          <NumInput
            value={state.extraDistanceM}
            onChange={(v) => setState({ ...state, extraDistanceM: v })}
          />
        </Field>
        <Field label="Load" suffix="kg">
          <NumInput
            value={state.weightKg}
            onChange={(v) => setState({ ...state, weightKg: v })}
            step={2.5}
          />
        </Field>
      </div>
      <Field label="Stopped at">
        <input
          type="text"
          value={state.stoppedAt ?? ""}
          onChange={(e) => setState({ ...state, stoppedAt: e.target.value })}
          placeholder="Final movement"
          className="flex-1 bg-transparent outline-none text-bone text-base py-1.5 placeholder:text-foreground-muted/50"
        />
      </Field>
      <RxScaledRpe state={state} setState={setState} />
    </div>
  );
}

function IntervalsForm({ state, setState }: any) {
  const intervals: IntervalEntry[] = state.intervals ?? [];
  const update = (i: number, patch: Partial<IntervalEntry>) =>
    setState({
      ...state,
      intervals: intervals.map((iv, k) => (k === i ? { ...iv, ...patch } : iv)),
    });
  return (
    <div className="space-y-5">
      <div className="space-y-4">
        {intervals.map((iv, i) => (
          <div key={i} className="border-b border-border pb-3">
            <p className="text-[10px] uppercase tracking-widest text-foreground-muted mb-2">
              Interval {i + 1}
            </p>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Time" suffix="s">
                <NumInput value={iv.timeSec} onChange={(v) => update(i, { timeSec: v })} />
              </Field>
              <Field label="Dist" suffix="m">
                <NumInput value={iv.distanceM} onChange={(v) => update(i, { distanceM: v })} />
              </Field>
              <Field label="/500m">
                <NumInput
                  value={iv.paceSecPer500}
                  onChange={(v) => update(i, { paceSecPer500: v })}
                />
              </Field>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setState({ ...state, intervals: [...intervals, {}] })}
        className="h-9 px-3 text-[10px] uppercase tracking-widest border border-border text-foreground-muted hover:text-bone inline-flex items-center gap-1.5"
      >
        <Plus className="h-3 w-3" /> Add interval
      </button>
      <Field label="Avg HR" suffix="bpm">
        <NumInput value={state.avgHr} onChange={(v) => setState({ ...state, avgHr: v })} />
      </Field>
      <RxScaledRpe state={state} setState={setState} rx={false} />
    </div>
  );
}

function Zone2Form({ state, setState }: any) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Duration" suffix="sec">
          <NumInput
            value={state.durationSec}
            onChange={(v) => setState({ ...state, durationSec: v })}
          />
        </Field>
        <Field label="Distance" suffix="m">
          <NumInput
            value={state.distanceM}
            onChange={(v) => setState({ ...state, distanceM: v })}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Pace" suffix="s/km">
          <NumInput
            value={state.paceSecPerKm}
            onChange={(v) => setState({ ...state, paceSecPerKm: v })}
          />
        </Field>
        <Field label="Avg HR" suffix="bpm">
          <NumInput value={state.avgHr} onChange={(v) => setState({ ...state, avgHr: v })} />
        </Field>
      </div>
      <div>
        <p className="eyebrow mb-2">Feel</p>
        <Pills
          value={state.feel}
          options={[1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: n }))}
          onChange={(v) => setState({ ...state, feel: v })}
        />
      </div>
    </div>
  );
}

function CarryForm({ state, setState }: any) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <Field label="Weight" suffix="kg">
          <NumInput
            value={state.weightKg}
            onChange={(v) => setState({ ...state, weightKg: v })}
            step={2.5}
          />
        </Field>
        <Field label="Distance" suffix="m">
          <NumInput
            value={state.distanceM}
            onChange={(v) => setState({ ...state, distanceM: v })}
          />
        </Field>
        <Field label="Time" suffix="sec">
          <NumInput value={state.timeSec} onChange={(v) => setState({ ...state, timeSec: v })} />
        </Field>
      </div>
      <RxScaledRpe state={state} setState={setState} rx={false} />
    </div>
  );
}

function HoldForm({ state, setState }: any) {
  const holds: HoldEntry[] = state.holds ?? [];
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {holds.map((h, i) => (
          <div key={i} className="flex items-end gap-3 border-b border-border pb-3">
            <span className="text-[10px] uppercase tracking-widest text-foreground-muted w-12 pb-2">
              Set {i + 1}
            </span>
            <div className="flex-1">
              <Field label="Duration" suffix="sec">
                <NumInput
                  value={h.durationSec}
                  onChange={(v) => {
                    const next = holds.map((x, k) =>
                      k === i ? { ...x, durationSec: v } : x,
                    );
                    setState({ ...state, holds: next });
                  }}
                />
              </Field>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setState({ ...state, holds: [...holds, {}] })}
        className="h-9 px-3 text-[10px] uppercase tracking-widest border border-border text-foreground-muted hover:text-bone inline-flex items-center gap-1.5"
      >
        <Plus className="h-3 w-3" /> Add set
      </button>
    </div>
  );
}

function GenericForm({ state, setState }: any) {
  return (
    <div className="space-y-5">
      <Field label="Summary">
        <input
          type="text"
          value={state.note ?? ""}
          onChange={(e) => setState({ ...state, note: e.target.value })}
          placeholder="Describe what you did"
          className="flex-1 bg-transparent outline-none text-bone text-base py-1.5 placeholder:text-foreground-muted/50"
        />
      </Field>
      <RxScaledRpe state={state} setState={setState} rx={false} />
    </div>
  );
}

/* ---------------------------------------------------------------- *
 * Footer (note) common to all kinds
 * ---------------------------------------------------------------- */

function NoteField({
  state,
  setState,
}: {
  state: BlockResultDraft;
  setState: (s: BlockResultDraft) => void;
}) {
  return (
    <div>
      <p className="eyebrow mb-2">Note</p>
      <textarea
        rows={2}
        value={state.note ?? ""}
        onChange={(e) => setState({ ...state, note: e.target.value })}
        placeholder="Optional"
        className="w-full bg-transparent border-b border-border focus:border-bone outline-none py-2 text-bone placeholder:text-foreground-muted/60 text-sm resize-none"
      />
    </div>
  );
}

/* ---------------------------------------------------------------- *
 * Drawer
 * ---------------------------------------------------------------- */

export interface LogDrawerProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  session: Session;
  block: SessionBlock;
  onSaved?: (r: BlockResult) => void;
}

export function LogDrawer({
  open,
  onOpenChange,
  session,
  block,
  onSaved,
}: LogDrawerProps) {
  const isMobile = useIsMobile();
  const side = isMobile ? "bottom" : "right";
  const kind = inferLogKind(block);
  const sessionDateISO = session.date ?? new Date().toISOString().slice(0, 10);
  const last = store.getLastResultForExercise(block.title, {
    sessionId: session.id,
    blockId: block.id,
    dateISO: sessionDateISO,
  });

  const [state, setState] = useState<BlockResultDraft>(() => {
    const draft = store.getDraft(session.id, block.id);
    return draft ?? makeInitial(kind, block, last);
  });

  // Reset when block changes
  useEffect(() => {
    const draft = store.getDraft(session.id, block.id);
    setState(draft ?? makeInitial(kind, block, last));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.id, session.id]);

  // Persist draft as user types
  useEffect(() => {
    if (!open) return;
    store.saveDraft(session.id, block.id, state);
  }, [state, open, session.id, block.id]);

  const save = () => {
    const now = new Date();
    // Spread state first so explicit fields below take precedence.
    const result: BlockResult = {
      ...state,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      programmeId: PROGRAMME.id,
      weekNumber: session.weekNumber,
      sessionId: session.id,
      blockId: block.id,
      exercise: block.title,
      dateISO: sessionDateISO,
      createdAt: now.toISOString(),
      kind,
      prescribed: block.lines[0],
    };
    store.appendResult(result);
    onSaved?.(result);
    onOpenChange(false);
  };

  const sheetClass = isMobile
    ? "border-t border-border bg-background text-bone p-0 rounded-none max-h-[88vh] flex flex-col"
    : "border-l border-border bg-background text-bone p-0 sm:max-w-md flex flex-col";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className={sheetClass}>
        <header className="px-6 py-5 border-b border-border shrink-0">
          <p className="eyebrow text-foreground-muted">{kindLabel[kind]}</p>
          <SheetTitle className="font-display text-bone text-xl mt-1 leading-tight">
            {block.title}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Log performance data for this workout block without leaving the active workout.
          </SheetDescription>
          {last && (
            <p className="text-[11px] text-foreground-muted mt-3">
              <span className="uppercase tracking-widest">Last</span>{" "}
              <span className="text-bone tabular">{summariseResult(last)}</span>{" "}
              <span>· {last.dateISO}</span>
            </p>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {kind === "strength" || kind === "olympic" ? (
            <StrengthForm state={state} setState={setState} block={block} />
          ) : kind === "amrap" ? (
            <AmrapForm state={state} setState={setState} />
          ) : kind === "emom" ? (
            <EmomForm state={state} setState={setState} />
          ) : kind === "rft" ? (
            <RftForm state={state} setState={setState} />
          ) : kind === "timecap" ? (
            <TimeCapForm state={state} setState={setState} />
          ) : kind === "intervals" ? (
            <IntervalsForm state={state} setState={setState} />
          ) : kind === "zone2" ? (
            <Zone2Form state={state} setState={setState} />
          ) : kind === "carry" ? (
            <CarryForm state={state} setState={setState} />
          ) : kind === "hold" ? (
            <HoldForm state={state} setState={setState} />
          ) : (
            <GenericForm state={state} setState={setState} />
          )}

          <NoteField state={state} setState={setState} />
        </div>

        <footer
          className="px-6 py-4 border-t border-border flex gap-3 shrink-0"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
        >
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-11 px-4 border border-border text-[11px] uppercase tracking-widest text-foreground-muted hover:text-bone inline-flex items-center gap-1.5"
          >
            <X className="h-3.5 w-3.5" /> Close
          </button>
          <button
            type="button"
            onClick={save}
            className="flex-1 h-11 bg-signal text-bone text-[11px] uppercase tracking-widest font-display inline-flex items-center justify-center gap-2"
          >
            <Check className="h-3.5 w-3.5" /> Save result
          </button>
        </footer>
      </SheetContent>
    </Sheet>
  );
}