import type { SessionBlock, LogKind } from "@/types/programme";

export function inferLogKind(block: SessionBlock): LogKind {
  const t = block.timer?.type;
  const title = block.title.toLowerCase();
  const lines = (block.lines ?? []).join(" ").toLowerCase();
  const text = `${title} ${lines}`;
  if (t === "amrap") return "amrap";
  if (t === "emom") return "emom";
  if (t === "rft") return "rft";
  if (t === "intervals") return "intervals";
  // HRP: run intervals, thresholds, race-distance repeats → intervals form
  if (/\b(threshold|intervals?|repeats|race[- ]pace|race[- ]distance|strides?)\b/.test(text)) {
    return "intervals";
  }
  // HRP: hybrid bricks (run + station rounds)
  if (/\bbrick\b|\brounds?.*(station|machine)\b/.test(text)) {
    return "intervals";
  }
  // HRP: sled push/pull work → intervals (distance + split logging)
  if (/\bsled\b/.test(text)) return "intervals";
  // HRP: aerobic Zone 2 / easy running / recovery cardio
  if (/(zone\s*2|z2|easy run|aerobic|easy machine)/.test(text)) return "zone2";
  // HRP: carry / farmers / suitcase
  if (/(farmer|carry|suitcase)/.test(text)) return "carry";
  // HRP: holds
  if (/(hold|plank|hang|iso)/.test(text)) return "hold";
  if (block.kind === "mainLift" || block.kind === "assistance") {
    if (/(clean|jerk|snatch)/.test(title)) return "olympic";
    if (/\bsled\b/.test(text)) return "intervals";
    return "strength";
  }
  if (block.kind === "conditioning") {
    if (t === "countdown") return "timecap";
    return "generic";
  }
  return "generic";
}

export const kindLabel: Record<LogKind, string> = {
  strength: "Strength",
  olympic: "Olympic lift",
  amrap: "AMRAP",
  emom: "EMOM",
  rft: "Rounds for time",
  timecap: "Time-capped",
  intervals: "Intervals",
  zone2: "Zone 2",
  carry: "Carry",
  hold: "Static hold",
  generic: "Result",
};

/** Compact one-line summary of a result, for "Last time" / "Logged" lines. */
export function summariseResult(r: {
  kind: LogKind;
  sets?: { weightKg?: number; reps?: number; rpe?: number; group?: string; missed?: boolean }[];
  rounds?: number;
  extraReps?: number;
  weightKg?: number;
  timeSec?: number;
  capped?: boolean;
  minutesCompleted?: number;
  failedMinutes?: number;
  durationSec?: number;
  distanceM?: number;
  rpe?: number;
}): string {
  const fmtTime = (s?: number) => {
    if (s == null) return "—";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };
  const rpe = (n?: number) => (n != null ? ` · RPE ${n}` : "");
  switch (r.kind) {
    case "strength":
    case "olympic": {
      const top = r.sets?.find((s) => s.group === "top") ?? r.sets?.[0];
      if (!top) return "Logged";
      return `${top.weightKg ?? "—"} kg × ${top.reps ?? "—"}${rpe(top.rpe)}`;
    }
    case "amrap":
      return `${r.rounds ?? 0} + ${r.extraReps ?? 0}${r.weightKg ? ` @ ${r.weightKg}kg` : ""}${rpe(r.rpe)}`;
    case "emom":
      return `${r.minutesCompleted ?? 0} min · ${r.failedMinutes ?? 0} miss${rpe(r.rpe)}`;
    case "rft":
    case "timecap":
      return `${fmtTime(r.timeSec)}${r.capped ? " · capped" : ""}${rpe(r.rpe)}`;
    case "zone2":
      return `${fmtTime(r.durationSec)} · ${(r.distanceM ?? 0) / 1000} km${rpe(r.rpe)}`;
    case "carry":
      return `${r.weightKg ?? "—"} kg · ${r.distanceM ?? "—"} m`;
    case "hold":
      return `${fmtTime(r.durationSec)}`;
    default:
      return "Logged";
  }
}