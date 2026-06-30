import type {
  Athlete,
  PartnerSplit,
  RaceStrategy,
  Readiness,
  SessionLog,
} from "@/types/programme";
import { PROGRAMME } from "@/data/programme";

const KEY = "trg737.v1";
const STORAGE_VERSION = 1;

interface Store {
  version: number;
  athlete: Athlete;
  logs: Record<string, SessionLog>;
  readiness: Record<string, Readiness>;
  raceStrategy: RaceStrategy;
  partnerSplit: PartnerSplit;
  settings: { sound: boolean; vibration: boolean };
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
});

const isBrowser = () => typeof window !== "undefined";

let cache: Store | null = null;

const read = (): Store => {
  if (cache) return cache;
  if (!isBrowser()) {
    cache = defaultStore();
    return cache;
  }
  try {
    const raw = window.localStorage.getItem(KEY);
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
  window.localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent("trg737:change"));
};

export const store = {
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