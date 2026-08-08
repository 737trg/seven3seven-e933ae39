import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type BodyMetric = {
  id: string;
  measured_on: string;
  weight_kg: number | null;
  bodyfat_pct: number | null;
  resting_hr: number | null;
  note: string | null;
};

export type NewBodyMetric = {
  measured_on: string;
  weight_kg?: number | null;
  bodyfat_pct?: number | null;
  resting_hr?: number | null;
  note?: string | null;
};

/** Bodyweight / composition log for the signed-in athlete (one row per day). */
export function useBodyMetrics(userId: string | undefined) {
  const [items, setItems] = useState<BodyMetric[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("body_metrics")
      .select("id, measured_on, weight_kg, bodyfat_pct, resting_hr, note")
      .eq("user_id", userId)
      .order("measured_on", { ascending: false })
      .limit(120);
    setItems((data ?? []) as BodyMetric[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(
    async (entry: NewBodyMetric) => {
      if (!userId) return { error: "Not signed in" };
      const { error } = await supabase
        .from("body_metrics")
        .upsert(
          {
            user_id: userId,
            measured_on: entry.measured_on,
            weight_kg: entry.weight_kg ?? null,
            bodyfat_pct: entry.bodyfat_pct ?? null,
            resting_hr: entry.resting_hr ?? null,
            note: entry.note?.trim() || null,
          },
          { onConflict: "user_id,measured_on" },
        );
      if (error) return { error: error.message };
      await load();
      return {};
    },
    [userId, load],
  );

  const remove = useCallback(
    async (id: string) => {
      setItems((prev) => prev.filter((m) => m.id !== id));
      await supabase.from("body_metrics").delete().eq("id", id);
      await load();
    },
    [load],
  );

  return { items, loading, save, remove, refresh: load };
}
