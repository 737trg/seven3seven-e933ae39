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
import {
  SEM27,
  sessionId as sem27SessionId,
  blockId as sem27BlockId,
} from "@/lib/sem2027/manifest";
import {
  MIXED,
  sessionId as mixedSessionId,
  blockId as mixedBlockId,
} from "@/lib/mixed/manifest";
import {
  TOTAL,
  sessionId as totalSessionId,
  blockId as totalBlockId,
} from "@/lib/total/manifest";

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
  if (/(warm[- ]?up|mobility prep|activation|primer|prepare|^prep$)/.test(n)) return "warmup";
  if (/(cool[- ]?down|stretch|down-?regulate|breath)/.test(n)) return "cooldown";
  if (/(^|\b)(log|reflection|debrief|record|finish)\b/.test(n)) return "log";
  const liftWords = /(squat|deadlift|press|bench|clean|snatch|jerk|pull[- ]?up|chin[- ]?up|dip|curl|row(?!\s*erg)|hinge|lunge|split squat|calf raise|tibialis|kettlebell|barbell|dumbbell|isometric|iso pull|mid[- ]?thigh|hip thrust|glute bridge|good morning|farmer|carry|hold|plank|hang)/;
  const setsReps = /\b\d+\s*[x×]\s*\d+/;
  if (/(accessor|assistance|support|carry|hold|core|durability)/.test(n)) return "assistance";
  if (/(main strength|strength|main lift|primary lift|top set|back[- ]?off|hypertroph)/.test(n)) return "mainLift";
  if (liftWords.test(t) || setsReps.test(t)) return "mainLift";
  return "conditioning";
}

/**
 * Map the semantic `kind` supplied by the newer programme manifests onto the
 * runner's block kinds. Anything unknown falls back to text inference so a new
 * vocabulary entry can never produce an undefined kind.
 */
const MANIFEST_KIND_MAP: Record<string, BlockKind> = {
  warmup: "warmup",
  prep: "warmup",
  cooldown: "cooldown",
  recovery: "cooldown",
  mobility_recovery: "warmup",
  log: "log",
  strength: "mainLift",
  power: "mainLift",
  hypertrophy: "mainLift",
  station_strength: "mainLift",
  assistance: "assistance",
  sled: "assistance",
  skill: "assistance",
  station: "conditioning",
  conditioning: "conditioning",
  metcon: "conditioning",
  race: "conditioning",
  event_h: "conditioning",
  event_g: "conditioning",
  run: "conditioning",
  run_interval: "conditioning",
  ski: "conditioning",
  aerobic: "conditioning",
  endurance: "conditioning",
  hybrid_brick: "conditioning",
  emom: "conditioning",
  amrap_density: "conditioning",
  test: "conditioning",
  training: "conditioning",
  guidance: "log",
  education: "log",
  alternative: "log",
};

function resolveKind(kind: string | undefined | null, name: string, instruction?: string | null): BlockKind {
  if (kind) {
    const mapped = MANIFEST_KIND_MAP[String(kind).toLowerCase()];
    if (mapped === "cooldown" && /mobility|warm/.test(name.toLowerCase())) return "warmup";
    if (mapped) {
      // "training" is a catch-all in some manifests — infer from the text instead.
      if (mapped === "conditioning" && (kind === "training" || kind === "test")) {
        return inferBlockKind(name, instruction);
      }
      return mapped;
    }
  }
  return inferBlockKind(name, instruction);
}

function legacyInferBlockKind(name: string, instruction?: string | null): BlockKind {
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
        kind: resolveKind((b as { kind?: string }).kind, b.name, b.instruction),
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
        // When the parser split a multi-exercise paragraph into discrete items,
        // render each item as its own bullet in the runner instead of one
        // wall of text. Falls back to the original instruction otherwise.
        const lines = b.items && b.items.length > 0
          ? b.items.slice()
          : buildLines(b.instruction, { categorySpecific: cs });
        // Map manifest kind → BlockKind for the runner + log form router.
        const kindMap: Record<string, BlockKind> = {
          strength: "mainLift",
          sled: "assistance",
          station: "conditioning",
          run_interval: "conditioning",
          aerobic: "conditioning",
          hybrid_brick: "conditioning",
          emom: "conditioning",
          amrap_density: "conditioning",
          mobility_recovery: b.name.toLowerCase().includes("cool") ? "cooldown" : "warmup",
          log: "log",
        };
        const inferred = resolveKind(b.kind, b.name, b.instruction);
        return {
          id: hrpBlockId(w.week, s.session, i),
          order: i + 1,
          kind: inferred,
          title: b.name,
          timer: refineTimer(parseTimer(b.timer), b.name, b.instruction),
          lines,
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
          kind: resolveKind((b as { kind?: string }).kind, b.name, b.instruction),
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
  return resolveById(id);
}

/** Product slug that owns a session id — used to load its gated content. */
export function programmeSlugForSessionId(id: string): string {
  if (id.startsWith("btb-")) return "basic-training-blueprint-plus";
  if (id.startsWith("hrp-")) return "hybrid-race-plan";
  if (id.startsWith("mixed-")) return "mixed";
  if (id.startsWith("total-")) return "build-total";
  if (id.startsWith("sem27-")) return "sem-2027";
  if (id.startsWith("sem8-") || id.startsWith("sem-")) return "sem-2026";
  return "athx-2026";
}

function resolveSem27(id: string): ResolvedSession | undefined {
  for (const w of SEM27.weeks) {
    for (const s of w.sessions) {
      if (sem27SessionId(w.week, s.session) !== id) continue;
      const blocks: SessionBlock[] = s.blocks.map((b, i) => ({
        id: sem27BlockId(w.week, s.session, i),
        order: i + 1,
        kind: resolveKind((b as { kind?: string }).kind, b.name, b.instruction),
        title: b.name,
        timer: refineTimer(parseTimer(b.timer), b.name, b.instruction),
        lines: buildLines(b.instruction),
        note: [b.rpe ? `RPE ${b.rpe}` : "", b.rest ? `Rest ${b.rest}` : "", b.scaling ? `Scaling: ${b.scaling}` : ""].filter(Boolean).join(" · ") || undefined,
      }));
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
          slug: "sem-2027",
          programmeId: "sem-2027",
          backHref: `/my-programmes/sem-2027/programme/s/${id}`,
          programmeHref: "/my-programmes/sem-2027/programme",
          isAthx: false,
        },
      };
    }
  }
  return undefined;
}

function resolveById(id: string): ResolvedSession | undefined {
  if (id.startsWith("btb-")) return resolveBtb(id);
  if (id.startsWith("hrp-")) return resolveHrp(id);
  if (id.startsWith("mixed-")) return resolveMixed(id);
  if (id.startsWith("total-")) return resolveTotal(id);
  if (id.startsWith("sem27-")) return resolveSem27(id);
  if (id.startsWith("sem8-") || id.startsWith("sem-")) return resolveSem(id);
  return resolveAthx(id);
}

/**
 * MIXED uses plain-English timers ("AMRAP 12", "For time - cap 15",
 * "6 x 2 minutes work / 1 minute rest") rather than the token format the
 * other manifests use, so it gets its own parser.
 */
function parseMixedTimer(raw: string | null | undefined): TimerSpec | undefined {
  if (!raw) return undefined;
  const s = String(raw).toLowerCase().trim();
  if (!s || s === "none") return undefined;
  const amrap = s.match(/amrap\s*(\d+)/);
  if (amrap) return { type: "amrap", durationSec: Number(amrap[1]) * 60 };
  const emom = s.match(/emom\s*(\d+)/);
  if (emom) return { type: "emom", minutes: Number(emom[1]) };
  const cap = s.match(/cap\s*(\d+)/);
  if (cap) return { type: "rft", capSec: Number(cap[1]) * 60 };
  const everyX = s.match(/every\s*(\d+)\s*minutes?\s*x\s*(\d+)/);
  if (everyX) return { type: "emom", minutes: Number(everyX[1]) * Number(everyX[2]) };
  const intervals = s.match(/(\d+)\s*x\s*([\d:.]+)\s*(minutes?|seconds?|min|sec)?\s*(?:work)?/);
  if (intervals && /work|rest|\//.test(s)) {
    const value = intervals[2];
    const unit = intervals[3] ?? "minutes";
    let workSec: number;
    if (value.includes(":")) {
      const [m, sec] = value.split(":");
      workSec = Number(m) * 60 + Number(sec);
    } else {
      workSec = /sec/.test(unit) ? Number(value) : Number(value) * 60;
    }
    return { type: "intervals", workSec: Number.isFinite(workSec) ? workSec : undefined };
  }
  const quality = s.match(/(\d+)\s*minutes?/);
  if (quality) return { type: "countdown", durationSec: Number(quality[1]) * 60 };
  return { type: "stopwatch" };
}

function resolveMixed(id: string): ResolvedSession | undefined {
  for (const w of MIXED.weeks) {
    for (const s of w.sessions) {
      if (mixedSessionId(w.week, s.session) !== id) continue;
      const blocks: SessionBlock[] = s.blocks.map((b, i) => {
        const lines = buildLines(b.instruction);
        if (b.rx) lines.push(`RX — ${b.rx}`);
        if (b.scaled) lines.push(`Scaled — ${b.scaled}`);
        if (b.stimulus) lines.push(`Stimulus — ${b.stimulus}`);
        return {
          id: mixedBlockId(w.week, s.session, i),
          order: i + 1,
          kind: resolveKind(b.kind, b.name, b.instruction),
          title: b.name,
          timer: parseMixedTimer(b.timer),
          lines,
          note: b.standard ?? undefined,
        };
      });
      const session: Session = {
        id,
        weekNumber: w.week,
        day: toDay(s.recommended_day, s.session),
        title: s.title,
        category: "mixed",
        duration: s.duration ?? `${s.duration_minutes} min`,
        purpose: s.purpose,
        expectedEffort: s.intensity ?? "",
        blocks,
        coachNote: s.coach_note,
      };
      return {
        session,
        programme: {
          slug: "mixed",
          programmeId: "mixed",
          backHref: `/my-programmes/mixed/programme/s/${id}`,
          programmeHref: "/my-programmes/mixed/programme",
          isAthx: false,
        },
      };
    }
  }
  return undefined;
}
/**
 * BUILD TOTAL — powerlifting. Blocks are lift / accessory prescriptions with
 * rest guidance; there is no RX/Scaled split and no metcon timers.
 */
function resolveTotal(id: string): ResolvedSession | undefined {
  for (const w of TOTAL.weeks) {
    for (const s of w.sessions) {
      if (totalSessionId(w.week, s.session) !== id) continue;
      const blocks: SessionBlock[] = s.blocks.map((b, i) => {
        const lines = buildLines(b.instruction);
        if (b.rest) lines.push(`Rest — ${b.rest}`);
        return {
          id: totalBlockId(w.week, s.session, i),
          order: i + 1,
          kind: resolveKind(b.kind, b.name, b.instruction),
          title: b.name,
          timer: parseTimer(b.timer),
          lines,
          note: b.standard ?? undefined,
        };
      });
      const session: Session = {
        id,
        weekNumber: w.week,
        day: toDay(s.recommended_day, s.session),
        title: s.title,
        category: "strength",
        duration: s.duration ?? `${s.duration_minutes} min`,
        purpose: s.purpose,
        expectedEffort: s.intensity ?? "",
        blocks,
        coachNote: s.coach_note,
      };
      return {
        session,
        programme: {
          slug: "build-total",
          programmeId: "build-total",
          backHref: `/my-programmes/build-total/programme/s/${id}`,
          programmeHref: "/my-programmes/build-total/programme",
          isAthx: false,
        },
      };
    }
  }
  return undefined;
}
