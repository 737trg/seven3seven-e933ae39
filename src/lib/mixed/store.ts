/**
 * Local-only profile, RX/Scaled track and readiness for MIXED.
 * Authoritative results live in the database (session_completions, workout_results).
 */
import { useSyncExternalStore } from "react";

export type MixedTrack = "rx" | "scaled";
export type MixedReadiness = "ready" | "average" | "heavy" | "pain_changes_movement";

export type MixedProfile = {
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
  defaultTrack: MixedTrack;
  setupComplete: boolean;
};

const DEFAULT: MixedProfile = {
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

const PROGRAMME_ID = "mixed";
let activeUserId: string | null = null;

const key = (name: string) => (activeUserId ? `mixed.${name}.v1:${activeUserId}:${PROGRAMME_ID}` : null);

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

let _profile: MixedProfile | null = null;
let _readiness: Record<string, MixedReadiness> | null = null;
let _tracks: Record<string, MixedTrack> | null = null;
let _started: { started: boolean; at: string | null } | null = null;

export const mixedStore = {
  configureUser(userId: string | null) {
    if (activeUserId === userId) return;
    activeUserId = userId;
    _profile = null; _readiness = null; _tracks = null; _started = null;
    emit();
  },
  getProfile(): MixedProfile {
    if (_profile) return _profile;
    const k = key("profile");
    _profile = { ...DEFAULT, ...(k ? read<Partial<MixedProfile>>(k, {}) : {}) };
    return _profile;
  },
  saveProfile(p: Partial<MixedProfile>) {
    const next = { ...mixedStore.getProfile(), ...p };
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
  getReadiness(): Record<string, MixedReadiness> {
    if (_readiness) return _readiness;
    const k = key("readiness");
    _readiness = k ? read(k, {}) : {};
    return _readiness;
  },
  setReadiness(sessionId: string, value: MixedReadiness) {
    const next = { ...mixedStore.getReadiness(), [sessionId]: value };
    _readiness = next;
    const k = key("readiness");
    if (k) write(k, next);
  },
  getTracks(): Record<string, MixedTrack> {
    if (_tracks) return _tracks;
    const k = key("tracks");
    _tracks = k ? read(k, {}) : {};
    return _tracks;
  },
  getTrack(sessionId: string): MixedTrack {
    return mixedStore.getTracks()[sessionId] ?? mixedStore.getProfile().defaultTrack;
  },
  setTrack(sessionId: string, value: MixedTrack) {
    const next = { ...mixedStore.getTracks(), [sessionId]: value };
    _tracks = next;
    const k = key("tracks");
    if (k) write(k, next);
  },
};

export function useMixedProfile(): MixedProfile {
  return useSyncExternalStore(subscribe, mixedStore.getProfile, mixedStore.getProfile);
}
export function useMixedStarted() {
  return useSyncExternalStore(subscribe, mixedStore.getStarted, mixedStore.getStarted);
}
export function useMixedReadiness() {
  return useSyncExternalStore(subscribe, mixedStore.getReadiness, mixedStore.getReadiness);
}
export function useMixedTracks() {
  return useSyncExternalStore(subscribe, mixedStore.getTracks, mixedStore.getTracks);
}

/** Returns 1..12 based on start date, clamped. Null if no start date. */
export function currentMixedWeek(startISO: string | null): number | null {
  if (!startISO) return null;
  const start = new Date(startISO + "T00:00:00");
  if (Number.isNaN(start.getTime())) return null;
  const days = Math.floor((Date.now() - start.getTime()) / 86_400_000);
  if (days < 0) return 1;
  return Math.min(12, Math.max(1, Math.floor(days / 7) + 1));
}