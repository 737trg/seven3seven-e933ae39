export type SessionCategory =
  | "strength"
  | "endurance"
  | "mixed"
  | "olympic"
  | "zone2"
  | "recovery"
  | "rehearsal";

export type BlockKind =
  | "warmup"
  | "mainLift"
  | "assistance"
  | "conditioning"
  | "cooldown"
  | "log";

export type TimerType =
  | "none"
  | "countdown"
  | "stopwatch"
  | "emom"
  | "amrap"
  | "intervals"
  | "rft"
  | "rest";

export interface TimerSpec {
  type: TimerType;
  durationSec?: number;
  minutes?: number;
  workSec?: number;
  restSec?: number;
  rounds?: number;
  capSec?: number;
}

export interface SessionBlock {
  id: string;
  order: number;
  kind: BlockKind;
  title: string;
  timeWindow?: string; // e.g. "10-30 min"
  timer?: TimerSpec;
  /** Plain-English line items shown in the block. */
  lines: string[];
  note?: string;
}

export type DayName =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface Session {
  id: string;
  weekNumber: number;
  day: DayName;
  date?: string; // ISO yyyy-mm-dd
  title: string;
  category: SessionCategory;
  duration: string; // "60 min" or "50-60 min"
  purpose: string;
  expectedEffort: string;
  blocks: SessionBlock[];
  coachNote?: string;
  completed?: boolean;
}

export type LoadLabel =
  | "Moderate"
  | "Moderate-high"
  | "High"
  | "High but controlled"
  | "Moderate-low"
  | "Low";

export interface Week {
  number: number; // 1..7, 8 = race week
  label: string; // "Week 1" | "Race week"
  phase: string;
  load: LoadLabel;
  dateRange: string;
  objective: string;
  checkpoint: string;
  sessions: Session[];
}

export interface Athlete {
  name: string;
  category: string;
  competition: string;
  raceDate: string; // ISO
  units: "kg" | "lb";
  pbs: {
    strictPress1RM: number;
    backSquat1RM: number;
    deadlift1RM: number;
    cleanJerk: number;
    snatch: number;
    run5kSec: number;
    run10kSec: number;
  };
  workingDbKg: number;
}

export interface Programme {
  id: string;
  name: string;
  athlete: Athlete;
  weeks: Week[]; // includes race week as last
}

/* --- Logs & state --- */
export type Readiness = "ready" | "average" | "heavy";

export interface CompletedSet {
  setIndex: number;
  reps?: number;
  loadKg?: number;
  rpe?: number;
  note?: string;
}

export interface BlockLog {
  blockId: string;
  completed: boolean;
  sets?: CompletedSet[];
  rounds?: number;
  extraReps?: number;
  timeSec?: number;
  capped?: boolean;
  distanceM?: number;
  note?: string;
}

export interface SessionLog {
  sessionId: string;
  startedAt: string; // ISO
  endedAt?: string;
  durationSec?: number;
  readiness?: Readiness;
  blocks: BlockLog[];
  sessionRpe?: number;
  reflection?: string;
  completed: boolean;
}

export interface GlossaryTerm {
  term: string;
  short: string;
  example?: string;
}

export interface MovementStandard {
  movement: string;
  validRep: string;
  cue?: string;
  eventLoad?: string;
}

export interface RaceAttempt {
  one?: number;
  two?: number;
  three?: number;
}

export interface RaceStrategy {
  press: RaceAttempt;
  squat3rm: RaceAttempt;
  deadlift5rm: RaceAttempt;
}

export interface PartnerSplit {
  ski1A?: number;
  ski1B?: number;
  gtohA?: number;
  gtohB?: number;
  sandbagOrder?: string;
  boxJumpA?: number;
  boxJumpB?: number;
  lungeA?: number;
  lungeB?: number;
  burpeeA?: number;
  burpeeB?: number;
  ski2A?: number;
  ski2B?: number;
  notes?: string;
}

/* --- Block-level result history (separate from session completion) --- */

export type LogKind =
  | "strength"
  | "olympic"
  | "amrap"
  | "emom"
  | "rft"
  | "timecap"
  | "intervals"
  | "zone2"
  | "carry"
  | "hold"
  | "generic";

export type StrengthSetGroup = "warmup" | "top" | "backoff" | "assistance";

export interface StrengthSetEntry {
  group: StrengthSetGroup;
  weightKg?: number;
  reps?: number;
  rpe?: number;
  missed?: boolean;
  note?: string;
}

export interface IntervalEntry {
  timeSec?: number;
  distanceM?: number;
  paceSecPer500?: number;
}

export interface HoldEntry {
  durationSec?: number;
}

/** Append-only history record. One per block attempt. */
export interface BlockResult {
  id: string;
  programmeId: string;
  weekNumber: number;
  sessionId: string;
  blockId: string;
  exercise: string;
  dateISO: string; // yyyy-mm-dd
  createdAt: string; // full ISO
  kind: LogKind;
  prescribed?: string;
  rpe?: number;
  rxOrScaled?: "rx" | "scaled";
  note?: string;
  // Adaptive fields — only populated for the relevant kind
  sets?: StrengthSetEntry[];
  rounds?: number;
  extraReps?: number;
  extraDistanceM?: number;
  weightKg?: number;
  minutesCompleted?: number;
  failedMinutes?: number;
  lowestRestSec?: number;
  timeSec?: number;
  capped?: boolean;
  stoppedAt?: string;
  splits?: number[];
  intervals?: IntervalEntry[];
  durationSec?: number;
  distanceM?: number;
  paceSecPerKm?: number;
  avgHr?: number;
  feel?: number;
  holds?: HoldEntry[];
}

/** Draft state for a block result mid-workout. */
export type BlockResultDraft = Omit<
  BlockResult,
  "id" | "createdAt" | "dateISO" | "programmeId" | "weekNumber"
> & {
  updatedAt?: string;
};