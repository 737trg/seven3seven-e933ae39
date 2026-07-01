/**
 * Local-only profile + readiness for the S.E.M. 2026 programme.
 * Scoped under `sem8.*` so it can never collide with ATHX local storage.
 *
 * Authoritative results live in the database (session_completions, workout_results).
 * This store only holds athlete preferences and readiness selections.
 */
import { useSyncExternalStore } from "react";

export type SemUnits = "kg" | "lb";
export type SemFormat = "Individual" | "Pairs";
export type SemCategory = "ATHX" | "ATHX Pro" | "";
export type SemSex = "Male" | "Female" | "";
export type SemMode = "five" | "six";
export type SemReadiness = "ready" | "average" | "heavy";

export type SemProfile = {
  displayName: string;
  units: SemUnits;
  startDate: string | null;         // ISO YYYY-MM-DD
  competitionDate: string | null;   // ISO YYYY-MM-DD
  format: SemFormat;
  category: SemCategory;
  sex: SemSex;
  mode: SemMode;
  strictPress: number | null;
  backSquat: number | null;
  deadlift: number | null;
  fiveK: string | null;             // mm:ss
  tenK: string | null;              // mm:ss
  row500: string | null;            // mm:ss
  workingDb: number | null;
  soundCues: boolean;
  vibration: boolean;
  setupComplete: boolean;
};

const DEFAULT: SemProfile = {
  displayName: "",
  units: "kg",
  startDate: null,
  competitionDate: null,
  format: "Individual",
  category: "",
  sex: "",
  mode: "five",
  strictPress: null,
  backSquat: null,
  deadlift: null,
  fiveK: null,
  tenK: null,
  row500: null,
  workingDb: null,
  soundCues: true,
  vibration: true,
  setupComplete: false,
};

const PROGRAMME_ID = "sem-2026";
const LEGACY_PREFIX = "sem8";
let activeUserId: string | null = null;

const key = (name: string) => {
  if (!activeUserId) return null;
  return `${LEGACY_PREFIX}.${name}.v1:${activeUserId}:${PROGRAMME_ID}`;
};

const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }
export function subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); }

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch { return fallback; }
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, JSON.stringify(value)); emit(); } catch {}
}

// Cached snapshots so React's getSnapshot is stable.
let _profile: SemProfile | null = null;
let _readiness: Record<string, SemReadiness> | null = null;
let _started: { started: boolean; at: string | null } | null = null;

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key?.includes(`${activeUserId}:${PROGRAMME_ID}`)) {
      _profile = null;
      _readiness = null;
      _started = null;
    }
    emit();
  });
}

export const semStore = {
  configureUser(userId: string | null) {
    if (activeUserId === userId) return;
    activeUserId = userId;
    _profile = null;
    _readiness = null;
    _started = null;
    emit();
  },
  getProfile(): SemProfile {
    if (_profile) return _profile;
    const storageKey = key("profile");
    _profile = { ...DEFAULT, ...(storageKey ? read<Partial<SemProfile>>(storageKey, {}) : {}) };
    return _profile;
  },
  saveProfile(p: Partial<SemProfile>) {
    const next = { ...semStore.getProfile(), ...p };
    _profile = next;
    const storageKey = key("profile");
    if (storageKey) write(storageKey, next);
  },
  markStarted() {
    const v = { started: true, at: new Date().toISOString() };
    _started = v;
    const storageKey = key("started");
    if (storageKey) write(storageKey, v);
  },
  getStarted(): { started: boolean; at: string | null } {
    if (_started) return _started;
    const storageKey = key("started");
    _started = storageKey ? read(storageKey, { started: false, at: null }) : { started: false, at: null };
    return _started;
  },
  getReadiness(): Record<string, SemReadiness> {
    if (_readiness) return _readiness;
    const storageKey = key("readiness");
    _readiness = storageKey ? read(storageKey, {}) : {};
    return _readiness;
  },
  setReadiness(sessionId: string, value: SemReadiness) {
    const next = { ...semStore.getReadiness(), [sessionId]: value };
    _readiness = next;
    const storageKey = key("readiness");
    if (storageKey) write(storageKey, next);
  },
};

export function useSemProfile(): SemProfile {
  return useSyncExternalStore(subscribe, semStore.getProfile, semStore.getProfile);
}
export function useSemStarted() {
  return useSyncExternalStore(subscribe, semStore.getStarted, semStore.getStarted);
}
export function useSemReadiness() {
  return useSyncExternalStore(subscribe, semStore.getReadiness, semStore.getReadiness);
}

/** Returns 1..8 based on start date, clamped. Null if not started. */
export function currentSemWeek(startISO: string | null): number | null {
  if (!startISO) return null;
  const start = new Date(startISO + "T00:00:00");
  if (Number.isNaN(start.getTime())) return null;
  const now = new Date();
  const days = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  if (days < 0) return 1;
  const wk = Math.floor(days / 7) + 1;
  return Math.min(8, Math.max(1, wk));
}