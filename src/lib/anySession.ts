import { getSessionById as getAthxSession, PROGRAMME as ATHX_PROGRAMME } from "@/data/programme";
import type { Session, SessionBlock, TimerSpec, BlockKind, DayName } from "@/types/programme";
import {
  BTB,
  sessionId as btbSessionId,
  blockId as btbBlockId,
} from "@/lib/btb/manifest";
import {
  HRP,
  sessionId as hrpSessionId,
  blockId as hrpBlockId,
} from "@/lib/hrp/manifest";
import {
  SEM,
  sessionId as semSessionId,
  blockId as semBlockId,
} from "@/lib/sem/manifest";

export type ProgrammeContext = {
  /** Product slug (matches DB `products.slug`). */
  slug: string;
  /** Programme identifier used for local store scoping + result tagging. */
  programmeId: string;
  /** URL of the session-overview page (Exit target). */
  backHref: string;
  /** URL of the programme index (Done page fallback). */
  programmeHref: string;
  /** Whether this programme is ATHX (skips DB mirror to preserve existing behaviour). */
  isAthx: boolean;
};

export type ResolvedSession = {
  session: Session;
  programme: ProgrammeContext;
};

// ---- Timer parser --------------------------------------------------------

function parseTimer(raw: string | null | undefined): TimerSpec | undefined {
  if (!raw) return undefined;
  const s = String(raw).toLowerCase().trim();
  if (!s || s === "none") return undefined;
  const num = (m: RegExpMatchArray | null) => (m ? Number(m[1]) : 0);
  if (s.startsWith("rest")) return { type: "rest", restSec: num(s.match(/rest_(\d+)/)) || 60 };
  if (s.startsWith("countdown")) return { type: "countdown", durationSec: num(s.match(/countdown_(\d+)/)) };
  if (s.startsWith("amrap")) return { type: "amrap", durationSec: num(s.match(/amrap_(\d+)/)) };
  if (s.startsWith("for_time")) return { type: "rft", capSec: num(s.match(/for_time_(\d+)/)) };
  if (s.startsWith("emom")) {
    const sec = num(s.match(/emom_(\d+)/));
    return { type: "emom", minutes: sec ? Math.max(1, Math.round(sec / 60)) : 10 };
  }
  if (s.startsWith("interval")) {
    const sec = num(s.match(/interval_(\d+)/));
    return { type: "intervals", workSec: sec || undefined };
  }
  if (s === "rounds") return { type: "intervals" };
  if (s === "stopwatch") return { type: "stopwatch" };
  return undefined;
}

// ---- Block kind inference -----------------------------------------------

function inferBlockKind(name: string): BlockKind {
  const t = name.toLowerCase();
  if (/(warm|mobility prep|activation)/.test(t)) return "warmup";
  if (/(cool|stretch|down-?regulate|breath)/.test(t)) return "cooldown";
  if (/(log|reflection|debrief|record)/.test(t)) return "log";
  if (/(squat|deadlift|press|bench|clean|snatch|jerk|row|pull-?up|dip)/.test(t)) return "mainLift";
  if (/(accessory|assistance|carry|hold|core)/.test(t)) return "assistance";
  return "conditioning";
}

// ---- Line builder --------------------------------------------------------

function buildLines(
  instruction: string | null | undefined,
  extras: {
    rpe?: string | null;
    rest?: string | null;
    scaling?: string | null;
    categorySpecific?: string | null;
    log?: string[] | null;
  } = {},
): string[] {
  const lines: string[] = [];
  if (instruction) {
    const clean = String(instruction).replace(/<\/?[a-z][^>]*>/gi, "").trim();
    for (const l of clean.split(/\r?\n/)) {
      const v = l.trim();
      if (v) lines.push(v);
    }
  }
  if (extras.categorySpecific) lines.push(extras.categorySpecific);
  return lines;
}

// ---- Day mapping ---------------------------------------------------------

function toDay(raw: string | undefined, fallbackIdx: number): DayName {
  const days: DayName[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  if (raw) {
    const match = days.find((d) => d.toLowerCase() === raw.toLowerCase().trim());
    if (match) return match;
  }
  return days[Math.max(0, Math.min(6, fallbackIdx - 1))];
}

// ---- Programme adapters --------------------------------------------------

const ATHX_CTX: ProgrammeContext = {
  slug: "athx-2026",
  programmeId: ATHX_PROGRAMME.id,
  backHref: "",
  programmeHref: "/my-programmes/athx-2026/programme",
  isAthx: true,
};

function resolveAthx(id: string): ResolvedSession | undefined {
  const s = getAthxSession(id);
  if (!s) return undefined;
  return {
    session: s,
    programme: {
      ...ATHX_CTX,
      backHref: `/programme/s/${id}`,
    },
  };
}

function resolveBtb(id: string): ResolvedSession | undefined {
  for (const w of BTB.weeks) {
    for (const s of w.sessions) {
      if (btbSessionId(w.week, s.session) !== id) continue;
      const blocks: SessionBlock[] = s.blocks.map((b, i) => ({
        id: btbBlockId(w.week, s.session, i),
        order: i + 1,
        kind: inferBlockKind(b.name),
        title: b.name,
        timer: parseTimer(b.timer),
        lines: buildLines(b.instruction, { rpe: b.rpe, rest: b.rest, scaling: b.scaling, log: b.log }),
        note: [b.rpe ? `RPE ${b.rpe}` : "", b.rest ? `Rest ${b.rest}` : "", b.scaling ? `Scaling: ${b.scaling}` : ""].filter(Boolean).join(" · ") || undefined,
      }));
      const session: Session = {
        id,
        weekNumber: w.week,
        day: toDay(undefined, s.session),
        title: s.title,
        category: "mixed",
        duration: s.duration,
        purpose: s.purpose,
        expectedEffort: s.coach_note ?? "",
        blocks,
        coachNote: s.coach_note,
      };
      return {
        session,
        programme: {
          slug: "basic-training-blueprint-plus",
          programmeId: "basic-training-blueprint-plus",
          backHref: `/my-programmes/basic-training-blueprint-plus/programme/s/${id}`,
          programmeHref: "/my-programmes/basic-training-blueprint-plus/programme",
          isAthx: false,
        },
      };
    }
  }
  return undefined;
}

function resolveHrp(id: string): ResolvedSession | undefined {
  for (const w of HRP.weeks) {
    for (const s of w.sessions) {
      if (hrpSessionId(w.week, s.session) !== id) continue;
      const blocks: SessionBlock[] = s.blocks.map((b, i) => {
        const cs = b.category_specific
          ? Object.entries(b.category_specific)
              .map(([k, v]) => `${k.replace(/_/g, " ")}: ${typeof v === "string" ? v : JSON.stringify(v)}`)
              .join(" · ")
          : null;
        return {
          id: hrpBlockId(w.week, s.session, i),
          order: i + 1,
          kind: inferBlockKind(b.name),
          title: b.name,
          timer: parseTimer(b.timer),
          lines: buildLines(b.instruction, { categorySpecific: cs }),
          note: [b.rpe ? `RPE ${b.rpe}` : "", b.rest ? `Rest ${b.rest}` : "", b.scaling ? `Scaling: ${b.scaling}` : ""].filter(Boolean).join(" · ") || undefined,
        };
      });
      const session: Session = {
        id,
        weekNumber: w.week,
        day: toDay(s.recommended_day, s.session),
        title: s.title,
        category: "mixed",
        duration: s.duration,
        purpose: s.purpose,
        expectedEffort: s.coach_note ?? "",
        blocks,
        coachNote: s.coach_note,
      };
      return {
        session,
        programme: {
          slug: "hybrid-race-plan",
          programmeId: "hybrid-race-plan",
          backHref: `/my-programmes/hybrid-race-plan/programme/s/${id}`,
          programmeHref: "/my-programmes/hybrid-race-plan/programme",
          isAthx: false,
        },
      };
    }
  }
  return undefined;
}

function resolveSem(id: string): ResolvedSession | undefined {
  for (const w of SEM.weeks) {
    for (const s of w.sessions) {
      if (semSessionId(w.week, s.session) !== id) continue;
      const blocks: SessionBlock[] = s.blocks.map((b, i) => {
        const cs = b.category_specific
          ? Object.entries(b.category_specific)
              .map(([k, v]) => `${k.replace(/_/g, " ")}: ${typeof v === "string" ? v : JSON.stringify(v)}`)
              .join(" · ")
          : null;
        return {
          id: semBlockId(w.week, s.session, i),
          order: i + 1,
          kind: inferBlockKind(b.name),
          title: b.name,
          timer: parseTimer(b.timer),
          lines: buildLines(b.instruction, { categorySpecific: cs }),
          note: [b.rpe ? `RPE ${b.rpe}` : "", b.rest ? `Rest ${b.rest}` : "", b.scaling ? `Scaling: ${b.scaling}` : ""].filter(Boolean).join(" · ") || undefined,
        };
      });
      const session: Session = {
        id,
        weekNumber: w.week,
        day: toDay(s.recommended_day, s.session),
        title: s.title,
        category: "mixed",
        duration: s.duration,
        purpose: s.purpose,
        expectedEffort: s.coach_note ?? "",
        blocks,
        coachNote: s.coach_note,
      };
      return {
        session,
        programme: {
          slug: "sem-2026",
          programmeId: "sem-2026",
          backHref: `/my-programmes/sem-2026/programme/s/${id}`,
          programmeHref: "/my-programmes/sem-2026/programme",
          isAthx: false,
        },
      };
    }
  }
  return undefined;
}

export function resolveSession(id: string): ResolvedSession | undefined {
  if (id.startsWith("btb-")) return resolveBtb(id);
  if (id.startsWith("hrp-")) return resolveHrp(id);
  if (id.startsWith("sem8-") || id.startsWith("sem-")) return resolveSem(id);
  return resolveAthx(id);
}