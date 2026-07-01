import type {
  Athlete,
  BlockResult,
  BlockResultDraft,
  ActiveWorkoutState,
  PartnerSplit,
  RaceStrategy,
  Readiness,
  SessionLog,
} from "@/types/programme";
import { PROGRAMME } from "@/data/programme";

const LEGACY_KEY = "trg737.v1";
const PROGRAMME_ID = "athx-2026";
const STORAGE_VERSION = 2;

interface Store {
  version: number;
  athlete: Athlete;
  logs: Record<string, SessionLog>;
  readiness: Record<string, Readiness>;
  raceStrategy: RaceStrategy;
  partnerSplit: PartnerSplit;
  settings: { sound: boolean; vibration: boolean };
  results: BlockResult[];
  drafts: Record<string, BlockResultDraft>; // key = `${sessionId}:${blockId}`
  workouts: Record<string, ActiveWorkoutState>;
}

const defaultStore = (): Store => ({
  version: STORAGE_VERSION,
  athlete: PROGRAMME.athlete,
  logs: {},
  readiness: {},
  raceStrategy: {
    press: { one: 70, two: 77.5, three: 80 },
    squat3rm: { one: 132.5, two: 147.5, three: 155 },
    deadlift5rm: { one: 157.5, two: 170, three: 177.5 },
  },
  partnerSplit: {},
  settings: { sound: true, vibration: true },
  results: [],
  drafts: {},
  workouts: {},
});

const isBrowser = () => typeof window !== "undefined";

let cache: Store | null = null;
let activeUserId: string | null = null;
let athxEntitled = false;

const scopedKey = () => {
  if (!activeUserId || !athxEntitled) return null;
  return `${LEGACY_KEY}:${activeUserId}:${PROGRAMME_ID}`;
};

const migrationKey = (userId: string) => `${LEGACY_KEY}:${userId}:${PROGRAMME_ID}:legacy-migrated`;
const backupKey = (userId: string) => `${LEGACY_KEY}:${userId}:${PROGRAMME_ID}:legacy-backup`;

const canReadAthxLocalState = () => isBrowser() && !!scopedKey();

const migrateLegacyIfNeeded = () => {
  if (!isBrowser() || !activeUserId || !athxEntitled) return;
  const key = scopedKey();
  if (!key) return;
  if (window.localStorage.getItem(migrationKey(activeUserId)) === "true") return;

  const legacy = window.localStorage.getItem(LEGACY_KEY);
  if (!legacy) {
    window.localStorage.setItem(migrationKey(activeUserId), "true");
    return;
  }

  if (!window.localStorage.getItem(backupKey(activeUserId))) {
    window.localStorage.setItem(backupKey(activeUserId), legacy);
  }
  if (!window.localStorage.getItem(key)) {
    window.localStorage.setItem(key, legacy);
  }
  window.localStorage.setItem(migrationKey(activeUserId), "true");
};

const read = (): Store => {
  if (!isBrowser()) return defaultStore();
  if (!canReadAthxLocalState()) return defaultStore();
  migrateLegacyIfNeeded();
  if (cache) return cache;
  try {
    const key = scopedKey();
    if (!key) {
      cache = defaultStore();
      return cache;
    }
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      cache = defaultStore();
      return cache;
    }
    const parsed = JSON.parse(raw) as Store;
    if (parsed.version !== STORAGE_VERSION) {
      cache = defaultStore();
      return cache;
    }
    cache = { ...defaultStore(), ...parsed };
    return cache;
  } catch {
    cache = defaultStore();
    return cache;
  }
};

const write = (s: Store) => {
  cache = s;
  if (!isBrowser()) return;
  const key = scopedKey();
  if (!key) return;
  window.localStorage.setItem(key, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent("trg737:change"));
};

export const store = {
  configureAthxAccess: ({ userId, entitled }: { userId: string | null; entitled: boolean }) => {
    const changed = activeUserId !== userId || athxEntitled !== entitled;
    activeUserId = userId;
    athxEntitled = entitled;
    if (changed) cache = null;
    if (entitled) migrateLegacyIfNeeded();
    if (isBrowser()) window.dispatchEvent(new CustomEvent("trg737:change"));
  },
  isAthxLocalStateEnabled: () => !!scopedKey(),
  getAthlete: () => read().athlete,
  updateAthlete: (patch: Partial<Athlete>) => {
    const s = read();
    s.athlete = {
      ...s.athlete,
      ...patch,
      pbs: { ...s.athlete.pbs, ...(patch.pbs ?? {}) },
    };
    write(s);
  },
  getLogs: () => read().logs,
  getLog: (sessionId: string) => read().logs[sessionId],
  saveLog: (log: SessionLog) => {
    const s = read();
    s.logs[log.sessionId] = log;
    write(s);
  },
  setReadiness: (dateISO: string, level: Readiness) => {
    const s = read();
    s.readiness[dateISO] = level;
    write(s);
  },
  getReadiness: (dateISO: string) => read().readiness[dateISO],
  getRaceStrategy: () => read().raceStrategy,
  saveRaceStrategy: (rs: RaceStrategy) => {
    const s = read();
    s.raceStrategy = rs;
    write(s);
  },
  getPartnerSplit: () => read().partnerSplit,
  savePartnerSplit: (ps: PartnerSplit) => {
    const s = read();
    s.partnerSplit = ps;
    write(s);
  },
  getSettings: () => read().settings,
  saveSettings: (set: Partial<Store["settings"]>) => {
    const s = read();
    s.settings = { ...s.settings, ...set };
    write(s);
  },
  reset: () => write(defaultStore()),

  // --- Block results (append-only history) ---
  getResults: () => read().results,
  getResultsForBlock: (sessionId: string, blockId: string) =>
    read().results.filter((r) => r.sessionId === sessionId && r.blockId === blockId),
  getLastResultForBlock: (sessionId: string, blockId: string) => {
    const list = read().results.filter(
      (r) => r.sessionId === sessionId && r.blockId === blockId,
    );
    return list[list.length - 1];
  },
  /** Latest result for this blockId across any session (e.g. recurring lifts) */
  getLastResultByBlockId: (blockId: string) => {
    const list = read().results.filter((r) => r.blockId === blockId);
    return list[list.length - 1];
  },
  getResultsForExercise: (exercise: string) =>
    read().results.filter((r) => r.exercise.toLowerCase() === exercise.toLowerCase()),
  getLastResultForExercise: (
    exercise: string,
    exclude?: { sessionId?: string; blockId?: string; dateISO?: string },
  ) => {
    const list = read().results.filter((r) => {
      const sameExercise = r.exercise.toLowerCase() === exercise.toLowerCase();
      const excluded =
        exclude &&
        r.sessionId === exclude.sessionId &&
        r.blockId === exclude.blockId &&
        (!exclude.dateISO || r.dateISO === exclude.dateISO);
      return sameExercise && !excluded;
    });
    return list[list.length - 1];
  },
  appendResult: (result: BlockResult) => {
    const s = read();
    s.results = [...s.results, result];
    // Clear matching draft
    const dkey = `${result.sessionId}:${result.blockId}`;
    const { [dkey]: _omit, ...rest } = s.drafts;
    s.drafts = rest;
    write(s);
  },
  getDraft: (sessionId: string, blockId: string) =>
    read().drafts[`${sessionId}:${blockId}`],
  saveDraft: (sessionId: string, blockId: string, draft: BlockResultDraft) => {
    const s = read();
    s.drafts = {
      ...s.drafts,
      [`${sessionId}:${blockId}`]: { ...draft, updatedAt: new Date().toISOString() },
    };
    write(s);
  },
  clearDraft: (sessionId: string, blockId: string) => {
    const s = read();
    const k = `${sessionId}:${blockId}`;
    if (!s.drafts[k]) return;
    const { [k]: _o, ...rest } = s.drafts;
    s.drafts = rest;
    write(s);
  },

  // --- Active workout state (resume after refresh) ---
  getWorkoutState: (sessionId: string) => read().workouts[sessionId],
  saveWorkoutState: (state: ActiveWorkoutState) => {
    const s = read();
    s.workouts = { ...s.workouts, [state.sessionId]: state };
    write(s);
  },
  clearWorkoutState: (sessionId: string) => {
    const s = read();
    if (!s.workouts[sessionId]) return;
    const { [sessionId]: _omit, ...rest } = s.workouts;
    s.workouts = rest;
    write(s);
  },
};

export const subscribeStore = (cb: () => void) => {
  if (!isBrowser()) return () => {};
  const handler = () => {
    cache = null;
    cb();
  };
  window.addEventListener("trg737:change", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("trg737:change", handler);
    window.removeEventListener("storage", handler);
  };
};