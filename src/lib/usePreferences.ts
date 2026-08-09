import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Reminder + nudge settings, stored inside `user_preferences.settings`. */
export interface NotificationSettings {
  /** Daily "today's session" nudge. */
  daily_reminder: boolean;
  /** Local time for the daily nudge, "HH:MM". */
  reminder_time: string;
  /** Monday recap of the week gone and the week ahead. */
  weekly_recap: boolean;
  /** One warm nudge when a streak breaks or things go quiet. */
  streak_rescue: boolean;
}

export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  daily_reminder: true,
  reminder_time: "07:00",
  weekly_recap: true,
  streak_rescue: true,
};

export interface UserPreferences {
  primary_product_id: string | null;
  units: "kg" | "lb";
  training_days: string[];
  notifications: NotificationSettings;
  onboarding_completed_at: string | null;
}

const DEFAULTS: UserPreferences = {
  primary_product_id: null,
  units: "kg",
  training_days: [],
  notifications: DEFAULT_NOTIFICATIONS,
  onboarding_completed_at: null,
};

type SettingsBlob = { notifications?: Partial<NotificationSettings> } & Record<string, unknown>;

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
      .select("primary_product_id, units, training_days, settings, onboarding_completed_at")
      .eq("user_id", userId)
      .maybeSingle();
    const settings = (data?.settings ?? {}) as SettingsBlob;
    setPrefs({
      primary_product_id: data?.primary_product_id ?? null,
      units: (data?.units as "kg" | "lb") ?? "kg",
      training_days: data?.training_days ?? [],
      notifications: { ...DEFAULT_NOTIFICATIONS, ...(settings.notifications ?? {}) },
      onboarding_completed_at: data?.onboarding_completed_at ?? null,
    });
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const update = useCallback(
    async (patch: Partial<UserPreferences>) => {
      if (!userId) return;
      const next: UserPreferences = {
        ...prefs,
        ...patch,
        notifications: { ...prefs.notifications, ...(patch.notifications ?? {}) },
      };
      setPrefs(next); // optimistic
      await supabase.from("user_preferences").upsert(
        {
          user_id: userId,
          primary_product_id: next.primary_product_id,
          units: next.units,
          training_days: next.training_days,
          settings: { notifications: { ...next.notifications } } as unknown as Record<string, never>,
          onboarding_completed_at: next.onboarding_completed_at,
        },
        { onConflict: "user_id" },
      );
    },
    [userId, prefs],
  );

  return { prefs, loading, update, refresh: load };
}
