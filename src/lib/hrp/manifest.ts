
export type HrpBlock = {
  name: string;
  instruction?: string;
  timer?: string | null;
  log?: string[] | null;
  category_specific?: Record<string, any> | null;
  rest?: string | null;
  rpe?: string | null;
  scaling?: string | null;
  /** New in HRP_INTERACTIVE_V2_1 — semantic kind used by the runner + log drawer. */
  kind?:
    | "strength"
    | "sled"
    | "station"
    | "run_interval"
    | "aerobic"
    | "hybrid_brick"
    | "emom"
    | "amrap_density"
    | "mobility_recovery"
    | "log";
  /** When a Main-set / Secondary-work paragraph contains multiple exercises,
   *  the parser splits them into discrete items so each renders as its own
   *  card in the runner. */
  items?: string[];
};

export type HrpSession = {
  session: number;
  recommended_day: string;
  title: string;
  duration: string;
  purpose: string;
  pillar: string;
  priority: "core" | "optional" | string;
  blocks: HrpBlock[];
  coach_note?: string;
  log_fields?: string[];
  readiness_adjustment?: {
    ready?: string;
    average?: string;
    heavy?: string;
  };
  equipment?: string[];
};

export type HrpWeek = {
  week: number;
  phase: string;
  title: string;
  load?: string;
  checkpoint?: string;
  sessions: HrpSession[];
};

export type HrpManifest = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  product_line: string;
  version: string;
  duration_weeks: number;
  core_sessions_per_week: number;
  optional_sessions_per_week: number;
  core_session_total: number;
  optional_session_total: number;
  level: string;
  purpose: string;
  tagline: string;
  format_options: string[];
  category_options: string[];
  sex_options: string[];
  independent_disclaimer: string;
  profile_fields: string[];
  weeks: HrpWeek[];
  learn?: any;
  calculator?: any;
  race_tools?: any;
  competition_profiles?: Record<string, any>;
  progress_metrics?: any;
};

/**
 * Paid content holder. Starts empty — the real manifest is fetched from an
 * entitlement-checked server function and merged in via `hydrateHRP`,
 * so paid workouts are never shipped in the client bundle.
 */
export const HRP: HrpManifest = { weeks: [] } as unknown as HrpManifest;

export function hydrateHRP(data: unknown): void {
  Object.assign(HRP as object, data as object);
}

export type SessionId = string;

export function sessionId(week: number, session: number): SessionId {
  return `hrp-w${week}-s${session}`;
}

export function blockId(week: number, session: number, index: number): string {
  return `${sessionId(week, session)}-b${index + 1}`;
}

export function allSessions(): { week: HrpWeek; session: HrpSession; id: string }[] {
  return HRP.weeks.flatMap((w) =>
    w.sessions.map((s) => ({ week: w, session: s, id: sessionId(w.week, s.session) })),
  );
}

export function findSession(id: string): { week: HrpWeek; session: HrpSession } | undefined {
  return allSessions().find((x) => x.id === id);
}

export function coreSessions(): { week: HrpWeek; session: HrpSession; id: string }[] {
  return allSessions().filter((x) => String(x.session.priority).toLowerCase() === "core");
}

export function optionalSessions(): { week: HrpWeek; session: HrpSession; id: string }[] {
  return allSessions().filter((x) => String(x.session.priority).toLowerCase() === "optional");
}

export function isCore(s: HrpSession): boolean {
  return String(s.priority).toLowerCase() === "core";
}

/** Counts as a defensive validation snapshot. */
export function validationCounts() {
  return {
    weeks: HRP.weeks.length,
    core: coreSessions().length,
    optional: optionalSessions().length,
    total: allSessions().length,
    blocks: allSessions().reduce((n, x) => n + (x.session.blocks?.length ?? 0), 0),
  };
}