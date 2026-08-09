
export type MixedBlock = {
  name: string;
  kind?: string | null;
  instruction?: string | null;
  rx?: string | null;
  scaled?: string | null;
  stimulus?: string | null;
  timer?: string | null;
  log?: string[] | null;
  standard?: string | null;
  id?: string;
};

export type MixedSession = {
  session: number;
  recommended_day: string;
  title: string;
  duration_minutes: number;
  duration: string;
  pillar: string;
  purpose: string;
  intensity?: string;
  priority: "core" | "optional" | string;
  coach_note?: string;
  education?: string;
  log_fields?: string[];
  readiness_adjustment?: Record<string, string>;
  blocks: MixedBlock[];
  id?: string;
};

export type MixedWeek = {
  week: number;
  phase: string;
  title: string;
  objective?: string;
  intensity?: string;
  checkpoint?: string;
  sessions: MixedSession[];
};

export type MixedFoundation = {
  id: string;
  title: string;
  summary: string;
  sections: { title: string; points: string[] }[];
  coach_rule?: string;
};

export type MixedLearnModule = {
  id: string;
  title: string;
  summary: string;
  points: string[];
  coach_rule?: string;
};

export type MixedManifest = {
  id: string;
  slug: string;
  public_title: string;
  title: string;
  subtitle: string;
  tagline: string;
  duration_weeks: number;
  description: string;
  intended_athlete: string;
  foundation: MixedFoundation[];
  entry_gate: string[];
  profile_fields: {
    id: string;
    label: string;
    type: string;
    options?: string[];
    options_from?: string;
    unit?: string;
    required?: boolean;
  }[];
  readiness_options: { id: string; label: string; action: string }[];
  weekly_structure: { day: string; focus: string; priority: string }[];
  phases: { name: string; weeks: string; purpose: string }[];
  rx_scaled_policy: Record<string, unknown>;
  equipment: Record<string, unknown>;
  training_reference: Record<string, unknown>;
  movement_scaling: { movement: string; rx: string; scaled: string; success_standard: string }[];
  progress: Record<string, unknown>;
  calculators: { id: string; name: string; formula: string; guardrail: string }[];
  learn: MixedLearnModule[];
  sources: { title: string; url: string }[];
  safety: string;
  weeks: MixedWeek[];
};

/**
 * Paid content holder. Starts empty — the real manifest is fetched from an
 * entitlement-checked server function and merged in via `hydrateMIXED`,
 * so paid workouts are never shipped in the client bundle.
 */
export const MIXED: MixedManifest = { weeks: [] } as unknown as MixedManifest;

export function hydrateMIXED(data: unknown): void {
  Object.assign(MIXED as object, data as object);
}

export function sessionId(week: number, session: number): string {
  return `mixed-w${week}-s${session}`;
}

export function blockId(week: number, session: number, index: number): string {
  return `${sessionId(week, session)}-b${index + 1}`;
}

export function allSessions(): { week: MixedWeek; session: MixedSession; id: string }[] {
  return MIXED.weeks.flatMap((w) =>
    w.sessions.map((s) => ({ week: w, session: s, id: sessionId(w.week, s.session) })),
  );
}

export function findSession(id: string): { week: MixedWeek; session: MixedSession } | undefined {
  return allSessions().find((x) => x.id === id);
}

export function isCore(s: MixedSession): boolean {
  return String(s.priority).toLowerCase() === "core";
}

export function coreSessions() {
  return allSessions().filter((x) => isCore(x.session));
}

export function optionalSessions() {
  return allSessions().filter((x) => !isCore(x.session));
}

export function validationCounts() {
  return {
    weeks: MIXED.weeks.length,
    core: coreSessions().length,
    optional: optionalSessions().length,
    total: allSessions().length,
    blocks: allSessions().reduce((n, x) => n + (x.session.blocks?.length ?? 0), 0),
  };
}