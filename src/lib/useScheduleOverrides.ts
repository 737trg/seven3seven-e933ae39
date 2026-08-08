import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";

export type OverrideAction = "move" | "skip" | "swap";

export type ScheduleOverride = {
  id: string;
  session_id: string;
  action: OverrideAction;
  day_of_week: string | null;
  swap_with_session_id: string | null;
  reason: string | null;
};

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

/**
 * Athlete-side schedule tweaks (move a session to another day, or skip it)
 * layered on top of the coach-written manifest, which never changes.
 */
export function useScheduleOverrides(slug: string) {
  const { user } = useAuth();
  const userId = user?.id;
  const [productId, setProductId] = useState<string | null>(null);
  const [bySession, setBySession] = useState<Record<string, ScheduleOverride>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) {
      setBySession({});
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: product } = await supabase.from("products").select("id").eq("slug", slug).maybeSingle();
    const pid = product?.id ?? null;
    setProductId(pid);
    if (!pid) {
      setBySession({});
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("session_schedule_overrides")
      .select("id, session_id, action, day_of_week, swap_with_session_id, reason")
      .eq("user_id", userId)
      .eq("product_id", pid);
    const map: Record<string, ScheduleOverride> = {};
    for (const row of (data ?? []) as ScheduleOverride[]) map[row.session_id] = row;
    setBySession(map);
    setLoading(false);
  }, [userId, slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const set = useCallback(
    async (sessionId: string, action: OverrideAction, dayOfWeek?: string | null) => {
      if (!userId || !productId) return;
      const existing = bySession[sessionId];
      const optimistic: ScheduleOverride = {
        id: existing?.id ?? `tmp-${sessionId}`,
        session_id: sessionId,
        action,
        day_of_week: dayOfWeek ?? null,
        swap_with_session_id: null,
        reason: null,
      };
      setBySession((prev) => ({ ...prev, [sessionId]: optimistic }));
      if (existing && !existing.id.startsWith("tmp-")) {
        await supabase
          .from("session_schedule_overrides")
          .update({ action, day_of_week: dayOfWeek ?? null })
          .eq("id", existing.id);
      } else {
        await supabase.from("session_schedule_overrides").insert({
          user_id: userId,
          product_id: productId,
          session_id: sessionId,
          action,
          day_of_week: dayOfWeek ?? null,
        });
      }
      await load();
    },
    [userId, productId, bySession, load],
  );

  const clear = useCallback(
    async (sessionId: string) => {
      const existing = bySession[sessionId];
      setBySession((prev) => {
        const next = { ...prev };
        delete next[sessionId];
        return next;
      });
      if (existing && !existing.id.startsWith("tmp-")) {
        await supabase.from("session_schedule_overrides").delete().eq("id", existing.id);
      }
      await load();
    },
    [bySession, load],
  );

  return { bySession, loading, set, clear, ready: Boolean(userId && productId) };
}