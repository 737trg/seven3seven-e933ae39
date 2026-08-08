import type { BlockResult } from "@/types/programme";
import { roundLoad } from "@/lib/readiness";

export interface LoadSuggestion {
  kg: number;
  /** Human explanation, e.g. "last time 100kg · guarded −7.5%". */
  reason: string;
}

/**
 * Suggest today's working load from the last time this exercise was logged,
 * scaled by how ready the athlete reported feeling.
 */
export function suggestLoad(
  last: Pick<BlockResult, "sets"> | undefined,
  opts: { loadFactor?: number; readinessLabel?: string } = {},
): LoadSuggestion | null {
  const sets = (last?.sets ?? []).filter(
    (s) => !s.missed && typeof s.weightKg === "number" && s.weightKg > 0,
  );
  if (sets.length === 0) return null;
  const heaviest = Math.max(...sets.map((s) => s.weightKg!));
  const factor = opts.loadFactor ?? 1;
  const kg = roundLoad(heaviest * factor);
  if (kg <= 0) return null;
  const delta = Math.round((factor - 1) * 1000) / 10;
  const adjustment =
    delta === 0
      ? ""
      : ` · ${opts.readinessLabel ? `${opts.readinessLabel.toLowerCase()} ` : ""}${delta > 0 ? "+" : ""}${delta}%`;
  return { kg, reason: `last time ${heaviest}kg${adjustment}` };
}