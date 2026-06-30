import raw from "@/data/sem8.manifest.json";

export type SemBlock = {
  name: string;
  instruction?: string;
  timer?: string | null;
  log?: string[] | null;
  category_specific?: Record<string, any> | null;
  rest?: string | null;
  rpe?: string | null;
  scaling?: string | null;
};

export type SemSession = {
  session: number;
  recommended_day: string;
  title: string;
  duration: string;
  purpose: string;
  pillar: string;
  priority: "core" | "optional" | string;
  blocks: SemBlock[];
  coach_note?: string;
  log_fields?: string[];
  readiness_adjustment?: {
    ready?: string;
    average?: string;
    heavy?: string;
  };
  equipment?: string[];
};

export type SemWeek = {
  week: number;
  phase: string;
  title: string;
  load?: string;
  checkpoint?: string;
  sessions: SemSession[];
};

export type SemManifest = {
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
  weeks: SemWeek[];
  learn?: any;
  calculator?: any;
  race_tools?: any;
  competition_profiles?: Record<string, any>;
  progress_metrics?: any;
};

export const SEM: SemManifest = raw as unknown as SemManifest;

export type SessionId = string;

export function sessionId(week: number, session: number): SessionId {
  return `sem8-w${week}-s${session}`;
}

export function blockId(week: number, session: number, index: number): string {
  return `${sessionId(week, session)}-b${index + 1}`;
}

export function allSessions(): { week: SemWeek; session: SemSession; id: string }[] {
  return SEM.weeks.flatMap((w) =>
    w.sessions.map((s) => ({ week: w, session: s, id: sessionId(w.week, s.session) })),
  );
}

export function findSession(id: string): { week: SemWeek; session: SemSession } | undefined {
  return allSessions().find((x) => x.id === id);
}

export function coreSessions(): { week: SemWeek; session: SemSession; id: string }[] {
  return allSessions().filter((x) => String(x.session.priority).toLowerCase() === "core");
}

export function optionalSessions(): { week: SemWeek; session: SemSession; id: string }[] {
  return allSessions().filter((x) => String(x.session.priority).toLowerCase() === "optional");
}

export function isCore(s: SemSession): boolean {
  return String(s.priority).toLowerCase() === "core";
}

/** Counts as a defensive validation snapshot. */
export function validationCounts() {
  return {
    weeks: SEM.weeks.length,
    core: coreSessions().length,
    optional: optionalSessions().length,
    total: allSessions().length,
    blocks: allSessions().reduce((n, x) => n + (x.session.blocks?.length ?? 0), 0),
  };
}