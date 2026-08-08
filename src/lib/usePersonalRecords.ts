import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PersonalRecord = {
  id: string;
  lift_key: string;
  lift_label: string;
  metric: string;
  value: number;
  reps: number | null;
  unit: string;
  achieved_on: string;
  note: string | null;
};

export type NewPersonalRecord = {
  lift_label: string;
  metric: string;
  value: number;
  reps?: number | null;
  unit: string;
  achieved_on: string;
  note?: string | null;
};

export const PR_METRICS = [
  { value: "load", label: "Load", unitOptions: ["kg", "lb"] },
  { value: "time", label: "Time", unitOptions: ["sec", "min"] },
  { value: "distance", label: "Distance", unitOptions: ["km", "m", "mi"] },
  { value: "reps", label: "Reps", unitOptions: ["reps"] },
] as const;

export function slugifyLift(label: string): string {
  return label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "lift";
}

/** Personal bests / benchmarks for the signed-in athlete. */
export function usePersonalRecords(userId: string | undefined) {
  const [items, setItems] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("personal_records")
      .select("id, lift_key, lift_label, metric, value, reps, unit, achieved_on, note")
      .eq("user_id", userId)
      .order("achieved_on", { ascending: false });
    setItems((data ?? []) as PersonalRecord[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const add = useCallback(
    async (record: NewPersonalRecord) => {
      if (!userId) return { error: "Not signed in" };
      const { error } = await supabase.from("personal_records").insert({
        user_id: userId,
        lift_key: slugifyLift(record.lift_label),
        lift_label: record.lift_label.trim(),
        metric: record.metric,
        value: record.value,
        reps: record.reps ?? null,
        unit: record.unit,
        achieved_on: record.achieved_on,
        note: record.note?.trim() || null,
      });
      if (error) return { error: error.message };
      await load();
      return {};
    },
    [userId, load],
  );

  const remove = useCallback(
    async (id: string) => {
      setItems((prev) => prev.filter((r) => r.id !== id));
      await supabase.from("personal_records").delete().eq("id", id);
      await load();
    },
    [load],
  );

  return { items, loading, add, remove, refresh: load };
}