import raw from "@/data/btb.manifest.json";

export type BtbBlock = {
  name: string;
  instruction?: string;
  timer?: string | null;
  log?: string[] | null;
  rest?: string | null;
  rpe?: string | null;
  scaling?: string | null;
};

export type BtbSession = {
  session: number;
  title: string;
  duration: string;
  purpose: string;
  priority: "core" | "optional" | string;
  blocks: BtbBlock[];
  coach_note?: string;
  readiness_adjustment?: { ready?: string; average?: string; heavy?: string };
};

export type BtbWeek = {
  week: number;
  phase: string;
  title: string;
  load?: string;
  checkpoint?: string;
  sessions: BtbSession[];
};

export type BtbManifest = {
  id: string;
  slug: string;
  title: string;
  short_title: string;
  subtitle: string;
  product_line: string;
  version: string;
  duration_weeks: number;
  sessions_per_week: number;
  core_session_total: number;
  level: string;
  purpose: string;
  tagline: string;
  independent_disclaimer: string;
  profile_fields: string[];
  weeks: BtbWeek[];
  session_order_notes?: string[];
  learn?: any;
  assessment?: any;
  calculator?: any;
};

export const BTB: BtbManifest = raw as unknown as BtbManifest;

export type BtbSessionId = string;

export function sessionId(week: number, session: number): BtbSessionId {
  return `btb-w${week}-s${session}`;
}
export function blockId(week: number, session: number, index: number): string {
  return `${sessionId(week, session)}-b${index + 1}`;
}

export function allSessions() {
  return BTB.weeks.flatMap((w) =>
    w.sessions.map((s) => ({ week: w, session: s, id: sessionId(w.week, s.session) })),
  );
}

export function findSession(id: string) {
  return allSessions().find((x) => x.id === id);
}

export function isCore(s: BtbSession): boolean {
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
    weeks: BTB.weeks.length,
    core: coreSessions().length,
    optional: optionalSessions().length,
    total: allSessions().length,
    blocks: allSessions().reduce((n, x) => n + (x.session.blocks?.length ?? 0), 0),
  };
}