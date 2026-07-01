import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, X } from "lucide-react";
import semImg from "@/assets/programme-sem.jpg.asset.json";
import { useAuth } from "@/lib/useAuth";
import { useEntitlements } from "@/lib/useEntitlements";
import { useSemStarted, semStore } from "@/lib/sem/store";
import { ensureEnrolment } from "@/lib/enrolment.functions";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const SITE = "https://seven3seven.lovable.app";
const SLUG = "sem-2026";
const TITLE = "S.E.M. 2026 | SEVEN3SEVEN";
const DESC =
  "An eight-week ATHX and ATHX Pro preparation programme developing competition strength, run-row endurance, MetCon capacity and Race Day execution.";

export const Route = createFileRoute("/_marketing/programmes/sem-2026")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: "S.E.M. 2026" },
      {
        property: "og:description",
        content:
          "Strength. Endurance. MetCon. Prepared enough to do all three when it counts.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/programmes/${SLUG}` },
      { property: "og:image", content: semImg.url },
      { name: "twitter:image", content: semImg.url },
    ],
    links: [{ rel: "canonical", href: `${SITE}/programmes/${SLUG}` }],
  }),
  component: SemProductPage,
});

// Shared cart storage (same key used by BTB product page) — additive shape.
const CART_KEY = "s3s.cart.v1";
type CartState = { hasBtb?: boolean; hasSem?: boolean };
function readCart(): CartState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartState) : {};
  } catch {
    return {};
  }
}
function writeCart(next: CartState) {
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("s3s-cart"));
  } catch {}
}
function useCart() {
  const [state, setState] = useState<CartState>({});
  useEffect(() => {
    setState(readCart());
    const h = () => setState(readCart());
    window.addEventListener("s3s-cart", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("s3s-cart", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return {
    ...state,
    addSem: () => writeCart({ ...readCart(), hasSem: true }),
    removeSem: () => writeCart({ ...readCart(), hasSem: false }),
  };
}

// ─── Content ──────────────────────────────────────────────────────────────

const FACT_STRIP = [
  {
    label: "Duration",
    value: "8 weeks",
    body: "A progressive build from honest baselines to full competition rehearsal and Race Week.",
  },
  {
    label: "Core training",
    value: "5 days",
    body: "Every scored quality is developed without making every session one endless circuit.",
  },
  {
    label: "Optional development",
    value: "1 session",
    body: "Low-fatigue Zone 2, movement standards and technical race practice.",
  },
  {
    label: "Delivery",
    value: "App + PDF",
    body: "Interactive session delivery, timers, result logging, Race Day tools and a permanent downloadable programme.",
  },
];

const PILLARS = [
  {
    n: "01",
    title: "Strength",
    lead: "Build the exact lifts that score.",
    body: "Strict press, back squat and deadlift remain weekly priorities throughout the programme. Training develops the 1RM strict press, 3RM back squat and 5RM deadlift while rehearsing legal repetitions, attempt selection and performance under the competition clock.",
  },
  {
    n: "02",
    title: "Endurance",
    lead: "Build output you can repeat.",
    body: "Dedicated running and rowing sessions develop category-distance pacing, hard sustainable effort, transitions and the ability to maintain total distance across the full endurance window.",
  },
  {
    n: "03",
    title: "MetCon",
    lead: "Move well when fatigue arrives.",
    body: "Progressively develop SkiErg capacity, ground-to-overhead efficiency, loaded carries, box jump overs, walking lunges and burpee broad jumps. The goal is not random suffering. The goal is legal, repeatable movement at the load and standard required.",
  },
];

const AUDIENCE = [
  {
    n: "01",
    title: "ATHX Individual athletes",
    body: "Build the complete strength, engine and movement capacity required to perform every part of the event yourself.",
  },
  {
    n: "02",
    title: "ATHX Pairs athletes",
    body: "Each athlete completes the full training programme individually before eligible race-day work is shared between the pair.",
  },
  {
    n: "03",
    title: "ATHX Pro athletes",
    body: "Use the same programme structure with Pro-specific run-row distances, dumbbell setup, sandbag load, box height and lunge position.",
  },
  {
    n: "04",
    title: "Intermediate and experienced hybrid athletes",
    body: "For athletes who can safely strict press, back squat and deadlift and can already run and row continuously.",
  },
  {
    n: "05",
    title: "Athletes who want structure",
    body: "For competitors who need a clear progression rather than combining random strength sessions, running workouts and MetCons without a plan.",
  },
];

const SESSIONS = [
  {
    n: "01",
    title: "Strict press + upper-body balance",
    body: "Build the competition 1RM while developing the upper-back and shoulder support required for strong legal pressing.",
  },
  {
    n: "02",
    title: "Run-row endurance",
    body: "Improve category-distance pacing, repeatability, transitions and total endurance output.",
  },
  {
    n: "03",
    title: "Back squat + lower-body support",
    body: "Build the legal 3RM while reinforcing depth, control, posterior-chain strength and single-leg capacity.",
  },
  {
    n: "04",
    title: "MetCon development",
    body: "Develop station capacity, competition standards, self-pacing and smooth transitions through rotating EMOM, AMRAP, interval and rehearsal formats.",
  },
  {
    n: "05",
    title: "Deadlift + integrated race work",
    body: "Build the competition 5RM and practise race movement under controlled fatigue.",
  },
  {
    n: "OPT",
    title: "Optional — Zone 2 + race skills",
    body: "Add low-fatigue aerobic volume, movement-standard practice and technical repetition without interfering with the five core sessions.",
  },
];

const RULES = [
  ["01", "No missed strength reps in normal training.", "Successful heavy work creates more useful practice with less unnecessary recovery cost."],
  ["02", "Control the opening pace.", "The target is the best total output — not winning the first 90 seconds and surviving the rest."],
  ["03", "Competition standards count in training.", "A faster no-rep is still a no-rep."],
  ["04", "Record what matters.", "Log the top strength set, important splits, category loads, station results and one honest sentence about how the session felt."],
] as const;

const WEEKS = [
  ["01", "Foundation", "Establish honest strength, endurance and movement baselines.", "Moderate"],
  ["02", "Build", "Increase useful volume without allowing strength work or movement standards to become sloppy.", "Moderate-high"],
  ["03", "Overload", "Introduce heavier strength work and complete the first sub-maximal 20-minute strength rehearsal.", "High"],
  ["04", "Deload", "Reduce fatigue, maintain the key movements and finish the week fresher than it began.", "Low"],
  ["05", "Specific build", "Increase exposure to competition loads, longer station efforts and more event-specific endurance.", "High"],
  ["06", "Peak specificity", "Complete the full 22-minute run-row rehearsal, a 70% MetCon rehearsal and the final timed strength sequence.", "High but controlled"],
  ["07", "Sharpen", "Keep speed, confidence and competition-load exposure while reducing total work.", "Moderate-low"],
  ["08", "Race week", "Taper, complete short primers, confirm equipment and strategy and arrive fresh enough to perform.", "Low"],
] as const;

const READINESS = [
  ["Ready", "Complete the session as written."],
  ["Average", "Use the lower end of the prescribed load or pace range and remove one accessory set where needed."],
  ["Heavy", "Reduce the main lift by approximately 5–7.5%, remove one back-off set and reduce conditioning volume by approximately 20%."],
  ["Pain changes movement", "Stop the painful exercise. Use a pain-free alternative or end the session."],
] as const;

const EQUIPMENT = [
  {
    tier: "Preferred equipment",
    items: [
      "Safe squat rack",
      "Barbell and suitable plates",
      "Bench or pressing area",
      "Running route or treadmill",
      "Rowing machine",
      "SkiErg",
      "Dumbbells for your category",
      "Competition-height box",
      "Sandbag or suitable carry implement",
      "Marked space for lunges and burpee broad jumps",
    ],
  },
  {
    tier: "Substitutions",
    items: [
      "SkiErg → rower or bike at similar duration",
      "Sandbag → heavy bear-hug, front carry or sled drag",
      "Box → lower height or controlled step overs",
      "Ground-to-overhead → lighter load, same pattern",
      "Walking lunges → reduced load, full extension",
    ],
  },
];

const RACE_TOOLS = [
  ["Strength attempt planner", "Set the safe opener, highly likely second attempt and earned final attempt for strict press, back squat and deadlift."],
  ["Endurance pacing plan", "Record the opening run pace, target row split, category distance, transition routine and final four-minute strategy."],
  ["MetCon station plan", "Set intended breaks, station targets, standards and contingency rules for every movement."],
  ["Pair split planning", "Pair athletes can record Athlete A and Athlete B responsibilities, planned handovers and contingency changes."],
  ["Equipment checklist", "Confirm shoes, belt, sleeves, wraps, chalk, travel and competition essentials before Race Day."],
  ["Food + hydration", "Prepare the planned pre-event meal, carbohydrate intake, fluids and between-zone recovery."],
  ["Race review", "Log competition attempts, total metres, station splits, finish time, penalties and the next performance priority."],
] as const;

const FEATURES = [
  ["Today", "See the current session, training phase, weekly schedule and readiness guidance."],
  ["Eight-week programme", "Access all core and optional sessions across the complete competition build."],
  ["Interactive session runner", "Follow each training block with instructions, rest periods, timers and coaching cues."],
  ["Result logging", "Record strength loads, interval splits, AMRAP scores, EMOM completion, station results and session notes."],
  ["Progress", "Track core completion, optional development, best strength results, endurance performance and MetCon execution."],
  ["Learn", "Understand training terms, movement standards, race loads, legal repetitions, pacing and competition rules."],
  ["Race Day", "Build the final strength, endurance and MetCon execution plan."],
  ["Load calculator", "Translate stored benchmarks into practical training percentages and suggested load references."],
  ["Category profile", "Select ATHX or Pro, sex, Individual or Pairs format, training mode and personal benchmarks."],
  ["Permanent PDF", "Keep the full programme, Race Day worksheets, educational guidance and tracking sheets for future reference."],
] as const;

const FAQ = [
  ["Is this an official ATHX programme?", "No. S.E.M. 2026 is produced independently by SEVEN3SEVEN. It is designed for athletes preparing for ATHX but is not produced, approved or endorsed by ATHX."],
  ["Is this for individuals or pairs?", "Both. The programme is completed as an individual because every athlete requires their own strength, engine and movement capacity. Pair competitors can then use the Race Day tools to plan how eligible work will be shared."],
  ["Does the programme support ATHX Pro?", "Yes. The athlete selects ATHX or Pro inside their profile. The app then displays the relevant run-row distance, dumbbell setup, sandbag load, box height and lunge position."],
  ["How many days per week do I train?", "The programme contains five core sessions each week. A sixth Zone 2 and movement-skills session is available but remains optional and does not reduce programme completion when skipped."],
  ["Do I need to be an experienced athlete?", "The programme is intended for intermediate or experienced athletes who can safely strict press, back squat and deadlift and can already run and row continuously."],
  ["Do I need all of the competition equipment?", "Access to competition-specific equipment provides the closest preparation, but the programme includes substitutions designed to preserve the movement pattern, work duration and intended training effect."],
  ["Why is there no Olympic lifting?", "Olympic lifting is not a scored ATHX event demand. The programme prioritises the competition lifts, running, rowing and exact MetCon movement patterns rather than replacing specific work with unrelated training."],
  ["Will this guarantee a better result?", "No programme can guarantee a competition outcome. S.E.M. 2026 provides structured preparation, but results still depend on training consistency, recovery, movement quality, current ability and Race Day execution."],
] as const;

// ─── Component ────────────────────────────────────────────────────────────

function SemProductPage() {
  const { user } = useAuth();
  const { items: entitled } = useEntitlements(user?.id);
  const owns = entitled.some((e) => e.slug === SLUG);
  const semStarted = useSemStarted();
  const navigate = useNavigate();
  const startEnrolment = useServerFn(ensureEnrolment);
  const cart = useCart();

  const [cartOpen, setCartOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [heroPassed, setHeroPassed] = useState(false);
  const [finalVisible, setFinalVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero-anchor");
    const finalEl = document.getElementById("final-purchase");
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target.id === "hero-anchor") setHeroPassed(!e.isIntersecting);
        if (e.target.id === "final-purchase") setFinalVisible(e.isIntersecting);
      }
    }, { threshold: 0 });
    if (hero) io.observe(hero);
    if (finalEl) io.observe(finalEl);
    return () => io.disconnect();
  }, []);

  const scrollToExplore = () => {
    document.getElementById("explore")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleStart = async () => {
    setStartError(null);
    setStarting(true);
    try {
      await startEnrolment({ data: { slug: SLUG } });
      if (!semStarted.started) semStore.markStarted();
      navigate({ to: "/my-programmes/sem-2026/today" });
    } catch (e: any) {
      setStartError(e?.message ?? "Could not start programme.");
    } finally {
      setStarting(false);
    }
  };

  const addToCart = () => {
    cart.addSem();
    setCartOpen(true);
  };

  const ownedLabel = owns
    ? semStarted.started
      ? "Continue programme"
      : "Start programme"
    : null;

  const PrimaryCta = ({ full = false }: { full?: boolean }) => {
    if (owns) {
      return (
        <button
          type="button"
          onClick={handleStart}
          disabled={starting}
          className={`inline-flex items-center justify-center gap-3 px-8 py-5 bg-signal text-bone font-display uppercase text-[12px] tracking-[0.28em] disabled:opacity-60 ${full ? "w-full" : ""}`}
        >
          {starting ? "Preparing…" : ownedLabel} <ArrowRight className="h-3.5 w-3.5" />
        </button>
      );
    }
    if (cart.hasSem) {
      return (
        <div className={`flex flex-col sm:flex-row items-stretch gap-3 ${full ? "w-full" : ""}`}>
          <span className="inline-flex items-center justify-center gap-3 px-8 py-5 bg-bone/10 text-bone font-display uppercase text-[12px] tracking-[0.28em] ring-1 ring-bone/30">
            <Check className="h-3.5 w-3.5 text-signal" /> In cart
          </span>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="inline-flex items-center justify-center gap-3 px-8 py-5 text-bone font-display uppercase text-[12px] tracking-[0.28em] ring-1 ring-bone/40 hover:ring-bone"
          >
            View cart <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={addToCart}
        className={`inline-flex items-center justify-center gap-3 px-8 py-5 bg-bone text-obsidian font-display uppercase text-[12px] tracking-[0.28em] hover:bg-signal hover:text-bone transition-colors ${full ? "w-full" : ""}`}
      >
        Add to cart <ArrowRight className="h-3.5 w-3.5" />
      </button>
    );
  };

  const showStickyBar = heroPassed && !finalVisible;

  return (
    <>
      {/* HERO */}
      <section className="relative">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 pt-6 lg:pt-8">
          <Link to="/programmes" className="eyebrow text-bone/80 hover:text-bone inline-flex items-center gap-2">
            <ArrowLeft className="h-3 w-3" /> All programmes
          </Link>
        </div>
        <div className="mt-6 lg:mt-8">
          <img
            src={semImg.url}
            alt="S.E.M. 2026"
            className="block w-full h-auto max-h-[72vh] object-cover select-none"
            draggable={false}
          />
        </div>

        <div id="hero-anchor" className="bg-background">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12 pt-16 md:pt-24 lg:pt-28 pb-16 md:pb-20 lg:pb-24 grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-8">
              <p className="eyebrow text-signal mb-6">Compete · ATHX preparation</p>
              <h1 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.88] text-[clamp(2.75rem,8vw,7rem)]">
                S.E.M.<br />2026
              </h1>
              <p className="font-display font-bold text-bone tracking-[-0.02em] leading-[1] text-[clamp(1.5rem,3vw,2.5rem)] mt-10 max-w-[22ch]">
                Strength.<br />Endurance.<br />MetCon.
              </p>
              <p className="font-display text-bone/85 text-lg md:text-xl mt-10 max-w-[40ch] leading-snug tracking-[-0.01em]">
                Strong enough to lift heavy.<br />
                Fit enough to keep moving.<br />
                <span className="text-bone">Prepared enough to do both when it counts.</span>
              </p>
              <p className="text-bone/80 text-base md:text-lg mt-10 max-w-[62ch] leading-relaxed">
                An eight-week competition-preparation programme built for athletes preparing for ATHX or ATHX Pro.
              </p>
              <p className="text-foreground-muted text-sm md:text-base mt-4 max-w-[62ch] leading-relaxed">
                Develop the three qualities that decide the result: competition-specific strength, repeatable run-row endurance and the ability to move efficiently through demanding MetCon work under fatigue.
              </p>
            </div>

            <div className="lg:col-span-4 lg:border-l lg:border-border/60 lg:pl-12 flex flex-col justify-between gap-10">
              <ul className="space-y-4">
                {[
                  "8 weeks",
                  "5 core sessions",
                  "1 optional development",
                  "ATHX + Pro options",
                  "Individual first · Pairs compatible",
                ].map((d) => (
                  <li key={d} className="flex items-start gap-3 border-b border-border/60 pb-3 font-display text-bone text-base tracking-[-0.01em]">
                    <span className="h-1 w-1 rounded-full bg-signal mt-2.5 shrink-0" />
                    <span className="uppercase text-[13px] tracking-[0.14em]">{d}</span>
                  </li>
                ))}
              </ul>

              <div>
                <div className="flex items-end flex-wrap gap-x-8 gap-y-4">
                  <div>
                    <p className="eyebrow text-bone/70 mb-2">Founding price</p>
                    <p className="font-display font-bold text-bone tabular leading-none text-[clamp(2.75rem,5vw,4rem)] tracking-[-0.04em]">£19.99</p>
                  </div>
                  <div>
                    <p className="eyebrow text-bone/55 mb-2">Standard</p>
                    <p className="font-display text-foreground-muted tabular leading-none text-[clamp(1.5rem,2.5vw,2rem)] tracking-[-0.03em]">£29.99</p>
                  </div>
                </div>
                <ul className="mt-8 space-y-2 text-foreground-muted text-sm">
                  <li>One payment.</li>
                  <li>Interactive programme access.</li>
                  <li>Permanent PDF included.</li>
                  <li>No monthly subscription.</li>
                </ul>
                <div className="mt-8 flex flex-col gap-3">
                  <PrimaryCta full />
                  <button
                    type="button"
                    onClick={scrollToExplore}
                    className="inline-flex items-center justify-center gap-2 text-bone/80 hover:text-bone font-display uppercase text-[11px] tracking-[0.28em] pt-2"
                  >
                    Explore the programme <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
                {startError && <p className="text-signal text-xs mt-4">{startError}</p>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FACT STRIP */}
      <section id="explore" className="border-t border-border/60">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-16 lg:py-20 grid md:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-12">
          {FACT_STRIP.map((f) => (
            <div key={f.label} className="lg:border-r lg:border-border/60 lg:last:border-r-0 lg:pr-10">
              <p className="eyebrow mb-4">{f.label}</p>
              <p className="font-display font-bold text-bone tracking-[-0.025em] text-3xl lg:text-4xl leading-[0.95]">{f.value}</p>
              <p className="text-foreground-muted text-sm mt-4 max-w-[36ch] leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 1 — Built for the actual competition */}
      <Section eyebrow="Built for the actual competition">
        <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[20ch]">
          Three zones. Three scoring opportunities. One complete performance.
        </h2>
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-6 mt-14 max-w-[82ch] text-bone/85 text-base md:text-lg leading-relaxed">
          <p>ATHX does not reward one type of fitness.</p>
          <p>The Strength zone demands legal heavy lifting under a strict clock.</p>
          <p>The Endurance zone rewards repeatable running and rowing without wasted transitions or early pace collapse.</p>
          <p>MetCon X tests movement standards, pacing, grip, efficiency and the ability to keep progressing when fatigue begins to accumulate.</p>
        </div>
        <p className="text-bone/80 text-base md:text-lg mt-8 max-w-[62ch] leading-relaxed">
          S.E.M. 2026 develops these qualities separately — then rehearses them together when it matters.
        </p>
        <FeatureStatement>
          Train every quality.<br />Rehearse the event.<br /><span className="text-signal">Perform when it counts.</span>
        </FeatureStatement>
      </Section>

      {/* SECTION 2 — Three pillars */}
      <Section eyebrow="The three pillars" tone="dark">
        <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[22ch]">
          Strength. Endurance. MetCon.
        </h2>
        <ul className="mt-14 divide-y divide-border/60">
          {PILLARS.map((p) => (
            <li key={p.n} className="grid md:grid-cols-12 gap-6 md:gap-10 py-10 md:py-14 group">
              <span className="md:col-span-1 eyebrow tabular text-signal">{p.n}</span>
              <div className="md:col-span-4">
                <h3 className="font-display font-bold text-bone text-3xl md:text-4xl tracking-[-0.025em] leading-[0.95] transition-transform duration-500 group-hover:-translate-y-0.5">
                  {p.title}
                </h3>
                <p className="font-display text-foreground-muted text-lg mt-4 max-w-[24ch] tracking-[-0.01em]">
                  {p.lead}
                </p>
              </div>
              <p className="md:col-span-7 text-bone/80 text-base md:text-lg leading-relaxed max-w-[62ch]">{p.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* SECTION 3 — Coaching decision */}
      <Section eyebrow="The coaching decision">
        <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[18ch]">
          Specific work wins.
        </h2>
        <div className="grid lg:grid-cols-12 gap-10 mt-12">
          <div className="lg:col-span-7 space-y-5 text-bone/85 text-base md:text-lg leading-relaxed max-w-[62ch]">
            <p>S.E.M. 2026 is not a bodybuilding split and it is not random functional-fitness punishment.</p>
            <p>The programme keeps the three competition lifts as weekly priorities. Running and rowing receive dedicated quality work. MetCon sessions progressively expose the exact movement patterns, standards and category demands required on competition day.</p>
            <p>Olympic lifting is not programmed because it is not a scored event demand and would replace more specific work.</p>
          </div>
          <div className="lg:col-span-5">
            <p className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(1.75rem,3.5vw,2.75rem)]">
              No filler. No random workouts. Every session earns its place.
            </p>
          </div>
        </div>
      </Section>

      {/* SECTION 4 — Who it is for */}
      <Section eyebrow="Who it is for" tone="dark">
        <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[20ch]">
          Built for athletes who want to arrive prepared.
        </h2>
        <ul className="mt-14 grid md:grid-cols-2 gap-x-10 gap-y-10">
          {AUDIENCE.map((a) => (
            <li key={a.n} className="border-t border-border/60 pt-6">
              <p className="eyebrow tabular text-foreground-muted mb-4">{a.n}</p>
              <h3 className="font-display font-bold text-bone text-2xl tracking-[-0.02em] leading-tight">{a.title}</h3>
              <p className="text-foreground-muted text-sm mt-4 leading-relaxed max-w-[48ch]">{a.body}</p>
            </li>
          ))}
        </ul>
        <p className="text-foreground-muted text-sm md:text-base mt-12 max-w-[68ch] leading-relaxed">
          This is not a beginner introduction to lifting. Athletes should already understand the basic movements or have access to suitable coaching support.
        </p>
      </Section>

      {/* SECTION 5 — Individual first */}
      <Section eyebrow="Individual first">
        <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[18ch]">
          Your fitness cannot be shared.
        </h2>
        <div className="grid lg:grid-cols-12 gap-10 mt-12">
          <div className="lg:col-span-7 space-y-5 text-bone/85 text-base md:text-lg leading-relaxed max-w-[62ch]">
            <p>Every athlete completes S.E.M. 2026 as an individual.</p>
            <p>Pair competitors may share eligible work on race day — but each athlete still needs their own strength, engine, movement quality and ability to recover under fatigue.</p>
            <p>The training plan therefore remains athlete-led. Pair-specific handovers, station splits and contingency planning sit inside the Race Day tools rather than weakening the daily programme.</p>
          </div>
          <div className="lg:col-span-5">
            <p className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(1.75rem,3.5vw,2.75rem)]">
              Build two capable athletes. Then decide how to share the work.
            </p>
          </div>
        </div>
      </Section>

      {/* SECTION 6 — Weekly system */}
      <Section eyebrow="The weekly system" tone="dark">
        <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[18ch]">
          Five core sessions. One optional opportunity.
        </h2>
        <ul className="mt-14 divide-y divide-border/60">
          {SESSIONS.map((s) => (
            <li key={s.n} className="grid md:grid-cols-12 gap-6 md:gap-10 py-7">
              <span className={`md:col-span-1 eyebrow tabular ${s.n === "OPT" ? "text-signal" : "text-foreground-muted"}`}>{s.n}</span>
              <h3 className="md:col-span-5 font-display font-bold text-bone text-xl md:text-2xl tracking-[-0.02em] leading-snug">{s.title}</h3>
              <p className="md:col-span-6 text-bone/75 text-base leading-relaxed max-w-[60ch]">{s.body}</p>
            </li>
          ))}
        </ul>
        <div className="mt-14 space-y-1 font-display text-bone text-lg tracking-[-0.01em] max-w-[68ch]">
          <p>Complete the five core sessions and the programme records full completion.</p>
          <p className="text-foreground-muted">The optional session develops additional capacity — but missing it does not reduce the athlete's completion percentage.</p>
        </div>
      </Section>

      {/* SECTION 7 — Training rules */}
      <Section eyebrow="The training rules">
        <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[18ch]">
          Quality before ego.
        </h2>
        <ul className="mt-14 divide-y divide-border/60">
          {RULES.map(([n, title, body]) => (
            <li key={n} className="grid md:grid-cols-12 gap-6 md:gap-10 py-8">
              <span className="md:col-span-1 eyebrow tabular text-signal">{n}</span>
              <h3 className="md:col-span-5 font-display font-bold text-bone text-xl md:text-2xl tracking-[-0.02em] leading-snug">{title}</h3>
              <p className="md:col-span-6 text-bone/75 text-base leading-relaxed max-w-[60ch]">{body}</p>
            </li>
          ))}
        </ul>
        <FeatureStatement>
          Legal reps.<br />Repeatable output.<br /><span className="text-signal">Honest data.</span>
        </FeatureStatement>
      </Section>

      {/* SECTION 8 — 8-week build */}
      <Section eyebrow="The eight-week build" tone="dark">
        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <h2 className="lg:col-span-7 font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[18ch]">
            Specificity rises. Fatigue falls. Performance arrives on time.
          </h2>
        </div>

        {/* Desktop horizontal timeline */}
        <div className="hidden lg:block mt-16">
          <div className="relative">
            <div className="h-px bg-border/60 w-full absolute top-4 left-0" />
            <div className="grid grid-cols-8 gap-4 relative">
              {WEEKS.map(([n, title, body, load]) => (
                <div key={n} className="flex flex-col">
                  <span className="h-2 w-2 rounded-full bg-signal mt-3 mb-6" />
                  <span className="eyebrow tabular text-foreground-muted mb-3">Wk {n}</span>
                  <p className="font-display font-bold text-bone text-lg tracking-[-0.02em] leading-tight mb-3">{title}</p>
                  <p className="text-foreground-muted text-[13px] leading-relaxed mb-4">{body}</p>
                  <p className="eyebrow text-bone/60">Load · <span className="text-bone">{load}</span></p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile vertical timeline */}
        <ol className="lg:hidden mt-12 border-l border-border/60 pl-6 space-y-8">
          {WEEKS.map(([n, title, body, load]) => (
            <li key={n} className="relative">
              <span className="absolute -left-[29px] top-1.5 h-2 w-2 rounded-full bg-signal" />
              <p className="eyebrow tabular text-foreground-muted mb-2">Week {n}</p>
              <p className="font-display font-bold text-bone text-xl tracking-[-0.02em]">{title}</p>
              <p className="text-foreground-muted text-sm mt-2 leading-relaxed max-w-[42ch]">{body}</p>
              <p className="eyebrow text-bone/60 mt-3">Load · <span className="text-bone">{load}</span></p>
            </li>
          ))}
        </ol>

        <div className="mt-16 grid md:grid-cols-2 gap-x-16 gap-y-3 max-w-[82ch] text-bone/80 text-base leading-relaxed">
          <p>Week 1 creates the starting point.</p>
          <p>Week 3 introduces the competition clock.</p>
          <p>Week 4 absorbs the opening build.</p>
          <p>Week 6 provides the information required for the final race strategy.</p>
          <p>Week 7 removes unnecessary fatigue.</p>
          <p>Week 8 is about execution — not proving fitness in training.</p>
        </div>
      </Section>

      {/* SECTION 9 — ATHX + Pro */}
      <Section eyebrow="ATHX + Pro">
        <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[22ch]">
          One programme. The correct category prescription.
        </h2>
        <p className="text-bone/80 text-base md:text-lg mt-8 max-w-[64ch] leading-relaxed">
          The programme supports ATHX and ATHX Pro athletes across male and female categories. The athlete selects their category and sex inside their programme profile. The app then displays the appropriate race references inside training sessions, Race Day tools and calculators.
        </p>
        <div className="mt-14 grid md:grid-cols-2 gap-10">
          <div className="border-t border-border/60 pt-6">
            <p className="eyebrow mb-4">ATHX profile</p>
            <p className="text-bone/85 text-base leading-relaxed max-w-[48ch]">
              Uses the ATHX run-row distance, alternating single-dumbbell ground-to-overhead pattern, ATHX sandbag load, category box height and suitcase-lunge position.
            </p>
          </div>
          <div className="border-t border-border/60 pt-6">
            <p className="eyebrow mb-4">Pro profile</p>
            <p className="text-bone/85 text-base leading-relaxed max-w-[48ch]">
              Uses the Pro run-row distance, dual-dumbbell ground-to-overhead pattern, heavier Pro sandbag, higher category box and front-rack lunge position.
            </p>
          </div>
        </div>
        <p className="text-foreground-muted text-sm md:text-base mt-10 max-w-[68ch] leading-relaxed">
          The programme structure does not change. The category prescription does. Training loads are progressed gradually rather than demanding full competition load from the opening week.
        </p>
        <FeatureStatement>
          Train the movement.<br />Build the load.<br /><span className="text-signal">Own the standard.</span>
        </FeatureStatement>
      </Section>

      {/* SECTION 10 — Strength that scores */}
      <Section eyebrow="Strength that scores" tone="dark">
        <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[22ch]">
          Heavy is useless if it does not count.
        </h2>
        <div className="grid lg:grid-cols-12 gap-10 mt-12">
          <div className="lg:col-span-7 space-y-5 text-bone/85 text-base md:text-lg leading-relaxed max-w-[62ch]">
            <p>The Strength zone rewards the best legal successful result across the strict press, back squat and deadlift.</p>
            <p>S.E.M. 2026 develops each lift weekly and gradually shifts from controlled volume towards heavier competition-specific work. The programme also rehearses the full sequence under the clock so the athlete can practise:</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8 mt-4 text-bone/80 text-base">
              {[
                "Rack and equipment setup",
                "Warm-up timing",
                "Opening attempts",
                "Likely second attempts",
                "Earned final attempts",
                "Plate changes",
                "Legal movement standards",
                "Managing fatigue between lifts",
              ].map((it) => (
                <li key={it} className="flex items-start gap-3">
                  <span className="h-1 w-1 rounded-full bg-signal mt-2.5 shrink-0" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-5 space-y-8">
            <p className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(1.75rem,3.5vw,2.75rem)]">
              Put a score on the board. Then earn the right to add more.
            </p>
            <p className="text-foreground-muted text-sm leading-relaxed max-w-[42ch]">
              The final attempt is not chosen by emotion. It is earned by the speed, position and quality of the attempt before it.
            </p>
          </div>
        </div>
      </Section>

      {/* SECTION 11 — Endurance that holds */}
      <Section eyebrow="Endurance that holds">
        <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[22ch]">
          The first round should not be your best round.
        </h2>
        <div className="grid lg:grid-cols-12 gap-10 mt-12">
          <div className="lg:col-span-7 space-y-5 text-bone/85 text-base md:text-lg leading-relaxed max-w-[62ch]">
            <p>The endurance work develops more than general cardio.</p>
            <p>Running and rowing are trained through repeatable category-distance work, 500-metre row intervals, kilometre run repeats, threshold efforts and full event rehearsals.</p>
            <p>The programme tracks:</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8 mt-2 text-bone/80 text-base">
              {[
                "Run splits",
                "Row splits",
                "Transition time",
                "Total distance",
                "Fastest-to-slowest drop-off",
                "Settling after modality change",
                "Final-round performance",
              ].map((it) => (
                <li key={it} className="flex items-start gap-3">
                  <span className="h-1 w-1 rounded-full bg-signal mt-2.5 shrink-0" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-5">
            <p className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(1.75rem,3.5vw,2.75rem)]">
              Control the start. Protect the middle. Finish with intent.
            </p>
          </div>
        </div>
      </Section>

      {/* SECTION 12 — MetCon that moves */}
      <Section eyebrow="MetCon that moves" tone="dark">
        <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[20ch]">
          Pace it. Move cleanly. Keep advancing.
        </h2>
        <div className="grid lg:grid-cols-12 gap-10 mt-12">
          <div className="lg:col-span-7 space-y-4 text-bone/85 text-base md:text-lg leading-relaxed max-w-[62ch]">
            <p>MetCon performance is not built by redlining every conditioning session. The programme rotates training formats to develop different qualities.</p>
            <p><span className="text-bone">EMOM</span> sessions build repeatability and enough remaining rest to protect standards.</p>
            <p><span className="text-bone">AMRAP</span> sessions develop self-pacing and continuous work.</p>
            <p><span className="text-bone">Rounds for time</span> develop execution and transition speed.</p>
            <p><span className="text-bone">Intervals</span> develop station output.</p>
            <p><span className="text-bone">Rehearsals</span> combine the official movement order, category demands and planned race strategy.</p>
          </div>
          <div className="lg:col-span-5">
            <p className="eyebrow mb-6">Movements developed</p>
            <ul className="space-y-3">
              {["SkiErg", "Ground to overhead", "Sandbag carry", "Box jump over", "Walking lunge", "Burpee broad jump"].map((m) => (
                <li key={m} className="flex items-start gap-3 font-display text-bone text-lg tracking-[-0.01em] border-b border-border/60 pb-3">
                  <Check className="h-4 w-4 text-signal mt-1.5 shrink-0" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <FeatureStatement>
          The best pace is the fastest pace <span className="text-signal">you can keep.</span>
        </FeatureStatement>
      </Section>

      {/* SECTION 13 — Readiness */}
      <Section eyebrow="Readiness">
        <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[18ch]">
          Adjust the stress. Keep the plan.
        </h2>
        <p className="text-bone/80 text-base md:text-lg mt-8 max-w-[64ch] leading-relaxed">
          The programme does not pretend an app can diagnose recovery. Instead, it provides clear coach-written adjustments based on how the athlete feels before the session.
        </p>
        <ul className="mt-14 divide-y divide-border/60">
          {READINESS.map(([title, body]) => (
            <li key={title} className="grid md:grid-cols-12 gap-6 md:gap-10 py-7">
              <h3 className="md:col-span-4 font-display font-bold text-bone text-xl md:text-2xl tracking-[-0.02em]">{title}</h3>
              <p className="md:col-span-8 text-bone/75 text-base leading-relaxed max-w-[62ch]">{body}</p>
            </li>
          ))}
        </ul>
        <FeatureStatement>
          Adapt the day. <span className="text-foreground-muted">Do not randomly rewrite the programme.</span>
        </FeatureStatement>
      </Section>

      {/* SECTION 14 — Equipment */}
      <Section eyebrow="Equipment + substitutions" tone="dark">
        <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[18ch]">
          Train the purpose. Not just the tool.
        </h2>
        <div className="mt-14 grid md:grid-cols-2 gap-10">
          {EQUIPMENT.map((e) => (
            <div key={e.tier} className="border-t border-border/60 pt-6">
              <p className="eyebrow mb-6">{e.tier}</p>
              <ul className="space-y-3">
                {e.items.map((it) => (
                  <li key={it} className="flex items-start gap-3 font-display text-bone text-base tracking-[-0.01em]">
                    <Check className="h-3.5 w-3.5 text-signal mt-1.5 shrink-0" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <FeatureStatement>
          Scale before technique fails.
        </FeatureStatement>
        <p className="text-foreground-muted text-sm mt-6 max-w-[68ch]">
          A safer legal repetition is more useful than rehearsing bad movement at a load the athlete cannot control.
        </p>
      </Section>

      {/* SECTION 15 — Race Day tools */}
      <Section eyebrow="Race Day tools">
        <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[22ch]">
          Make the decisions before adrenaline arrives.
        </h2>
        <ul className="mt-14 divide-y divide-border/60">
          {RACE_TOOLS.map(([title, body], i) => (
            <li key={title} className="grid md:grid-cols-12 gap-6 md:gap-10 py-6">
              <span className="md:col-span-1 eyebrow tabular text-foreground-muted">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="md:col-span-4 font-display font-bold text-bone text-xl md:text-2xl tracking-[-0.02em]">{title}</h3>
              <p className="md:col-span-7 text-bone/75 text-base leading-relaxed max-w-[60ch]">{body}</p>
            </li>
          ))}
        </ul>
        <FeatureStatement>
          The plan is made <span className="text-signal">before the pressure arrives.</span>
        </FeatureStatement>
      </Section>

      {/* SECTION 16 — Features */}
      <Section eyebrow="More than a PDF" tone="dark">
        <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[18ch]">
          The complete competition system.
        </h2>
        <ul className="mt-14 divide-y divide-border/60">
          {FEATURES.map(([title, body], i) => (
            <li key={title} className="grid md:grid-cols-12 gap-6 md:gap-10 py-6">
              <span className="md:col-span-1 eyebrow tabular text-foreground-muted">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="md:col-span-4 font-display font-bold text-bone text-xl md:text-2xl tracking-[-0.02em]">{title}</h3>
              <p className="md:col-span-7 text-bone/75 text-base leading-relaxed max-w-[60ch]">{body}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* SECTION 17 — Progress */}
      <Section eyebrow="Progress that means something">
        <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[18ch]">
          No invented fitness score.
        </h2>
        <p className="text-bone/80 text-base md:text-lg mt-8 max-w-[64ch] leading-relaxed">
          S.E.M. 2026 does not reduce performance to a meaningless universal percentage. Progress comes directly from the results the athlete logs.
        </p>
        <div className="mt-14 grid md:grid-cols-3 gap-10">
          {[
            {
              t: "Strength",
              items: ["Best strict-press single", "Best back-squat triple", "Best deadlift five", "Full strength-sequence total"],
            },
            {
              t: "Endurance",
              items: ["Run and row splits", "Total metres", "Transition time", "Fastest-to-slowest drop-off"],
            },
            {
              t: "MetCon",
              items: ["Station splits", "Category loads", "Break strategy", "Penalties", "Completion time"],
            },
          ].map((g) => (
            <div key={g.t} className="border-t border-border/60 pt-6">
              <p className="eyebrow mb-6">{g.t}</p>
              <ul className="space-y-3">
                {g.items.map((it) => (
                  <li key={it} className="flex items-start gap-3 font-display text-bone text-base tracking-[-0.01em]">
                    <span className="h-1 w-1 rounded-full bg-signal mt-2.5 shrink-0" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 grid md:grid-cols-2 gap-x-16 gap-y-3 max-w-[80ch] text-bone/80 text-base leading-relaxed">
          <p>Core sessions and optional sessions are tracked separately.</p>
          <p>Five core sessions completed means the week is complete.</p>
          <p className="text-foreground-muted md:col-span-2">The optional session remains additional development — not a punishment against the completion score.</p>
        </div>
        <FeatureStatement>
          Measure the work.<br />Learn from the result.<br /><span className="text-signal">Change what matters.</span>
        </FeatureStatement>
      </Section>

      {/* SECTION 18 — Independent programme */}
      <Section eyebrow="Independent programme" tone="dark">
        <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[18ch]">
          No affiliation. No false certainty.
        </h2>
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-5 mt-12 max-w-[82ch] text-bone/80 text-base md:text-lg leading-relaxed">
          <p>S.E.M. 2026 is an independent competition-preparation programme produced by SEVEN3SEVEN.</p>
          <p>It is designed for athletes preparing for ATHX but is not produced, approved or endorsed by ATHX.</p>
          <p>Competition workouts, movement standards, category requirements and timetables may change. Athletes must always confirm the organiser's latest published information before competition.</p>
          <p className="text-foreground-muted">The programme provides educational training guidance and does not replace medical diagnosis, injury rehabilitation or qualified individual coaching. Stop any exercise that causes sharp pain, dizziness, chest pain or unusual shortness of breath and seek appropriate support.</p>
        </div>
      </Section>

      {/* FINAL PURCHASE */}
      <section id="final-purchase" className="border-t border-border/60 panel-dark">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-24 lg:py-32 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow text-signal mb-6">S.E.M. 2026</p>
            <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.5rem,6vw,5rem)] max-w-[16ch]">
              Strength. Endurance. MetCon.
            </h2>
            <p className="font-display font-bold text-bone/80 tracking-[-0.025em] leading-[1] text-[clamp(1.5rem,3vw,2.25rem)] mt-6 max-w-[24ch]">
              Prepared enough to do all three when it counts.
            </p>
            <div className="mt-10 grid md:grid-cols-2 gap-x-10 gap-y-3 max-w-[62ch] text-bone/85 text-base md:text-lg leading-relaxed">
              <p>Eight weeks.</p>
              <p>Five core training days.</p>
              <p>One optional development opportunity.</p>
              <p>A complete competition-preparation system for building the strength, engine, movement capacity and Race Day strategy required to perform.</p>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="flex items-end flex-wrap gap-x-10 gap-y-6">
              <div>
                <p className="eyebrow text-bone/70 mb-3">Founding price</p>
                <p className="font-display font-bold text-bone tabular leading-none text-[clamp(3rem,6vw,5rem)] tracking-[-0.04em]">£19.99</p>
              </div>
              <div>
                <p className="eyebrow text-bone/55 mb-3">Standard</p>
                <p className="font-display text-foreground-muted tabular leading-none text-[clamp(1.75rem,3vw,2.5rem)] tracking-[-0.03em]">£29.99</p>
              </div>
            </div>
            <ul className="mt-8 space-y-2 text-foreground-muted text-sm">
              <li>One payment.</li>
              <li>Interactive programme access.</li>
              <li>Permanent PDF included.</li>
              <li>No monthly subscription.</li>
            </ul>
            <div className="mt-10">
              <PrimaryCta full />
              {startError && <p className="text-signal text-xs mt-4">{startError}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <Section eyebrow="Questions">
        <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[16ch]">
          Common questions.
        </h2>
        <div className="mt-12 max-w-[80ch]">
          <Accordion type="single" collapsible className="w-full">
            {FAQ.map(([q, a], i) => (
              <AccordionItem key={q} value={`q-${i}`} className="border-border/60">
                <AccordionTrigger className="font-display font-bold text-bone text-lg md:text-xl tracking-[-0.02em] py-6 text-left">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="text-bone/75 text-base leading-relaxed pb-6 max-w-[68ch]">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>

      {/* STICKY PURCHASE BAR */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 transition-transform duration-500 ${
          showStickyBar ? "translate-y-0" : "translate-y-full"
        }`}
        aria-hidden={!showStickyBar}
      >
        <div className="bg-obsidian/95 backdrop-blur border-t border-border/60">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-3 sm:py-4 flex items-center justify-between gap-4">
            <div className="min-w-0 flex items-baseline gap-4 sm:gap-6">
              <p className="font-display font-bold text-bone tracking-[-0.01em] text-sm sm:text-base">
                <span className="hidden sm:inline">S.E.M. 2026</span>
                <span className="sm:hidden">S.E.M.</span>
              </p>
              <p className="hidden md:block eyebrow text-foreground-muted">8 weeks · 5 core + 1 optional</p>
              <p className="font-display font-bold text-bone tabular text-sm sm:text-base">£19.99</p>
            </div>
            {owns ? (
              <button
                type="button"
                onClick={handleStart}
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-3 bg-signal text-bone font-display uppercase text-[10px] sm:text-[11px] tracking-[0.24em] whitespace-nowrap"
              >
                {ownedLabel} <ArrowRight className="h-3 w-3" />
              </button>
            ) : cart.hasSem ? (
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-3 ring-1 ring-bone/40 text-bone font-display uppercase text-[10px] sm:text-[11px] tracking-[0.24em] whitespace-nowrap"
              >
                View cart
              </button>
            ) : (
              <button
                type="button"
                onClick={addToCart}
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-3 bg-bone text-obsidian font-display uppercase text-[10px] sm:text-[11px] tracking-[0.24em] whitespace-nowrap"
              >
                Add to cart
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CART DRAWER */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent side="right" className="bg-obsidian border-l border-border/60 text-bone w-full sm:max-w-md flex flex-col">
          <SheetHeader className="text-left">
            <p className="eyebrow text-signal">Your cart</p>
            <SheetTitle className="font-display font-bold text-bone text-3xl tracking-[-0.025em]">
              Cart
            </SheetTitle>
            <SheetDescription className="text-foreground-muted text-sm">
              One payment. Permanent access. No subscription.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-8 border-t border-border/60 pt-6 flex-1 overflow-y-auto">
            {cart.hasSem ? (
              <div className="flex items-start gap-4">
                <img src={semImg.url} alt="" className="h-24 w-20 object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="eyebrow text-foreground-muted mb-2">Compete</p>
                  <p className="font-display font-bold text-bone text-lg tracking-[-0.02em]">S.E.M. 2026</p>
                  <p className="text-foreground-muted text-xs mt-1">8-week interactive competition programme</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-display text-bone tabular text-xl">£19.99</span>
                    <button
                      type="button"
                      onClick={cart.removeSem}
                      className="text-foreground-muted hover:text-signal p-1"
                      aria-label="Remove from cart"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-foreground-muted text-sm">Your cart is empty.</p>
            )}
          </div>

          <div className="border-t border-border/60 pt-6 mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="eyebrow">Total</span>
              <span className="font-display text-bone tabular text-2xl">£{cart.hasSem ? "19.99" : "0.00"}</span>
            </div>
            {cart.hasSem ? (
              <Link
                to="/cart"
                onClick={() => setCartOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-bone text-obsidian hover:bg-white font-display uppercase text-[12px] tracking-[0.28em]"
              >
                Checkout
              </Link>
            ) : (
              <span className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-bone/10 text-bone/60 font-display uppercase text-[12px] tracking-[0.28em]">
                Checkout
              </span>
            )}
            <p className="text-foreground-muted text-xs leading-relaxed">
              Secure payment by Stripe. Add promotion codes at checkout.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function Section({
  eyebrow,
  children,
  tone,
}: {
  eyebrow: string;
  children: ReactNode;
  tone?: "dark";
}) {
  return (
    <section className={`border-t border-border/60 ${tone === "dark" ? "panel-dark" : ""}`}>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-20 lg:py-28">
        <p className="eyebrow mb-8">{eyebrow}</p>
        {children}
      </div>
    </section>
  );
}

function FeatureStatement({ children }: { children: ReactNode }) {
  return (
    <p className="mt-16 font-display font-bold text-bone tracking-[-0.03em] leading-[0.95] text-[clamp(1.75rem,4vw,3.25rem)] max-w-[26ch]">
      {children}
    </p>
  );
}