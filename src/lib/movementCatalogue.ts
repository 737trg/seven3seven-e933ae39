/**
 * Curated movement catalogue. Every personal best maps onto one of these so
 * the Progress tab can group, compare and pace-check properly instead of
 * showing one flat list of free text.
 */
import type { PersonalRecord } from "@/lib/usePersonalRecords";

export type MovementCategory = "strength" | "cardio" | "other";
export type MovementMetric = "load" | "time" | "reps" | "distance";

export interface Movement {
  key: string;
  label: string;
  category: MovementCategory;
  /** Sub-grouping inside a category, e.g. Barbell / Bodyweight / Run / Machine. */
  group: string;
  metric: MovementMetric;
  unit: string;
  direction: "higher" | "lower";
  /** Distance in metres — enables pace maths for cardio benchmarks. */
  distanceM?: number;
  /** Extra lift_key spellings that should fold into this movement. */
  aliases?: string[];
}

const strength = (key: string, label: string, group = "Barbell", aliases: string[] = []): Movement => ({
  key, label, category: "strength", group, metric: "load", unit: "kg", direction: "higher", aliases,
});

const reps = (key: string, label: string, aliases: string[] = []): Movement => ({
  key, label, category: "strength", group: "Bodyweight", metric: "reps", unit: "reps", direction: "higher", aliases,
});

const run = (key: string, label: string, distanceM: number, aliases: string[] = []): Movement => ({
  key, label, category: "cardio", group: "Run", metric: "time", unit: "sec", direction: "lower", distanceM, aliases,
});

const machine = (key: string, label: string, group: string, distanceM: number, aliases: string[] = []): Movement => ({
  key, label, category: "cardio", group, metric: "time", unit: "sec", direction: "lower", distanceM, aliases,
});

export const MOVEMENTS: Movement[] = [
  strength("back-squat", "Back squat", "Barbell", ["squat"]),
  strength("front-squat", "Front squat"),
  strength("overhead-squat", "Overhead squat", "Barbell", ["ohs"]),
  strength("deadlift", "Deadlift", "Barbell", ["conventional-deadlift"]),
  strength("trap-bar-deadlift", "Trap-bar deadlift"),
  strength("bench-press", "Bench press", "Barbell", ["bench"]),
  strength("strict-press", "Strict press", "Barbell", ["overhead-press", "shoulder-press"]),
  strength("push-press", "Push press"),
  strength("power-clean", "Power clean", "Olympic"),
  strength("clean-and-jerk", "Clean & jerk", "Olympic"),
  strength("snatch", "Snatch", "Olympic"),
  strength("weighted-pull-up", "Weighted pull-up", "Accessory"),
  strength("hip-thrust", "Hip thrust", "Accessory"),
  reps("pull-ups", "Strict pull-ups", ["strict-pull-ups", "pull-up"]),
  reps("press-ups", "Press-ups (2 min)", ["push-ups", "max-press-ups"]),
  reps("sit-ups", "Sit-ups (2 min)", ["max-sit-ups"]),
  reps("dips", "Dips"),
  run("run-400m", "400 m", 400, ["400m", "400m-run"]),
  run("run-800m", "800 m", 800, ["800m", "800m-run"]),
  run("run-1km", "1 km", 1000, ["1k-run", "1km-run"]),
  run("run-1mile", "1 mile", 1609, ["mile", "1-mile-run"]),
  run("run-1-5mile", "1.5 mile", 2414, ["1-5-mile-run", "1-5-mile"]),
  run("run-2km", "2 km", 2000, ["2k-run", "2km-run"]),
  run("run-5km", "5 km", 5000, ["5k-run", "5k", "5km-run"]),
  run("run-10km", "10 km", 10000, ["10k-run", "10k", "10km-run"]),
  run("run-half", "Half marathon", 21097, ["half-marathon"]),
  run("run-marathon", "Marathon", 42195, ["marathon"]),
  machine("row-500m", "500 m row", "Row", 500, ["500m-row"]),
  machine("row-1km", "1 km row", "Row", 1000, ["1000m-row", "1k-row"]),
  machine("row-2km", "2 km row", "Row", 2000, ["2000m-row", "2k-row"]),
  machine("ski-500m", "500 m ski", "Ski", 500, ["500m-ski"]),
  machine("ski-1km", "1 km ski", "Ski", 1000, ["1000m-ski", "1k-ski"]),
  machine("bike-1km", "1 km bike", "Bike", 1000, ["1000m-bike"]),
  machine("bike-4km", "4 km bike", "Bike", 4000, ["4000m-bike"]),
];

const BY_KEY = new Map<string, Movement>();
for (const m of MOVEMENTS) {
  BY_KEY.set(m.key, m);
  for (const a of m.aliases ?? []) BY_KEY.set(a, m);
}

export function findMovement(liftKey: string): Movement | null {
  return BY_KEY.get(liftKey) ?? null;
}

export function categoryOf(record: PersonalRecord): MovementCategory {
  const m = findMovement(record.lift_key);
  if (m) return m.category;
  if (record.metric === "load" || record.metric === "reps") return "strength";
  if (record.metric === "time" || record.metric === "distance") return "cardio";
  return "other";
}

export function directionOf(record: PersonalRecord): "higher" | "lower" {
  return findMovement(record.lift_key)?.direction ?? (record.metric === "time" ? "lower" : "higher");
}

/** Normalise any stored value to a comparable number (times become seconds). */
export function comparableValue(record: PersonalRecord): number {
  if (record.metric !== "time") return record.value;
  return record.unit === "min" ? record.value * 60 : record.value;
}

export function formatSeconds(total: number): string {
  const s = Math.max(0, Math.round(total));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

/** Parse "21:30", "4:05.2" or plain seconds into seconds. */
export function parseTimeInput(raw: string): number | null {
  const text = raw.trim();
  if (!text) return null;
  const parts = text.split(":").map((p) => Number(p));
  if (parts.some((p) => !Number.isFinite(p) || p < 0)) return null;
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

export function formatRecordValue(record: PersonalRecord): string {
  if (record.metric === "time") return formatSeconds(comparableValue(record));
  if (record.metric === "reps") return `${record.value}`;
  return `${record.value} ${record.unit}`;
}

/** Pace per km for a cardio benchmark with a known distance. */
export function paceLabel(movement: Movement | null, seconds: number): string | null {
  if (!movement?.distanceM || seconds <= 0) return null;
  const perKm = seconds / (movement.distanceM / 1000);
  return `${formatSeconds(perKm)} /km`;
}

export function estimatedOneRm(weight: number, reps: number | null): number {
  if (!reps || reps <= 1) return Math.round(weight * 10) / 10;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

export interface MovementSummary {
  key: string;
  label: string;
  category: MovementCategory;
  group: string;
  movement: Movement | null;
  metric: string;
  unit: string;
  direction: "higher" | "lower";
  best: PersonalRecord;
  first: PersonalRecord;
  /** Chronological history for the chart. */
  history: PersonalRecord[];
  /** Signed improvement in comparable units (positive is always better). */
  improvement: number | null;
}

/** Group every record into one summary per movement, best-first. */
export function summariseRecords(records: PersonalRecord[]): MovementSummary[] {
  const byKey = new Map<string, PersonalRecord[]>();
  for (const r of records) {
    const m = findMovement(r.lift_key);
    const key = m?.key ?? r.lift_key;
    const list = byKey.get(key) ?? [];
    list.push(r);
    byKey.set(key, list);
  }

  const out: MovementSummary[] = [];
  for (const [key, list] of byKey) {
    const history = list.slice().sort((a, b) => a.achieved_on.localeCompare(b.achieved_on));
    const movement = findMovement(key);
    const direction = directionOf(history[0]);
    const best = history.reduce((acc, r) => {
      const a = comparableValue(r);
      const b = comparableValue(acc);
      return direction === "lower" ? (a < b ? r : acc) : a > b ? r : acc;
    }, history[0]);
    const first = history[0];
    const improvement =
      history.length > 1
        ? direction === "lower"
          ? comparableValue(first) - comparableValue(best)
          : comparableValue(best) - comparableValue(first)
        : null;

    out.push({
      key,
      label: movement?.label ?? best.lift_label,
      category: movement?.category ?? categoryOf(best),
      group: movement?.group ?? "Other",
      movement,
      metric: best.metric,
      unit: best.unit,
      direction,
      best,
      first,
      history,
      improvement,
    });
  }

  return out.sort((a, b) => b.history.length - a.history.length || a.label.localeCompare(b.label));
}