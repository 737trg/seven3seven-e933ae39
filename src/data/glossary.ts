import type { GlossaryTerm, MovementStandard } from "@/types/programme";

export const GLOSSARY: GlossaryTerm[] = [
  { term: "1RM / 3RM / 5RM", short: "The heaviest load you can complete for one, three or five legal reps." },
  { term: "AMRAP", short: "As many rounds or reps as possible in the stated time.", example: "12-min AMRAP — keep moving for the whole time." },
  { term: "EMOM", short: "Every minute on the minute. Start the stated work at the top of each minute; the remaining time is rest." },
  { term: "Rounds for time", short: "Complete the listed rounds as quickly as possible, every rep legal." },
  { term: "Time cap", short: "The session stops when the limit is reached, even if work is unfinished." },
  { term: "RPE", short: "1–10 effort rating. RPE 8 = hard but controlled, ~2 good reps left." },
  { term: "Top set", short: "The heaviest planned set of the day." },
  { term: "Back-off set", short: "A lighter set after the top set to add useful practice and volume." },
  { term: "Zone 2", short: "Easy aerobic work at a conversational pace." },
  { term: "Threshold", short: "A hard sustained pace you can hold for several minutes without sprinting." },
  { term: "Interval", short: "A work period followed by planned easier recovery." },
  { term: "Deload", short: "A planned easier week that reduces fatigue while keeping main movements." },
  { term: "Taper", short: "The final reduction in volume before competition so fitness remains but fatigue falls." },
  { term: "Primer", short: "A short, light session used to feel sharp before race day." },
  { term: "Race / event load", short: "The exact weight or height used in your competition category." },
  { term: "Transition", short: "The change from one movement, machine or athlete to the next." },
  { term: "Unbroken", short: "Completing all stated reps without putting the equipment down or pausing." },
  { term: "Touch and go", short: "Moving directly into the next rep after the equipment touches the ground. Use only when allowed and controlled." },
  { term: "Lockout", short: "The finished position with the required joints fully extended." },
  { term: "No rep", short: "A repetition that does not meet the movement standard and does not count." },
  { term: "GTOH", short: "Ground to overhead. Move the DB(s) from the floor to a fully locked-out overhead position." },
  { term: "BJO", short: "Box jump over." },
  { term: "BBJ", short: "Burpee broad jump." },
  { term: "DB / SB", short: "Dumbbell / sandbag." },
  { term: "Erg", short: "An indoor conditioning machine such as a rower or SkiErg." },
];

export const MOVEMENT_STANDARDS: MovementStandard[] = [
  { movement: "Strict press", validRep: "Start from the front rack, stand tall and press without bending knees or hips. Finish locked out over the middle of the body.", cue: "No knee dip." },
  { movement: "Back squat", validRep: "Hip crease passes below the top of the knee. Finish every rep standing fully tall. Complete all three before re-racking.", cue: "Depth + full extension." },
  { movement: "Deadlift", validRep: "Conventional stance only; hands outside knees; no straps; arms stay straight. Stand fully tall. Max 5-sec pause between reps.", cue: "Reset the brace." },
  { movement: "Run / row swap", validRep: "Pro athletes complete 1 km before swapping. The rower returns the handle to the holder before leaving the seat.", cue: "Handle home, then leave." },
  { movement: "SkiErg", validRep: "Complete all required calories before leaving the station. Control or hand over the handles — do not let them fly.", cue: "Control the handles." },
  { movement: "Dual DB GTOH", validRep: "Both dumbbells start on the floor and finish locked out overhead. Clean & jerk or snatch allowed. Place dumbbells down — do not drop.", eventLoad: "2 × 22.5 kg (Pro)" },
  { movement: "Sandbag carry", validRep: "Pick up your own bag and carry 30 m. Pairs may not hand the bag directly to each other.", eventLoad: "70 kg (Pro)" },
  { movement: "Box jump over", validRep: "Two-foot jump. Both feet touch the top together; no need to stand tall. Finish with both feet on the far side.", eventLoad: "30 in (Pro)" },
  { movement: "Front-rack lunge", validRep: "Both dumbbells stay at the shoulders. Back knee touches the ground; hips and knees extend at the top.", eventLoad: "2 × 22.5 kg (Pro)" },
  { movement: "Burpee broad jump", validRep: "Chest touches the floor. Jump and land with two feet. Do not shuffle forward between reps.", eventLoad: "60 m per pair" },
];

export const COMPETITION_RULES = [
  "Permitted: belt, knee sleeves, elbow sleeves, wrist wraps, weightlifting shoes, chalk.",
  "Not permitted: lifting straps, knee wraps, specialised supportive suits.",
];