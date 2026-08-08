/**
 * Standards library: reference targets athletes can measure themselves against.
 * Values are widely published training reference points, not official entry
 * criteria — SEVEN3SEVEN is not affiliated with the British Army, ATHX, HYROX
 * or Hybrid Games. Always check the current official standard.
 */
import { slugifyLift, type PersonalRecord } from "@/lib/usePersonalRecords";

export type StandardDirection = "higher" | "lower";

export interface Standard {
  key: string;
  /** Matches a personal record whose lift_key equals one of these. */
  match: string[];
  label: string;
  metric: "load" | "time" | "distance" | "reps";
  unit: string;
  direction: StandardDirection;
  /** Reference target to beat (or get under, when direction is "lower"). */
  target: number;
  note?: string;
}

export interface StandardGroup {
  key: string;
  title: string;
  blurb: string;
  standards: Standard[];
}

export const STANDARD_GROUPS: StandardGroup[] = [
  {
    key: "military-entry",
    title: "Military entry reference",
    blurb: "Common assessment benchmarks used to prepare for selection-style testing.",
    standards: [
      { key: "mile-half", match: ["1-5-mile-run", "1-5-mile", "mile-and-a-half-run"], label: "1.5 mile run", metric: "time", unit: "min", direction: "lower", target: 10.5 },
      { key: "midthigh-pull", match: ["mid-thigh-pull", "mid-thigh-pull-mtp"], label: "Mid-thigh pull", metric: "load", unit: "kg", direction: "higher", target: 76 },
      { key: "seated-throw", match: ["medicine-ball-throw", "seated-medicine-ball-throw"], label: "Seated med ball throw", metric: "distance", unit: "m", direction: "higher", target: 3.1 },
      { key: "pressups", match: ["press-ups", "push-ups", "max-press-ups"], label: "Press-ups (2 min)", metric: "reps", unit: "reps", direction: "higher", target: 40 },
      { key: "situps", match: ["sit-ups", "max-sit-ups"], label: "Sit-ups (2 min)", metric: "reps", unit: "reps", direction: "higher", target: 45 },
    ],
  },
  {
    key: "hybrid-race",
    title: "Hybrid race splits",
    blurb: "Split targets for a competitive age-group finish across hybrid racing formats.",
    standards: [
      { key: "run-1k", match: ["1k-run", "1km-run"], label: "1 km run", metric: "time", unit: "min", direction: "lower", target: 4.3 },
      { key: "run-5k", match: ["5k-run", "5km-run", "5k"], label: "5 km run", metric: "time", unit: "min", direction: "lower", target: 23 },
      { key: "row-1k", match: ["1000m-row", "1k-row", "row-1000m"], label: "1000 m row", metric: "time", unit: "min", direction: "lower", target: 3.75 },
      { key: "ski-1k", match: ["1000m-ski", "1k-ski", "ski-1000m"], label: "1000 m ski erg", metric: "time", unit: "min", direction: "lower", target: 4 },
      { key: "wall-balls", match: ["wall-balls", "wall-ball"], label: "100 wall balls", metric: "time", unit: "min", direction: "lower", target: 5.5 },
      { key: "farmers", match: ["farmers-carry", "farmers-carry-200m"], label: "Farmer's carry 200 m", metric: "time", unit: "min", direction: "lower", target: 2 },
    ],
  },
  {
    key: "strength-base",
    title: "Strength base",
    blurb: "Balanced strength markers for durable, injury-resistant training.",
    standards: [
      { key: "back-squat", match: ["back-squat", "squat"], label: "Back squat", metric: "load", unit: "kg", direction: "higher", target: 100 },
      { key: "deadlift", match: ["deadlift", "conventional-deadlift"], label: "Deadlift", metric: "load", unit: "kg", direction: "higher", target: 140 },
      { key: "bench-press", match: ["bench-press", "bench"], label: "Bench press", metric: "load", unit: "kg", direction: "higher", target: 80 },
      { key: "strict-pull-ups", match: ["pull-ups", "strict-pull-ups", "pull-up"], label: "Strict pull-ups", metric: "reps", unit: "reps", direction: "higher", target: 12 },
    ],
  },
];

export interface StandardProgress {
  standard: Standard;
  best: PersonalRecord | null;
  /** 0-1 progress toward the reference target. */
  pct: number;
  met: boolean;
}

function normaliseTime(value: number, unit: string): number {
  return unit === "sec" ? value / 60 : value;
}

/** Best record for a standard, plus how close the athlete is to the target. */
export function standardProgress(standard: Standard, records: PersonalRecord[]): StandardProgress {
  const keys = new Set([...standard.match, slugifyLift(standard.label)]);
  const candidates = records.filter((r) => keys.has(r.lift_key) && r.metric === standard.metric);

  let best: PersonalRecord | null = null;
  for (const r of candidates) {
    if (!best) { best = r; continue; }
    const a = standard.metric === "time" ? normaliseTime(r.value, r.unit) : r.value;
    const b = standard.metric === "time" ? normaliseTime(best.value, best.unit) : best.value;
    if (standard.direction === "lower" ? a < b : a > b) best = r;
  }

  if (!best) return { standard, best: null, pct: 0, met: false };

  const value = standard.metric === "time" ? normaliseTime(best.value, best.unit) : best.value;
  const met = standard.direction === "lower" ? value <= standard.target : value >= standard.target;
  const pct = standard.direction === "lower"
    ? Math.min(1, standard.target / Math.max(value, 0.0001))
    : Math.min(1, value / standard.target);

  return { standard, best, pct: Math.max(0, pct), met };
}

export function formatStandardValue(value: number, unit: string): string {
  const rounded = Math.round(value * 100) / 100;
  return unit === "reps" ? `${rounded}` : `${rounded} ${unit}`;
}
