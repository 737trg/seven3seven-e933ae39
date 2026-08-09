import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { todayISO, type Meal } from "@/lib/nutrition";

export interface NutritionTargets {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  water_ml: number;
  method: string;
  sex: string | null;
  age: number | null;
  height_cm: number | null;
  activity_level: string | null;
  goal: string | null;
  protein_per_kg: number;
  basis_weight_kg: number | null;
  configured: boolean;
}

export interface FoodEntry {
  id: string;
  logged_on: string;
  meal: Meal;
  name: string;
  brand: string | null;
  barcode: string | null;
  serving_label: string | null;
  grams: number | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  source: string;
  saved: boolean;
  created_at: string;
}

export type NewFoodEntry = Omit<FoodEntry, "id" | "created_at">;

const DEFAULT_TARGETS: NutritionTargets = {
  calories: 2200,
  protein_g: 150,
  carbs_g: 220,
  fat_g: 70,
  water_ml: 2800,
  method: "calculated",
  sex: null,
  age: null,
  height_cm: null,
  activity_level: null,
  goal: null,
  protein_per_kg: 2,
  basis_weight_kg: null,
  configured: false,
};

const SELECT =
  "id, logged_on, meal, name, brand, barcode, serving_label, grams, calories, protein_g, carbs_g, fat_g, source, saved, created_at";

/** Targets, food log, hydration and 14-day history for the signed-in athlete. */
export function useNutrition(userId: string | undefined, day: string = todayISO()) {
  const [targets, setTargets] = useState<NutritionTargets>(DEFAULT_TARGETS);
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [recent, setRecent] = useState<FoodEntry[]>([]);
  const [history, setHistory] = useState<{ date: string; calories: number; protein_g: number }[]>([]);
  const [waterMl, setWaterMl] = useState(0);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (!userId) {
      setTargets(DEFAULT_TARGETS);
      setEntries([]);
      setRecent([]);
      setHistory([]);
      setWaterMl(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    const since = new Date(`${day}T00:00:00`);
    since.setDate(since.getDate() - 13);
    const sinceISO = since.toISOString().slice(0, 10);
    const [t, dayRows, rangeRows, water] = await Promise.all([
      supabase.from("nutrition_targets").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("food_entries").select(SELECT).eq("user_id", userId).eq("logged_on", day).order("created_at", { ascending: true }),
      supabase.from("food_entries").select(SELECT).eq("user_id", userId).gte("logged_on", sinceISO).lte("logged_on", day).order("created_at", { ascending: false }),
      supabase.from("hydration_logs").select("ml").eq("user_id", userId).eq("logged_on", day),
    ]);
    if (t.data) {
      setTargets({
        calories: t.data.calories,
        protein_g: t.data.protein_g,
        carbs_g: t.data.carbs_g,
        fat_g: t.data.fat_g,
        water_ml: t.data.water_ml,
        method: t.data.method,
        sex: t.data.sex,
        age: t.data.age,
        height_cm: t.data.height_cm as number | null,
        activity_level: t.data.activity_level,
        goal: t.data.goal,
        protein_per_kg: Number(t.data.protein_per_kg ?? 2),
        basis_weight_kg: t.data.basis_weight_kg as number | null,
        configured: true,
      });
    } else {
      setTargets(DEFAULT_TARGETS);
    }
    setEntries((dayRows.data ?? []) as FoodEntry[]);
    const range = (rangeRows.data ?? []) as FoodEntry[];
    const seen = new Set<string>();
    setRecent(
      range
        .filter((e) => {
          const key = `${e.name}|${e.brand ?? ""}|${Math.round(e.calories)}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .slice(0, 12),
    );
    const byDay = new Map<string, { calories: number; protein_g: number }>();
    for (const e of range) {
      const cur = byDay.get(e.logged_on) ?? { calories: 0, protein_g: 0 };
      cur.calories += Number(e.calories);
      cur.protein_g += Number(e.protein_g);
      byDay.set(e.logged_on, cur);
    }
    setHistory(
      [...byDay.entries()]
        .map(([date, v]) => ({ date, calories: Math.round(v.calories), protein_g: Math.round(v.protein_g) }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    );
    setWaterMl((water.data ?? []).reduce((sum, r) => sum + Number(r.ml), 0));
    setLoading(false);
  }, [userId, day]);
  useEffect(() => {
    void load();
  }, [load]);
  const saveTargets = useCallback(
    async (patch: Partial<Omit<NutritionTargets, "configured">>) => {
      if (!userId) return { error: "Not signed in" };
      const next = { ...targets, ...patch };
      setTargets({ ...next, configured: true });
      const { error } = await supabase.from("nutrition_targets").upsert(
        {
          user_id: userId,
          calories: next.calories,
          protein_g: next.protein_g,
          carbs_g: next.carbs_g,
          fat_g: next.fat_g,
          water_ml: next.water_ml,
          method: next.method,
          sex: next.sex,
          age: next.age,
          height_cm: next.height_cm,
          activity_level: next.activity_level,
          goal: next.goal,
          protein_per_kg: next.protein_per_kg,
          basis_weight_kg: next.basis_weight_kg,
        },
        { onConflict: "user_id" },
      );
      if (error) return { error: error.message };
      await load();
      return {};
    },
    [userId, targets, load],
  );
  const addEntry = useCallback(
    async (entry: Omit<NewFoodEntry, "logged_on"> & { logged_on?: string }) => {
      if (!userId) return { error: "Not signed in" };
      const { error } = await supabase.from("food_entries").insert({
        user_id: userId,
        logged_on: entry.logged_on ?? day,
        meal: entry.meal,
        name: entry.name,
        brand: entry.brand,
        barcode: entry.barcode,
        serving_label: entry.serving_label,
        grams: entry.grams,
        calories: entry.calories,
        protein_g: entry.protein_g,
        carbs_g: entry.carbs_g,
        fat_g: entry.fat_g,
        source: entry.source,
        saved: entry.saved,
      });
      if (error) return { error: error.message };
      await load();
      return {};
    },
    [userId, day, load],
  );
  const removeEntry = useCallback(
    async (id: string) => {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      await supabase.from("food_entries").delete().eq("id", id);
      await load();
    },
    [load],
  );
  const copyDay = useCallback(
    async (fromDay: string) => {
      if (!userId) return { error: "Not signed in" };
      const { data } = await supabase.from("food_entries").select(SELECT).eq("user_id", userId).eq("logged_on", fromDay);
      const rows = (data ?? []) as FoodEntry[];
      if (rows.length === 0) return { error: "Nothing logged that day" };
      const { error } = await supabase.from("food_entries").insert(
        rows.map((r) => ({
          user_id: userId,
          logged_on: day,
          meal: r.meal,
          name: r.name,
          brand: r.brand,
          barcode: r.barcode,
          serving_label: r.serving_label,
          grams: r.grams,
          calories: r.calories,
          protein_g: r.protein_g,
          carbs_g: r.carbs_g,
          fat_g: r.fat_g,
          source: r.source,
          saved: false,
        })),
      );
      if (error) return { error: error.message };
      await load();
      return {};
    },
    [userId, day, load],
  );
  const addWater = useCallback(
    async (ml: number) => {
      if (!userId) return;
      setWaterMl((prev) => Math.max(0, prev + ml));
      await supabase.from("hydration_logs").insert({ user_id: userId, logged_on: day, ml });
      await load();
    },
    [userId, day, load],
  );
  const clearWater = useCallback(async () => {
    if (!userId) return;
    setWaterMl(0);
    await supabase.from("hydration_logs").delete().eq("user_id", userId).eq("logged_on", day);
    await load();
  }, [userId, day, load]);
  const totals = useMemo(
    () =>
      entries.reduce(
        (acc, e) => ({
          calories: acc.calories + Number(e.calories),
          protein_g: acc.protein_g + Number(e.protein_g),
          carbs_g: acc.carbs_g + Number(e.carbs_g),
          fat_g: acc.fat_g + Number(e.fat_g),
        }),
        { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
      ),
    [entries],
  );
  return {
    targets,
    entries,
    recent,
    history,
    waterMl,
    totals,
    loading,
    saveTargets,
    addEntry,
    removeEntry,
    copyDay,
    addWater,
    clearWater,
    refresh: load,
  };
}