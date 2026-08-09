/**
 * Local-only profile, RX/Scaled track and readiness for TOTAL.
 * Authoritative results live in the database (session_completions, workout_results).
 */
import { useSyncExternalStore } from "react";

export type TotalTrack = "rx" | "scaled";
export type TotalReadiness = "ready" | "average" | "heavy" | "pain_changes_movement";

export type TotalProfile = {
  displayName: string;
  startDate: string | null;
  loadReference: "Male" | "Female" | "";
  equipment: string[];
  pullingOption: string;
  hangingTrunkOption: string;
  ropeOption: string;
  backSquatKg: number | null;
  strictPressKg: number | null;
  limitations: string;
  defaultTrack: TotalTrack;
  setupComplete: boolean;
};

const DEFAULT: TotalProfile = {
  displayName: "",
  startDate: null,
  loadReference: "",
  equipment: [],
  pullingOption: "",
  hangingTrunkOption: "",
  ropeOption: "",
  backSquatKg: null,
  strictPressKg: null,
  limitations: "",
  defaultTrack: "scaled",
  setupComplete: false,
};

const PROGRAMME_ID = "total";
let activeUserId: string | null = null;

const key = (name: string) => (activeUserId ? `total.${name}.v1:${activeUserId}:${PROGRAMME_ID}` : null);

const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }
export function subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); }

function read<T>(k: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(k);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch { return fallback; }
}
function write<T>(k: string, value: T) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(k, JSON.stringify(value)); emit(); } catch { /* quota */ }
}

let _profile: TotalProfile | null = null;
let _readiness: Record<string, TotalReadiness> | null = null;
let _tracks: Record<string, TotalTrack> | null = null;
let _started: { started: boolean; at: string | null } | null = null;

export const totalStore = {
  configureUser(userId: string | null) {
    if (activeUserId === userId) return;
    activeUserId = userId;
    _profile = null; _readiness = null; _tracks = null; _started = null;
    emit();
  },
  getProfile(): TotalProfile {
    if (_profile) return _profile;
    const k = key("profile");
    _profile = { ...DEFAULT, ...(k ? read<Partial<TotalProfile>>(k, {}) : {}) };
    return _profile;
  },
  saveProfile(p: Partial<TotalProfile>) {
    const next = { ...totalStore.getProfile(), ...p };
    _profile = next;
    const k = key("profile");
    if (k) write(k, next);
  },
  markStarted() {
    const v = { started: true, at: new Date().toISOString() };
    _started = v;
    const k = key("started");
    if (k) write(k, v);
  },
  getStarted(): { started: boolean; at: string | null } {
    if (_started) return _started;
    const k = key("started");
    _started = k ? read(k, { started: false, at: null }) : { started: false, at: null };
    return _started;
  },
  getReadiness(): Record<string, TotalReadiness> {
    if (_readiness) return _readiness;
    const k = key("readiness");
    _readiness = k ? read(k, {}) : {};
    return _readiness;
  },
  setReadiness(sessionId: string, value: TotalReadiness) {
    const next = { ...totalStore.getReadiness(), [sessionId]: value };
    _readiness = next;
    const k = key("readiness");
    if (k) write(k, next);
  },
  getTracks(): Record<string, TotalTrack> {
    if (_tracks) return _tracks;
    const k = key("tracks");
    _tracks = k ? read(k, {}) : {};
    return _tracks;
  },
  getTrack(sessionId: string): TotalTrack {
    return totalStore.getTracks()[sessionId] ?? totalStore.getProfile().defaultTrack;
  },
  setTrack(sessionId: string, value: TotalTrack) {
    const next = { ...totalStore.getTracks(), [sessionId]: value };
    _tracks = next;
    const k = key("tracks");
    if (k) write(k, next);
  },
};

export function useTotalProfile(): TotalProfile {
  return useSyncExternalStore(subscribe, totalStore.getProfile, totalStore.getProfile);
}
export function useTotalStarted() {
  return useSyncExternalStore(subscribe, totalStore.getStarted, totalStore.getStarted);
}
export function useTotalReadiness() {
  return useSyncExternalStore(subscribe, totalStore.getReadiness, totalStore.getReadiness);
}
export function useTotalTracks() {
  return useSyncExternalStore(subscribe, totalStore.getTracks, totalStore.getTracks);
}

/** Returns 1..12 based on start date, clamped. Null if no start date. */
export function currentTotalWeek(startISO: string | null): number | null {
  if (!startISO) return null;
  const start = new Date(startISO + "T00:00:00");
  if (Number.isNaN(start.getTime())) return null;
  const days = Math.floor((Date.now() - start.getTime()) / 86_400_000);
  if (days < 0) return 1;
  return Math.min(12, Math.max(1, Math.floor(days / 7) + 1));
}