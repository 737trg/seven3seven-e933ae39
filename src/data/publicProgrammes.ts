import basicImg from "@/assets/programme-basic-training.jpg.asset.json";
import semImg from "@/assets/programme-sem.jpg.asset.json";
import raceImg from "@/assets/programme-hybrid-race.jpg.asset.json";
import mixedImg from "@/assets/programme-mixed.jpg.asset.json";

export type PublicProgrammeStatus = "in-development" | "releasing-soon" | "live";

export interface PublicProgramme {
  num: string;
  slug: string;
  title: string;
  collection: "BLUEPRINT" | "COMPETE" | "BUILD";
  shortLine: string;
  description: string;
  durationWeeks: number;
  image: string;
  status: PublicProgrammeStatus;
  whatYoullDo: string[];
  bestFor: string[];
  tracks?: { id: string; label: string; description: string }[];
}

export const PUBLIC_PROGRAMMES: PublicProgramme[] = [
  {
    num: "01",
    slug: "basic-training-blueprint-plus",
    title: "BASIC TRAINING BLUEPRINT+",
    collection: "BLUEPRINT",
    shortLine: "Build the fitness to handle what's ahead.",
    description:
      "A structured training plan built to improve running fitness, strength, conditioning and robustness for military preparation, selection and basic training.",
    durationWeeks: 12,
    image: basicImg.url,
    status: "live",
    whatYoullDo: [
      "Running development",
      "Loaded conditioning",
      "Bodyweight work",
      "Gym-based strength",
      "Aerobic conditioning",
      "Work capacity sessions",
    ],
    bestFor: [
      "People preparing for military training",
      "Those returning to structured fitness",
      "Those needing stronger basics and better conditioning",
    ],
  },
  {
    num: "02",
    slug: "sem-2026",
    title: "S.E.M. 2026",
    collection: "COMPETE",
    shortLine: "Strength. Endurance. MetCon.",
    description:
      "An eight-week competition-preparation programme combining progressive strength training, structured run and row development and event-specific mixed-modal conditioning.",
    durationWeeks: 8,
    image: semImg.url,
    status: "releasing-soon",
    whatYoullDo: [
      "Progressive heavy strength work",
      "Structured run and row development",
      "Event-specific mixed-modal conditioning",
      "Five core sessions per week",
      "One optional development session",
      "Readiness-led intensity guidance",
    ],
    bestFor: [
      "Intermediate and experienced hybrid athletes",
      "Athletes preparing for ATHX-style competition",
      "Individuals — and pairs sharing event-day work",
    ],
  },
  {
    num: "03",
    slug: "hybrid-race-plan",
    title: "HYBRID RACE PLAN",
    collection: "COMPETE",
    shortLine: "Run hard. Move well. Hold output.",
    description:
      "A performance plan built around running, machine work, station conditioning and sustainable pacing for hybrid fitness racing.",
    durationWeeks: 12,
    image: raceImg.url,
    status: "releasing-soon",
    whatYoullDo: [
      "Running intervals",
      "Threshold work",
      "Aerobic work",
      "Compromised running",
      "Machine conditioning",
      "Race-style efforts",
      "Fatigue management",
      "Pacing and engine development",
    ],
    bestFor: [
      "Those preparing for hybrid fitness races",
      "Athletes wanting better run-fitness balance",
      "People needing stronger race-specific conditioning",
    ],
  },
  {
    num: "04",
    slug: "mixed",
    title: "MIXED",
    collection: "BUILD",
    shortLine: "Strength. Skill. Conditioning.",
    description:
      "A functional training programme built around barbell work, gymnastics elements, engine work and mixed-modal conditioning.",
    durationWeeks: 8,
    image: mixedImg.url,
    status: "in-development",
    whatYoullDo: [
      "Barbell strength",
      "Olympic lift variations",
      "Gymnastics skill development",
      "Conditioning pieces",
      "Mixed-modal metcons",
      "Work capacity sessions",
    ],
    bestFor: [
      "Athletes who enjoy functional fitness",
      "People wanting strength plus conditioning",
      "Those who want structure without random programming",
    ],
    tracks: [
      {
        id: "rx",
        label: "RX",
        description:
          "For experienced athletes comfortable with higher loading, more technical work and advanced conditioning demands.",
      },
      {
        id: "scaled",
        label: "Scaled",
        description:
          "For athletes needing reduced complexity, lighter loading and more accessible progressions.",
      },
    ],
  },
];

export function getPublicProgramme(slug: string): PublicProgramme | undefined {
  return PUBLIC_PROGRAMMES.find((p) => p.slug === slug);
}

export function statusLabel(s: PublicProgrammeStatus): string {
  if (s === "live") return "Live";
  if (s === "in-development") return "In development";
  return "Releasing soon";
}