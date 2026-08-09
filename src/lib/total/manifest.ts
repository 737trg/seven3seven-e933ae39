import raw from "@/data/total.manifest.json";

export type TotalBlock = {
  name: string;
  kind?: string | null;
  instruction?: string | null;
  standard?: string | null;
  lift?: string | null;
  priority?: string | null;
  rest?: string | null;
  timer?: string | null;
  log?: string[] | null;
  id?: string;
};

export type TotalSession = {
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
  readiness_adjustment?: string;
  blocks: TotalBlock[];
  id?: string;
};

export type TotalWeek = {
  week: number;
  phase: string;
  title: string;
  objective?: string;
  intensity?: string;
  checkpoint?: string;
  sessions: TotalSession[];
};

export type TotalFoundation = {
  id: string;
  title: string;
  summary: string;
  points?: string[];
  sections?: { title: string; points: string[] }[];
  coach_rule?: string;
};

export type TotalLearnModule = {
  id: string;
  title: string;
  summary: string;
  points: string[];
  coach_rule?: string;
};

export type TotalManifest = {
  id: string;
  slug: string;
  public_title: string;
  title: string;
  subtitle: string;
  tagline: string;
  duration_weeks: number;
  description: string;
  intended_athlete: string;
  foundation: TotalFoundation[];
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
  equipment: Record<string, unknown>;
  reference_max_policy: Record<string, unknown>;
  rpe_scale: { rpe: number; rir: string; meaning: string; programme_use: string }[];
  competition_standards: Record<string, unknown>;
  variation_library: { need: string; default: string; alternatives: string[]; rule: string }[];
  attempt_planner: Record<string, unknown>;
  not_for: string[];
  progress: Record<string, unknown>;
  calculators: { id: string; name: string; formula: string; guardrail: string }[];
  learn: TotalLearnModule[];
  sources: { title: string; url: string }[];
  safety: string;
  weeks: TotalWeek[];
};

export const TOTAL: TotalManifest = raw as unknown as TotalManifest;

export function sessionId(week: number, session: number): string {
  return `total-w${week}-s${session}`;
}

export function blockId(week: number, session: number, index: number): string {
  return `${sessionId(week, session)}-b${index + 1}`;
}

export function allSessions(): { week: TotalWeek; session: TotalSession; id: string }[] {
  return TOTAL.weeks.flatMap((w) =>
    w.sessions.map((s) => ({ week: w, session: s, id: sessionId(w.week, s.session) })),
  );
}

export function findSession(id: string): { week: TotalWeek; session: TotalSession } | undefined {
  return allSessions().find((x) => x.id === id);
}

export function isCore(s: TotalSession): boolean {
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
    weeks: TOTAL.weeks.length,
    core: coreSessions().length,
    optional: optionalSessions().length,
    total: allSessions().length,
    blocks: allSessions().reduce((n, x) => n + (x.session.blocks?.length ?? 0), 0),
  };
}