import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserPreferences {
  primary_product_id: string | null;
  units: "kg" | "lb";
  training_days: string[];
}

const DEFAULTS: UserPreferences = {
  primary_product_id: null,
  units: "kg",
  training_days: [],
};

/**
 * Per-athlete training preferences (highlighted programme, units, training
 * days). Stored in Lovable Cloud so the choice follows the athlete across
 * devices, with a safe in-memory default while loading.
 */
export function usePreferences(userId: string | undefined) {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) {
      setPrefs(DEFAULTS);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("user_preferences")
      .select("primary_product_id, units, training_days")
      .eq("user_id", userId)
      .maybeSingle();
    setPrefs({
      primary_product_id: data?.primary_product_id ?? null,
      units: (data?.units as "kg" | "lb") ?? "kg",
      training_days: data?.training_days ?? [],
    });
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const update = useCallback(
    async (patch: Partial<UserPreferences>) => {
      if (!userId) return;
      const next = { ...prefs, ...patch };
      setPrefs(next); // optimistic
      await supabase
        .from("user_preferences")
        .upsert({ user_id: userId, ...next }, { onConflict: "user_id" });
    },
    [userId, prefs],
  );

  return { prefs, loading, update, refresh: load };
}
