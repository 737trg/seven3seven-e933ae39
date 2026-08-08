import { HRP, coreSessions as hrpCore } from "@/lib/hrp/manifest";
import { BTB, coreSessions as btbCore } from "@/lib/btb/manifest";
import { SEM, coreSessions as semCore } from "@/lib/sem/manifest";
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

type Entry = { id: string; title: string; week: number };

function entriesFor(slug: string): Entry[] {
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
    if (slug === "athx-2026") {
      return ATHX.weeks.flatMap((w) =>
        w.sessions.map((s) => ({ id: s.id, title: s.title, week: w.week })),
      );
    }
  } catch {
    /* manifest shape drift should never break the dashboard */
  }
  return [];
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
