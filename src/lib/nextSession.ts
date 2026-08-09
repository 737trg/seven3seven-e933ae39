import { HRP, coreSessions as hrpCore } from "@/lib/hrp/manifest";
import { BTB, coreSessions as btbCore } from "@/lib/btb/manifest";
import { SEM, coreSessions as semCore } from "@/lib/sem/manifest";
import { SEM27, coreSessions as sem27Core } from "@/lib/sem2027/manifest";
import { PROGRAMME as ATHX } from "@/data/programme";
import type { CustomerProgramme } from "@/lib/useCustomerDashboard";

export type NextSession = {
  title: string;
  week: number | null;
  /** Deep link into the interactive session runner. */
  href: string;
  /** Total core sessions in the programme, for "x of y" copy. */
  total: number;
  done: number;
};

export type SessionEntry = { id: string; title: string; week: number };
type Entry = SessionEntry;

function entriesFor(slug: string): Entry[] {
  return programmeSessionEntries(slug);
}

/** Ordered core sessions for a programme slug, straight from its manifest. */
export function programmeSessionEntries(slug: string): SessionEntry[] {
  try {
    if (slug === "hybrid-race-plan") {
      void HRP;
      return hrpCore().map((s) => ({ id: s.id, title: s.session.title, week: s.week.week }));
    }
    if (slug === "basic-training-blueprint-plus") {
      void BTB;
      return btbCore().map((s) => ({ id: s.id, title: s.session.title, week: s.week.week }));
    }
    if (slug === "sem-2026") {
      void SEM;
      return semCore().map((s) => ({ id: s.id, title: s.session.title, week: s.week.week }));
    }
    if (slug === "sem-2027") {
      void SEM27;
      return sem27Core().map((s) => ({ id: s.id, title: s.session.title, week: s.week.week }));
    }
    if (slug === "athx-2026") {
      return ATHX.weeks.flatMap((w) =>
        w.sessions.map((s) => ({ id: s.id, title: s.title, week: w.number })),
      );
    }
  } catch {
    /* manifest shape drift should never break the dashboard */
  }
  return [];
}

/** Week + total-core-session count for a finished session, for progress writes. */
export function sessionProgressMeta(slug: string, sessionId: string): { week: number | null; total: number } {
  const entries = programmeSessionEntries(slug);
  const hit = entries.find((e) => e.id === sessionId);
  return { week: hit?.week ?? null, total: entries.length };
}

function runnerHref(programme: CustomerProgramme, id: string): string {
  if (programme.slug === "athx-2026") return `/programme/s/${id}`;
  const base = programme.base_path || `/my-programmes/${programme.slug}`;
  return `${base}/programme/s/${id}`;
}

/** The first core session the athlete has not completed yet. */
export function nextSessionFor(programme: CustomerProgramme | undefined): NextSession | null {
  if (!programme) return null;
  const entries = entriesFor(programme.slug);
  if (entries.length === 0) return null;
  const done = new Set(programme.completions.map((c) => c.session_id));
  const next = entries.find((e) => !done.has(e.id)) ?? entries[entries.length - 1];
  return {
    title: next.title,
    week: next.week,
    href: runnerHref(programme, next.id),
    total: entries.length,
    done: entries.filter((e) => done.has(e.id)).length,
  };
}
