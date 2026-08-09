import { useMemo, useState } from "react";
import { Droplets, Plus, Settings2, Trash2 } from "lucide-react";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { ClubLock } from "@/components/dashboard/ClubLock";
import { LineChart } from "@/components/dashboard/LineChart";
import { MacroRing } from "@/components/dashboard/nutrition/MacroRing";
import { AddFoodSheet } from "@/components/dashboard/nutrition/AddFoodSheet";
import { TargetsSheet } from "@/components/dashboard/nutrition/TargetsSheet";
import { useNutrition } from "@/lib/useNutrition";
import { useBodyMetrics } from "@/lib/useBodyMetrics";
import { MEALS, dayLabel, ringState, shiftDay, todayISO, type Meal } from "@/lib/nutrition";

const WATER_STEPS = [250, 500, 750];

/** Daily nutrition: targets, macro rings, meal log, hydration and a 14-day trend. */
export function FuelTab({
  userId,
  units,
  club,
}: {
  userId: string | undefined;
  units: "kg" | "lb";
  club: boolean;
}) {
  const [day, setDay] = useState(todayISO());
  const nutrition = useNutrition(userId, day);
  const body = useBodyMetrics(userId);
  const [addOpen, setAddOpen] = useState(false);
  const [addMeal, setAddMeal] = useState<Meal>("breakfast");
  const [targetsOpen, setTargetsOpen] = useState(false);

  const { targets, entries, totals, waterMl, history, recent } = nutrition;
  const latestWeightKg = body.items.find((m) => m.weight_kg != null)?.weight_kg ?? null;
  const water = ringState(waterMl, targets.water_ml);

  const byMeal = useMemo(() => {
    const map = new Map<Meal, typeof entries>();
    for (const m of MEALS) map.set(m.key, []);
    for (const e of entries) map.set(e.meal, [...(map.get(e.meal) ?? []), e]);
    return map;
  }, [entries]);

  const chartPoints = history.map((h) => ({ date: h.date, value: h.calories }));

  return (
    <div className="space-y-6">
      <SectionCard
        title="Fuel"
        action={
          <button
            type="button"
            onClick={() => setTargetsOpen(true)}
            className="tap press inline-flex items-center gap-1.5 eyebrow text-signal"
          >
            <Settings2 className="h-3.5 w-3.5" strokeWidth={1.5} /> Targets
          </button>
        }
      >
        <ClubLock unlocked={club} blurb="Set calorie and protein targets, scan barcodes and track every meal alongside your training.">
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setDay((d) => shiftDay(d, -1))}
                className="tap press h-9 px-3 border border-border/60 text-foreground-muted text-[10px] uppercase tracking-widest font-display"
              >
                Prev
              </button>
              <p className="font-display text-bone text-sm uppercase tracking-widest">{dayLabel(day)}</p>
              <button
                type="button"
                disabled={day >= todayISO()}
                onClick={() => setDay((d) => shiftDay(d, 1))}
                className="tap press h-9 px-3 border border-border/60 text-foreground-muted text-[10px] uppercase tracking-widest font-display disabled:opacity-30"
              >
                Next
              </button>
            </div>

            {!targets.configured && (
              <p className="body-sm">
                These are starter numbers.{" "}
                <button type="button" onClick={() => setTargetsOpen(true)} className="text-signal underline underline-offset-4">
                  Work out your own targets
                </button>{" "}
                in about 30 seconds.
              </p>
            )}

            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
              <MacroRing label="Calories" consumed={totals.calories} target={targets.calories} size={104} />
              <MacroRing label="Protein" consumed={totals.protein_g} target={targets.protein_g} unit="g" />
              <MacroRing label="Carbs" consumed={totals.carbs_g} target={targets.carbs_g} unit="g" />
              <MacroRing label="Fat" consumed={totals.fat_g} target={targets.fat_g} unit="g" />
            </div>

            <div className="hairline p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="eyebrow text-foreground-muted inline-flex items-center gap-2">
                  <Droplets className="h-3.5 w-3.5" strokeWidth={1.5} /> Hydration
                </p>
                <p className={`tabular text-sm ${water.status === "under" ? "text-bone" : "text-earned"}`}>
                  {(waterMl / 1000).toFixed(2)} / {(targets.water_ml / 1000).toFixed(1)} L
                </p>
              </div>
              <div className="mt-3 h-2 bg-border/60">
                <div
                  className={`h-full transition-all ${water.status === "under" ? "bg-bone" : "bg-earned"}`}
                  style={{ width: `${Math.min(100, water.pct * 100)}%` }}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {WATER_STEPS.map((ml) => (
                  <button
                    key={ml}
                    type="button"
                    onClick={() => void nutrition.addWater(ml)}
                    className="tap press h-10 px-3 border border-border/60 text-bone text-[10px] uppercase tracking-widest font-display hover:border-bone"
                  >
                    +{ml} ml
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => void nutrition.clearWater()}
                  className="tap press h-10 px-3 text-foreground-muted text-[10px] uppercase tracking-widest font-display"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {MEALS.map((meal) => {
                const rows = byMeal.get(meal.key) ?? [];
                const kcal = rows.reduce((s, r) => s + Number(r.calories), 0);
                return (
                  <div key={meal.key} className="hairline p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="eyebrow">{meal.label}</p>
                        <p className="text-foreground-muted text-[11px] tabular mt-1">{Math.round(kcal)} kcal</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAddMeal(meal.key);
                          setAddOpen(true);
                        }}
                        className="tap press h-10 px-3 inline-flex items-center gap-1.5 border border-border text-bone text-[10px] uppercase tracking-widest font-display hover:border-bone"
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={1.75} /> Add
                      </button>
                    </div>
                    {rows.length > 0 && (
                      <ul className="mt-3 divide-y divide-border/60">
                        {rows.map((entry) => (
                          <li key={entry.id} className="flex items-center justify-between gap-3 py-2.5">
                            <div className="min-w-0">
                              <p className="text-bone text-sm truncate">{entry.name}</p>
                              <p className="text-foreground-muted text-[11px] tabular">
                                {entry.serving_label ? `${entry.serving_label} · ` : ""}
                                {Math.round(entry.calories)} kcal · {entry.protein_g}P / {entry.carbs_g}C / {entry.fat_g}F
                              </p>
                            </div>
                            <button
                              type="button"
                              aria-label={`Remove ${entry.name}`}
                              onClick={() => void nutrition.removeEntry(entry.id)}
                              className="tap press text-foreground-muted hover:text-signal shrink-0"
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>

            {entries.length === 0 && (
              <button
                type="button"
                onClick={() => void nutrition.copyDay(shiftDay(day, -1))}
                className="tap press text-signal text-[11px] uppercase tracking-widest"
              >
                Copy yesterday's food
              </button>
            )}
          </div>
        </ClubLock>
      </SectionCard>

      {club && chartPoints.length > 1 && (
        <SectionCard title="Last 14 days">
          <LineChart points={chartPoints} format={(v) => `${Math.round(v)} kcal`} />
          <p className="body-sm mt-3">
            Average {Math.round(chartPoints.reduce((s, p) => s + p.value, 0) / chartPoints.length)} kcal a day against a{" "}
            {targets.calories} kcal target.
          </p>
        </SectionCard>
      )}

      <AddFoodSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        meal={addMeal}
        recent={recent}
        onAdd={nutrition.addEntry}
      />
      <TargetsSheet
        open={targetsOpen}
        onClose={() => setTargetsOpen(false)}
        targets={targets}
        units={units}
        latestWeightKg={latestWeightKg}
        onSave={nutrition.saveTargets}
      />
    </div>
  );
}