import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adaptFromReadiness, type ReadinessAdaptation, type ReadinessInput } from "@/lib/readiness";

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Today's readiness check-in for the signed-in athlete, stored in Lovable
 * Cloud so the adaptation follows them between phone and laptop.
 */
export function useReadiness() {
  const [input, setInput] = useState<ReadinessInput>({});
  const [logged, setLogged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes?.user?.id ?? null;
      if (!active) return;
      setUserId(uid);
      if (!uid) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("readiness_logs")
        .select("sleep_hours, soreness, stress, energy")
        .eq("user_id", uid)
        .eq("log_date", today())
        .maybeSingle();
      if (!active) return;
      if (data) {
        setInput({
          sleepHours: data.sleep_hours ?? null,
          soreness: data.soreness ?? null,
          stress: data.stress ?? null,
          energy: data.energy ?? null,
        });
        setLogged(true);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const save = useCallback(
    async (next: ReadinessInput) => {
      setInput(next);
      setLogged(true);
      if (!userId) return;
      const row = {
        user_id: userId,
        log_date: today(),
        sleep_hours: next.sleepHours ?? null,
        soreness: next.soreness ?? null,
        stress: next.stress ?? null,
        energy: next.energy ?? null,
      };
      const { data: existing } = await supabase
        .from("readiness_logs")
        .select("id")
        .eq("user_id", userId)
        .eq("log_date", today())
        .maybeSingle();
      if (existing?.id) {
        await supabase.from("readiness_logs").update(row).eq("id", existing.id);
      } else {
        await supabase.from("readiness_logs").insert(row);
      }
    },
    [userId],
  );

  const adaptation: ReadinessAdaptation | null = adaptFromReadiness(input);

  return { input, adaptation, logged, loading, save };
}