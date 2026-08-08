/** Server-only helpers for programme progress maths. */

/** Derive the week number from a manifest session id like `hrp-w3-s2`. */
export function weekFromSessionId(sessionId: string): number | null {
  const m = /-w(\d+)-s(\d+)$/.exec(sessionId);
  return m ? Number(m[1]) : null;
}

/** Derive the session-within-week number from a manifest session id. */
export function dayFromSessionId(sessionId: string): number | null {
  const m = /-w(\d+)-s(\d+)$/.exec(sessionId);
  return m ? Number(m[2]) : null;
}

export function pctFrom(completed: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((completed / total) * 100)));
}
