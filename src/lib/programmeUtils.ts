import { PROGRAMME, allSessions } from "@/data/programme";
import type { Session, Week } from "@/types/programme";

export const PROGRAMME_START = new Date("2026-06-29T00:00:00");
export const RACE_DATE = new Date(PROGRAMME.athlete.raceDate + "T00:00:00");

const daysBetween = (a: Date, b: Date) =>
  Math.floor((a.getTime() - b.getTime()) / 86400000);

/** Anchor "today" inside the programme window so the demo always populates. */
export const today = (): Date => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (now < PROGRAMME_START) return PROGRAMME_START;
  if (now > RACE_DATE) return RACE_DATE;
  return now;
};

export const daysUntilRace = (from: Date = today()) =>
  Math.max(0, daysBetween(RACE_DATE, from));

export const currentWeek = (from: Date = today()): Week => {
  const idx = Math.min(
    7,
    Math.max(0, Math.floor(daysBetween(from, PROGRAMME_START) / 7)),
  );
  return PROGRAMME.weeks[idx];
};

const dayName = (d: Date): Session["day"] =>
  (
    [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ] as const
  )[d.getDay()] as Session["day"];

export const todaySession = (from: Date = today()): Session | undefined => {
  const w = currentWeek(from);
  const name = dayName(from);
  return w.sessions.find((s) => s.day === name);
};

export const nextSession = (from: Date = today()): Session | undefined => {
  const all = allSessions();
  const todayISO = from.toISOString().slice(0, 10);
  return all.find((s) => (s.date ?? "") > todayISO);
};

export const formatClock = (totalSec: number) => {
  const m = Math.floor(totalSec / 60);
  const s = Math.floor(totalSec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const ukDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const ukShortDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

export const weeklyCompletion = (
  week: Week,
  logs: Record<string, { completed: boolean }>,
) => {
  const done = week.sessions.filter((s) => logs[s.id]?.completed).length;
  return {
    done,
    total: week.sessions.length,
    pct: Math.round((done / week.sessions.length) * 100),
  };
};