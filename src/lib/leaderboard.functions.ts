import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type LeaderboardRow = {
  rank: number;
  display_name: string;
  sessions_completed: number;
  total_seconds: number;
  is_me: boolean;
};

/**
 * Monthly consistency board. The underlying elevated-privilege database
 * function is not callable by app users; it runs here only, and the response
 * never includes other athletes' user ids.
 */
export const getMonthlyLeaderboard = createServerFn({ method: "POST" })
  .validator((d: unknown): { monthStart: string } => {
    const monthStart = (d as { monthStart?: unknown } | null)?.monthStart;
    if (typeof monthStart !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(monthStart)) {
      throw new Error("Invalid month.");
    }
    return { monthStart };
  })
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }): Promise<LeaderboardRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin.rpc("monthly_leaderboard", {
      _month_start: data.monthStart,
    });
    if (error) throw new Error("Could not load the leaderboard.");
    return (rows ?? []).slice(0, 10).map((r, i) => ({
      rank: i + 1,
      display_name: r.display_name ?? "Athlete",
      sessions_completed: Number(r.sessions_completed ?? 0),
      total_seconds: Number(r.total_seconds ?? 0),
      is_me: r.user_id === context.userId,
    }));
  });