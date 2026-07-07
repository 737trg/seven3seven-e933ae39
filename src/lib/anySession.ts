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
  if (s.startsWith("countdown")) {
    const d = num(s.match(/countdown_(\d+)/));
    return d > 0 ? { type: "countdown", durationSec: d } : undefined;
  }
  if (s.startsWith("amrap")) {
    const d = num(s.match(/amrap_(\d+)/));
    return d > 0 ? { type: "amrap", durationSec: d } : undefined;
  }
  if (s.startsWith("for_time")) {
    const d = num(s.match(/for_time_(\d+)/));
    return d > 0 ? { type: "rft", capSec: d } : undefined;
  }
  if (s.startsWith("emom")) {
    const sec = num(s.match(/emom_(\d+)/));
    if (sec <= 0) return undefined;
    return { type: "emom", minutes: Math.max(1, Math.round(sec / 60)) };
  }
  if (s.startsWith("interval")) {
    const sec = num(s.match(/interval_(\d+)/));
    return { type: "intervals", workSec: sec || undefined };
  }
  if (s === "rounds") return { type: "intervals" };
  if (s === "stopwatch") return { type: "stopwatch" };
  return undefined;
}

/**
 * Extract minutes/seconds from a block name/instruction. Handles patterns like
 * "24-min EMOM", "8 min AMRAP", "5-minute intervals", "30-second work".
 */
function extractMinutesFromText(text: string): { minutes?: number; seconds?: number } {
  const t = text.toLowerCase();
  const mMin = t.match(/(\d+)\s*[- ]?\s*(?:min(?:ute)?s?)\b/);
  const mSec = t.match(/(\d+)\s*[- ]?\s*(?:sec(?:ond)?s?)\b/);
  return {
    minutes: mMin ? Number(mMin[1]) : undefined,
    seconds: mSec ? Number(mSec[1]) : undefined,
  };
}

/**
 * Refine a parsed TimerSpec using hints from the block title + instruction
 * (e.g. "24-min EMOM" → 24, "8-min AMRAP" → 480s cap).
 */
function refineTimer(spec: TimerSpec | undefined, title: string, instruction?: string | null): TimerSpec | undefined {
  if (!spec) return spec;
  const hint = extractMinutesFromText(`${title} ${instruction ?? ""}`);
  if (spec.type === "emom") {
    if (hint.minutes) return { ...spec, minutes: hint.minutes };
    return spec;
  }
  if (spec.type === "amrap") {
    if (hint.minutes && !spec.durationSec) return { ...spec, durationSec: hint.minutes * 60 };
    return spec;
  }
  if (spec.type === "rft") {
    if (hint.minutes && !spec.capSec) return { ...spec, capSec: hint.minutes * 60 };
    return spec;
  }
  if (spec.type === "countdown") {
    if (hint.minutes && !spec.durationSec) return { ...spec, durationSec: hint.minutes * 60 };
    return spec;
  }
  if (spec.type === "intervals") {
    if (hint.seconds && !spec.workSec) return { ...spec, workSec: hint.seconds };
    return spec;
  }
  return spec;
}

// ---- Block kind inference -----------------------------------------------

function inferBlockKind(name: string, instruction?: string | null): BlockKind {
  const n = name.toLowerCase();
  const t = `${n} ${(instruction ?? "").toLowerCase()}`;
  if (/(warm[- ]?up|mobility prep|activation|primer)/.test(n)) return "warmup";
  if (/(cool[- ]?down|stretch|down-?regulate|breath)/.test(n)) return "cooldown";
  if (/(^|\b)(log|reflection|debrief|record|finish)\b/.test(n)) return "log";
  // Detect resistance/strength work either from the block title or the
  // instruction text (e.g. "Support" → split squat + calf raise + tibialis).
  const liftWords = /(squat|deadlift|press|bench|clean|snatch|jerk|pull[- ]?up|chin[- ]?up|dip|curl|row(?!\s*erg)|hinge|lunge|split squat|calf raise|tibialis|kettlebell|barbell|dumbbell|isometric|iso pull|mid[- ]?thigh|hip thrust|glute bridge|good morning|farmer|carry|hold|plank|hang)/;
  const setsReps = /\b\d+\s*[x×]\s*\d+/;
  if (/(accessor|assistance|support|carry|hold|core)/.test(n)) return "assistance";
  if (/(main strength|strength|main lift|primary lift|top set|back[- ]?off)/.test(n)) return "mainLift";
  if (liftWords.test(t) || setsReps.test(t)) return "mainLift";
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
        kind: inferBlockKind(b.name, b.instruction),
        title: b.name,
        timer: refineTimer(parseTimer(b.timer), b.name, b.instruction),
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
          kind: inferBlockKind(b.name, b.instruction),
          title: b.name,
          timer: refineTimer(parseTimer(b.timer), b.name, b.instruction),
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
          kind: inferBlockKind(b.name, b.instruction),
          title: b.name,
          timer: refineTimer(parseTimer(b.timer), b.name, b.instruction),
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