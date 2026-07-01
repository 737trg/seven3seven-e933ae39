/**
 * Local-only profile + readiness for Basic Training Blueprint+.
 * Scoped under `btb.*` so it can never collide with ATHX or S.E.M. local storage.
 * Authoritative results live in the database (session_completions, workout_results).
 */
import { useSyncExternalStore } from "react";

export type BtbUnits = "kg" | "lb";
export type BtbReadiness = "ready" | "average" | "heavy";
export type BtbExperience = "" | "New" | "Some" | "Experienced";
export type BtbEquipment = "" | "Gym" | "Home + kit" | "Minimal";

export type BtbProfile = {
  displayName: string;
  units: BtbUnits;
  startDate: string | null;         // ISO YYYY-MM-DD
  assessmentDate: string | null;    // ISO YYYY-MM-DD
  role: string;                     // e.g. "Infantry Soldier (Regular)"
  currentTwoKm: string | null;      // mm:ss
  medicineBallBaseline: number | null; // metres
  deadliftBaseline: number | null;  // kg or lb (see units)
  runningExperience: BtbExperience;
  availableDays: number | null;     // 3..6
  equipmentLevel: BtbEquipment;
  substitutions: string;            // freeform text
  setupComplete: boolean;
};

const DEFAULT: BtbProfile = {
  displayName: "",
  units: "kg",
  startDate: null,
  assessmentDate: null,
  role: "",
  currentTwoKm: null,
  medicineBallBaseline: null,
  deadliftBaseline: null,
  runningExperience: "",
  availableDays: null,
  equipmentLevel: "",
  substitutions: "",
  setupComplete: false,
};

const PROGRAMME_ID = "basic-training-blueprint-plus";
const LEGACY_PREFIX = "btb";
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

let _profile: BtbProfile | null = null;
let _readiness: Record<string, BtbReadiness> | null = null;
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

export const btbStore = {
  configureUser(userId: string | null) {
    if (activeUserId === userId) return;
    activeUserId = userId;
    _profile = null;
    _readiness = null;
    _started = null;
    emit();
  },
  getProfile(): BtbProfile {
    if (_profile) return _profile;
    const storageKey = key("profile");
    _profile = { ...DEFAULT, ...(storageKey ? read<Partial<BtbProfile>>(storageKey, {}) : {}) };
    return _profile;
  },
  saveProfile(p: Partial<BtbProfile>) {
    const next = { ...btbStore.getProfile(), ...p };
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
  getStarted() {
    if (_started) return _started;
    const storageKey = key("started");
    _started = storageKey ? read(storageKey, { started: false, at: null }) : { started: false, at: null };
    return _started;
  },
  getReadiness(): Record<string, BtbReadiness> {
    if (_readiness) return _readiness;
    const storageKey = key("readiness");
    _readiness = storageKey ? read(storageKey, {}) : {};
    return _readiness;
  },
  setReadiness(sessionId: string, value: BtbReadiness) {
    const next = { ...btbStore.getReadiness(), [sessionId]: value };
    _readiness = next;
    const storageKey = key("readiness");
    if (storageKey) write(storageKey, next);
  },
};

export function useBtbProfile(): BtbProfile {
  return useSyncExternalStore(subscribe, btbStore.getProfile, btbStore.getProfile);
}
export function useBtbStarted() {
  return useSyncExternalStore(subscribe, btbStore.getStarted, btbStore.getStarted);
}
export function useBtbReadiness() {
  return useSyncExternalStore(subscribe, btbStore.getReadiness, btbStore.getReadiness);
}

/** 1..12 based on start date, clamped. Null if not started. */
export function currentBtbWeek(startISO: string | null): number | null {
  if (!startISO) return null;
  const start = new Date(startISO + "T00:00:00");
  if (Number.isNaN(start.getTime())) return null;
  const now = new Date();
  const days = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  if (days < 0) return 1;
  const wk = Math.floor(days / 7) + 1;
  return Math.min(12, Math.max(1, wk));
}