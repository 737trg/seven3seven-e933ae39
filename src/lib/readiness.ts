/**
 * Readiness → session adaptation.
 *
 * Pure maths only: takes what the athlete reported this morning and returns
 * a load factor plus a one-line explanation the runner can show. No I/O so
 * it is safe to import anywhere.
 */

export interface ReadinessInput {
  /** Hours slept last night. */
  sleepHours?: number | null;
  /** 1 = fresh, 5 = wrecked. */
  soreness?: number | null;
  /** 1 = calm, 5 = fried. */
  stress?: number | null;
  /** 1 = flat, 5 = buzzing. */
  energy?: number | null;
}

export type ReadinessBand = "primed" | "steady" | "guarded" | "depleted";

export interface ReadinessAdaptation {
  score: number;
  band: ReadinessBand;
  label: string;
  /** Multiplier applied to suggested working loads. */
  loadFactor: number;
  advice: string;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

function sleepScore(hours: number): number {
  if (hours < 4) return 10;
  if (hours < 5) return 25;
  if (hours < 6) return 45;
  if (hours < 7) return 65;
  if (hours < 8) return 85;
  return 95;
}

/** 1–5 where a LOW number is good (soreness, stress). */
const invertedScore = (v: number) => clamp((5 - v) / 4, 0, 1) * 100;
/** 1–5 where a HIGH number is good (energy). */
const directScore = (v: number) => clamp((v - 1) / 4, 0, 1) * 100;

/** Weighted 0–100 readiness score, or null when nothing has been reported. */
export function scoreReadiness(input: ReadinessInput): number | null {
  const parts: { weight: number; value: number }[] = [];
  if (typeof input.sleepHours === "number") parts.push({ weight: 0.3, value: sleepScore(input.sleepHours) });
  if (typeof input.soreness === "number") parts.push({ weight: 0.25, value: invertedScore(input.soreness) });
  if (typeof input.stress === "number") parts.push({ weight: 0.2, value: invertedScore(input.stress) });
  if (typeof input.energy === "number") parts.push({ weight: 0.25, value: directScore(input.energy) });
  if (parts.length === 0) return null;
  const totalWeight = parts.reduce((a, p) => a + p.weight, 0);
  return Math.round(parts.reduce((a, p) => a + p.weight * p.value, 0) / totalWeight);
}

/** Turn a readiness score into a training instruction for today. */
export function adaptFromReadiness(input: ReadinessInput): ReadinessAdaptation | null {
  const score = scoreReadiness(input);
  if (score === null) return null;
  if (score >= 78) {
    return {
      score,
      band: "primed",
      label: "Primed",
      loadFactor: 1.03,
      advice: "Good to push. Take the top set heavy and hold the prescribed rest.",
    };
  }
  if (score >= 55) {
    return {
      score,
      band: "steady",
      label: "Steady",
      loadFactor: 1,
      advice: "Train as written. Nothing to change today.",
    };
  }
  if (score >= 35) {
    return {
      score,
      band: "guarded",
      label: "Guarded",
      loadFactor: 0.925,
      advice: "Drop working loads around 7.5% and add 30s to rest. Keep the quality, lose the strain.",
    };
  }
  return {
    score,
    band: "depleted",
    label: "Depleted",
    loadFactor: 0.85,
    advice: "Cut the top set, work about 15% lighter and finish early if it feels wrong. Recovery is training.",
  };
}

/** Round a load to the nearest usable plate jump. */
export function roundLoad(kg: number): number {
  return Math.round(kg / 2.5) * 2.5;
}