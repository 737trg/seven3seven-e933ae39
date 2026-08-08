/**
 * Training-consistency maths shared by the library dashboard.
 * Streaks are counted in whole local days: a day "counts" when the athlete
 * completed at least one session. Today not being trained yet does not break
 * a streak (it only breaks once a full day is missed).
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export function dayKey(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export type StreakSummary = {
  current: number;
  longest: number;
  /** Last 7 days, oldest → newest. */
  week: { key: string; label: string; trained: boolean; isToday: boolean }[];
  thisWeekCount: number;
  lastTrainedAt: string | null;
};

export function computeStreak(timestamps: string[]): StreakSummary {
  const days = new Set(timestamps.map((t) => dayKey(t)));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Current streak: walk back from today (or yesterday if today is untrained).
  let cursor = new Date(today);
  if (!days.has(dayKey(cursor))) cursor = new Date(today.getTime() - DAY_MS);
  let current = 0;
  while (days.has(dayKey(cursor))) {
    current += 1;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }

  // Longest streak across all trained days.
  const sorted = [...days].sort();
  let longest = 0;
  let run = 0;
  let prev: number | null = null;
  for (const key of sorted) {
    const ms = new Date(`${key}T00:00:00`).getTime();
    run = prev !== null && Math.round((ms - prev) / DAY_MS) === 1 ? run + 1 : 1;
    prev = ms;
    if (run > longest) longest = run;
  }

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today.getTime() - (6 - i) * DAY_MS);
    const key = dayKey(d);
    return {
      key,
      label: d.toLocaleDateString("en-GB", { weekday: "narrow" }),
      trained: days.has(key),
      isToday: i === 6,
    };
  });

  const sortedTs = [...timestamps].sort();
  return {
    current,
    longest,
    week,
    thisWeekCount: week.filter((d) => d.trained).length,
    lastTrainedAt: sortedTs.length ? sortedTs[sortedTs.length - 1] : null,
  };
}