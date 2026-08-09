import raw from "@/data/sem2027.manifest.json";
import type { SemManifest, SemSession, SemWeek } from "@/lib/sem/manifest";

export type { SemBlock, SemSession, SemWeek, SemManifest } from "@/lib/sem/manifest";

export const SEM27: SemManifest = raw as unknown as SemManifest;

export function sessionId(week: number, session: number): string {
  return `sem27-w${week}-s${session}`;
}

export function blockId(week: number, session: number, index: number): string {
  return `${sessionId(week, session)}-b${index + 1}`;
}

export function allSessions(): { week: SemWeek; session: SemSession; id: string }[] {
  return SEM27.weeks.flatMap((w) =>
    w.sessions.map((s) => ({ week: w, session: s, id: sessionId(w.week, s.session) })),
  );
}

export function findSession(id: string): { week: SemWeek; session: SemSession } | undefined {
  return allSessions().find((x) => x.id === id);
}

export function isCore(s: SemSession): boolean {
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
    weeks: SEM27.weeks.length,
    core: coreSessions().length,
    optional: optionalSessions().length,
    total: allSessions().length,
    blocks: allSessions().reduce((n, x) => n + (x.session.blocks?.length ?? 0), 0),
  };
}
