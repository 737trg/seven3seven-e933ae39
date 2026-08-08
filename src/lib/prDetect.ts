/**
 * Personal-best detection from a logged strength result.
 * Pure maths — the caller decides whether to save.
 */
import type { BlockResult, StrengthSetEntry } from "@/types/programme";

/** Epley estimated one-rep max. */
export function estimatedOneRm(weightKg: number, reps: number): number {
  if (reps <= 1) return weightKg;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

/** Heaviest completed set in a result. */
export function bestSetOf(result: Pick<BlockResult, "sets">): StrengthSetEntry | null {
  const sets = (result.sets ?? []).filter(
    (s) => !s.missed && typeof s.weightKg === "number" && s.weightKg > 0 && (s.reps ?? 0) > 0,
  );
  if (sets.length === 0) return null;
  return sets.reduce((best, s) =>
    estimatedOneRm(s.weightKg!, s.reps!) > estimatedOneRm(best.weightKg!, best.reps!) ? s : best,
  );
}

export interface PrCandidate {
  liftLabel: string;
  weightKg: number;
  reps: number;
  estimatedOneRm: number;
  /** Previous best load on record, when there was one. */
  previousKg: number | null;
}

/**
 * Returns a candidate when the heaviest set beats the athlete's stored best
 * for the same lift (by estimated 1RM, so 5×100kg can beat 1×105kg).
 */
export function prCandidateFrom(
  result: Pick<BlockResult, "sets" | "exercise">,
  previous: { value: number; reps: number | null } | null,
): PrCandidate | null {
  const best = bestSetOf(result);
  if (!best) return null;
  const e1rm = estimatedOneRm(best.weightKg!, best.reps!);
  if (previous) {
    const prevE1rm = estimatedOneRm(previous.value, previous.reps ?? 1);
    if (e1rm <= prevE1rm) return null;
  }
  return {
    liftLabel: result.exercise,
    weightKg: best.weightKg!,
    reps: best.reps!,
    estimatedOneRm: e1rm,
    previousKg: previous?.value ?? null,
  };
}