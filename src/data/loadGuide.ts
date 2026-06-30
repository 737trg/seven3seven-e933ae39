export const round2_5 = (n: number) => Math.round(n / 2.5) * 2.5;

export const LOAD_PERCENTAGES = [50, 55, 60, 65, 70, 75, 80, 82.5, 85, 87.5, 90, 92.5, 95] as const;

export const RPE_GUIDE = [
  { rpe: 6, feel: "Easy-moderate", meaning: "About four good reps still available" },
  { rpe: 7, feel: "Comfortably hard", meaning: "About three good reps still available" },
  { rpe: 8, feel: "Hard but controlled", meaning: "About two good reps still available" },
  { rpe: 9, feel: "Very hard", meaning: "About one good rep still available" },
  { rpe: 10, feel: "Maximum", meaning: "No extra rep available; use only in competition or planned testing" },
] as const;

export const COMP_LOAD_REFERENCE = [
  { movement: "Endurance swap", men: "750 m", pro: "1 km" },
  { movement: "Ground to overhead", men: "1 × 20 kg, alternating arms", pro: "2 × 22.5 kg" },
  { movement: "Sandbag carry", men: "50 kg", pro: "70 kg" },
  { movement: "Box jump over", men: "24 in", pro: "30 in" },
  { movement: "Walking lunge", men: "2 × 20 kg suitcase hold", pro: "2 × 22.5 kg front rack" },
  { movement: "Burpee broad jump", men: "60 m per pair", pro: "60 m per pair" },
];

export const COMPETITION_ZONES = [
  { zone: "Strength", clock: "20 min", task: "1RM strict press; 3RM back squat; 5RM deadlift", score: "Total weight lifted by the pair" },
  { zone: "Endurance", clock: "22 min", task: "One runs while one rows; Pro swaps every 1 km", score: "Total run + row distance" },
  { zone: "MetCon-X", clock: "25 min cap", task: "Ski, dual DB GTOH, sandbag, box jumps, lunges, burpee broad jumps, Ski", score: "Time to complete" },
];