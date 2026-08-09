/** Pure nutrition maths — no I/O, safe anywhere. */
export type Sex = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "high" | "athlete";
export type Goal = "cut" | "maintain" | "gain";
export type Meal = "breakfast" | "lunch" | "dinner" | "snacks";

export const MEALS: { key: Meal; label: string }[] = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
  { key: "snacks", label: "Snacks" },
];

export const ACTIVITY_LEVELS: { key: ActivityLevel; label: string; hint: string; factor: number }[] = [
  { key: "sedentary", label: "Sedentary", hint: "Desk job, little training", factor: 1.2 },
  { key: "light", label: "Light", hint: "1-2 sessions a week", factor: 1.375 },
  { key: "moderate", label: "Moderate", hint: "3-4 sessions a week", factor: 1.55 },
  { key: "high", label: "High", hint: "5-6 sessions a week", factor: 1.725 },
  { key: "athlete", label: "Very high", hint: "Daily training or physical job", factor: 1.9 },
];

export const GOALS: { key: Goal; label: string; hint: string; adjust: number }[] = [
  { key: "cut", label: "Lose fat", hint: "15% deficit", adjust: -0.15 },
  { key: "maintain", label: "Maintain", hint: "Hold bodyweight", adjust: 0 },
  { key: "gain", label: "Build", hint: "10% surplus", adjust: 0.1 },
];

export interface TargetInputs {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  goal: Goal;
  proteinPerKg: number;
}

export interface TargetResult {
  bmr: number;
  tdee: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  water_ml: number;
}

/** Mifflin-St Jeor. */
export function bmr({ sex, age, heightCm, weightKg }: Pick<TargetInputs, "sex" | "age" | "heightCm" | "weightKg">) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(sex === "male" ? base + 5 : base - 161);
}

export function calculateTargets(input: TargetInputs): TargetResult {
  const base = bmr(input);
  const factor = ACTIVITY_LEVELS.find((a) => a.key === input.activity)?.factor ?? 1.55;
  const tdee = Math.round(base * factor);
  const adjust = GOALS.find((g) => g.key === input.goal)?.adjust ?? 0;
  const calories = Math.max(1200, Math.round((tdee * (1 + adjust)) / 10) * 10);
  const protein_g = Math.round(input.weightKg * input.proteinPerKg);
  const fat_g = Math.round(input.weightKg * 0.8);
  const remaining = calories - protein_g * 4 - fat_g * 9;
  const carbs_g = Math.max(0, Math.round(remaining / 4));
  return { bmr: base, tdee, calories, protein_g, carbs_g, fat_g, water_ml: hydrationTarget(input.weightKg) };
}

/** 35 ml per kg of bodyweight, rounded to the nearest 100 ml. */
export function hydrationTarget(weightKg: number) {
  return Math.round((weightKg * 35) / 100) * 100;
}

export const KG_PER_LB = 0.45359237;
export const toKg = (value: number, units: "kg" | "lb") => (units === "lb" ? value * KG_PER_LB : value);
export const fromKg = (kg: number, units: "kg" | "lb") => (units === "lb" ? kg / KG_PER_LB : kg);

export const todayISO = () => new Date().toISOString().slice(0, 10);

export function shiftDay(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function dayLabel(iso: string) {
  if (iso === todayISO()) return "Today";
  if (iso === shiftDay(todayISO(), -1)) return "Yesterday";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

/** 0-1 fill plus a status used for colour. */
export function ringState(consumed: number, target: number) {
  const pct = target > 0 ? consumed / target : 0;
  const status: "under" | "hit" | "over" = pct >= 1.05 ? "over" : pct >= 0.95 ? "hit" : "under";
  return { pct: Math.max(0, Math.min(1.35, pct)), status };
}

export const round1 = (n: number) => Math.round(n * 10) / 10;