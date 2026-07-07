import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, X } from "lucide-react";
import basicImg from "@/assets/programme-basic-training.jpg.asset.json";
import { useAuth } from "@/lib/useAuth";
import { useEntitlements } from "@/lib/useEntitlements";
import { useBtbStarted, btbStore } from "@/lib/btb/store";
import { ensureEnrolment } from "@/lib/enrolment.functions";
import { cart as cartApi, useCart } from "@/lib/cart";
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

const SITE = "https://737trg.com";
const SLUG = "basic-training-blueprint-plus";
const TITLE = "Basic Training Blueprint+ | Army Prep | SEVEN3SEVEN";
const DESC =
  "A 12-week Army fitness programme for candidates preparing for Army assessment and Basic Training. Running, strength and loaded conditioning by SEVEN3SEVEN.";
const ABS_IMG = `${SITE}${basicImg.url}`;

export const Route = createFileRoute("/_marketing/programmes/basic-training-blueprint-plus")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/programmes/${SLUG}` },
      { property: "og:image", content: ABS_IMG },
      { name: "twitter:image", content: ABS_IMG },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE}/programmes/${SLUG}` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Basic Training Blueprint+",
          description: DESC,
          image: [ABS_IMG],
          brand: { "@type": "Brand", name: "SEVEN3SEVEN" },
          sku: "s37-btb-plus",
          category: "Fitness training programme",
          offers: {
            "@type": "Offer",
            url: `${SITE}/programmes/${SLUG}`,
            priceCurrency: "GBP",
            price: "19.99",
            availability: "https://schema.org/InStock",
            seller: { "@type": "Organization", name: "SEVEN3SEVEN" },
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map(([q, a]) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }),
      },
    ],
  }),
  component: BtbProductPage,
});

function useBtbCart() {
  const state = useCart();
  return {
    hasBtb: !!state.hasBtb,
    addBtb: () => cartApi.add("basic-training-blueprint-plus"),
    removeBtb: () => cartApi.remove("basic-training-blueprint-plus"),
  };
}

const FACT_STRIP = [
  {
    label: "Duration",
    value: "12 weeks",
    body: "A progressive build with planned recovery weeks and a final taper.",
  },
  {
    label: "Frequency",
    value: "5 sessions",
    body: "Completed in order across each seven-day period — not tied to fixed weekdays.",
  },
  {
    label: "Prescription",
    value: "RPE-led",
    body: "Loads and running paces scale to the individual's current ability.",
  },
  {
    label: "Delivery",
    value: "App + PDF",
    body: "Interactive training, result logging, progress tracking and a permanent downloadable programme.",
  },
];

const ASSESSMENT_ITEMS = [
  {
    n: "01",
    title: "Mid-thigh pull",
    body: "Develop maximal lower-body force and posterior-chain strength. Progressive deadlift work builds the strength behind the assessment, while safe isometric-pull preparation is included where suitable equipment is available.",
  },
  {
    n: "02",
    title: "Seated medicine-ball throw",
    body: "Develop explosive upper-body power, throwing technique and the pressing and pulling strength that supports a stronger result.",
  },
  {
    n: "03",
    title: "2 km run",
    body: "Develop aerobic fitness, running durability, threshold capacity, pacing control and the speed required to produce your strongest sustainable performance.",
  },
];

const SESSIONS = [
  {
    n: "01",
    title: "Lower-body strength + mid-thigh pull preparation",
    body: "Build force, posterior-chain strength, leg capacity and carrying ability.",
  },
  {
    n: "02",
    title: "Aerobic development",
    body: "Build base fitness, recovery capacity and running durability without turning every run into a test.",
  },
  {
    n: "03",
    title: "Upper-body strength + medicine-ball power",
    body: "Improve throwing performance while developing balanced pushing and pulling strength.",
  },
  {
    n: "04",
    title: "2 km performance running",
    body: "Develop running speed, threshold capacity and assessment-specific pacing.",
  },
  {
    n: "05",
    title: "Military work capacity",
    body: "Develop carries, step-ups, bodyweight strength, grip and controlled exposure to load carriage.",
  },
];

const WEEKS = [
  ["01", "Baseline", "Establish honest starting data and movement quality."],
  ["02", "Consistency", "Build useful training volume without overreaching."],
  ["03", "Foundation build", "Extend aerobic work and introduce the first controlled loaded walk."],
  ["04", "Deload", "Reduce fatigue and absorb the opening training block."],
  ["05", "Strength + threshold", "Develop higher force and sustained running performance."],
  ["06", "Repeatability", "Increase the total amount of high-quality work completed."],
  ["07", "Overload", "Complete the highest broad workload of the programme."],
  ["08", "Midpoint", "Retest strength, running and throwing performance before updating training targets."],
  ["09", "Performance build", "Develop greater force and running speed reserve."],
  ["10", "Peak capacity", "Complete the hardest assessment-specific week of the programme."],
  ["11", "Sharpen", "Rehearse the assessment demands while reducing total training volume."],
  ["12", "Taper + test", "Reduce fatigue and express the fitness built."],
] as const;

const AUDIENCE = [
  {
    n: "01",
    title: "Regular and Reserve soldier applicants",
    body: "Preparing for Assessment Centre and the physical demands that follow.",
  },
  {
    n: "02",
    title: "Beginners who need structure",
    body: "A clear progression from current ability rather than being thrown into excessive running, heavy lifting or loaded movement too early.",
  },
  {
    n: "03",
    title: "Fitter applicants who want a performance buffer",
    body: "For candidates who already meet the published requirement but do not want to arrive with nothing left in reserve.",
  },
  {
    n: "04",
    title: "Gym and limited-equipment users",
    body: "Follow the preferred gym-based plan or use the included practical substitutions when full equipment is unavailable.",
  },
];

const EQUIPMENT = [
  {
    tier: "Essential",
    items: ["Running shoes", "A measured flat route or running track", "Stopwatch or phone", "Secure backpack", "Training log"],
  },
  {
    tier: "Strongly recommended",
    items: ["4 kg medicine ball", "Tape measure and wall", "Gym access", "Dumbbells or kettlebells", "Pull-up bar"],
  },
  {
    tier: "Ideal",
    items: [
      "Trap bar or barbell",
      "Secure rack with safety pins",
      "Bench",
      "Cable machine",
      "Steps or boxes",
      "Genuine Mid-Thigh Pull dynamometer access",
    ],
  },
];

const FEATURES = [
  ["Today", "See the current session, programme week, training focus and readiness guidance."],
  ["12-week programme", "Access all 60 ordered training sessions."],
  ["Interactive session runner", "Follow each training block with clear instructions, timers, rest periods and coaching notes."],
  ["Result logging", "Record strength loads, running splits, medicine-ball results, RPE and session feedback."],
  ["Progress tracking", "Monitor assessment performance, strength development, running progress and weekly consistency."],
  ["Learn", "Understand RPE, running intensity, assessment technique, loaded walking, recovery, foot care and programme terminology."],
  ["Assessment tools", "Store the official role requirement, current result, personal best and next performance target separately."],
  ["2 km pace calculator", "Turn the current 2 km result into practical 200 m, 400 m, 800 m and 1 km pacing references."],
  ["Readiness adjustments", "Manage poor sleep, heavy legs and reduced training availability without randomly replacing the programme."],
  ["Permanent PDF", "Keep the complete downloadable programme and supporting worksheets for future reference."],
] as const;

const READINESS_STAGES = [
  ["01", "Building", "Training consistently and developing the base. Some role standards may not yet be met."],
  ["02", "Assessment ready", "Currently meets the chosen role's published fitness requirements."],
  [
    "03",
    "Training ready",
    "Meets the role requirement with a meaningful performance buffer and completes the programme without recurring pain changing movement.",
  ],
  ["04", "Leading standard", "Continues progressing beyond the minimum across running, strength, power and work capacity."],
] as const;

const FAQ = [
  ["Is this an official British Army programme?", "No. Basic Training Blueprint+ is produced independently by SEVEN3SEVEN and is not produced, approved or endorsed by the British Army or the Ministry of Defence."],
  ["Is this only for people who are currently unfit?", "No. The programme uses RPE, current performance and repeatable progression so it can challenge beginners who need structure and fitter candidates who want to build a larger performance buffer."],
  ["Do I need a full gym?", "Full gym access provides the preferred setup, but the programme includes practical limited-equipment substitutions for the main strength, bodyweight, carrying and conditioning movements."],
  ["Are the five sessions tied to specific weekdays?", "No. The sessions are completed in order across each seven-day period. Rest days can be arranged around work, recovery and personal commitments."],
  ["Does the programme include loaded running?", "No. Loaded work is introduced through controlled walking only. The programme does not prescribe running with a loaded backpack."],
  ["Does this guarantee that I will pass assessment?", "No programme can guarantee entry or assessment success. Basic Training Blueprint+ provides structured physical preparation, but the result still depends on training consistency, recovery, individual ability and the current requirements of the chosen role."],
  ["Is this suitable for officer candidates?", "This version is built around the soldier assessment pathway. Officer candidates currently complete a different running-specific assessment and may require a separate preparation pathway."],
] as const;

function BtbProductPage() {
  const { user } = useAuth();
  const { items: entitled } = useEntitlements(user?.id);
  const owns = entitled.some((e) => e.slug === SLUG);
  const btbStarted = useBtbStarted();
  const navigate = useNavigate();
  const startEnrolment = useServerFn(ensureEnrolment);
  const cart = useBtbCart();

  useEffect(() => {
    btbStore.configureUser(user?.id ?? null);
  }, [user?.id]);

  const [cartOpen, setCartOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const scrollToExplore = () => {
    const el = document.getElementById("explore");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleStart = async () => {
    setStartError(null);
    setStarting(true);
    try {
      await startEnrolment({ data: { slug: SLUG } });
      if (!btbStarted.started) btbStore.markStarted();
      navigate({ to: "/my-programmes/basic-training-blueprint-plus/today" });
    } catch (e: any) {
      setStartError(e?.message ?? "Could not start programme.");
    } finally {
      setStarting(false);
    }
  };

  const addToCart = () => {
    cart.addBtb();
    setCartOpen(true);
  };

  const ownedLabel = owns
    ? btbStarted.started
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
          {starting ? "Preparing…" : ownedLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      );
    }
    if (cart.hasBtb) {
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

  return (
    <>
      {/* HERO — image first, editorial text block below (matches site pattern) */}
      <section className="relative">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 pt-6 lg:pt-8">
          <Link to="/programmes" className="eyebrow text-bone/80 hover:text-bone inline-flex items-center gap-2">
            <ArrowLeft className="h-3 w-3" /> All programmes
          </Link>
        </div>
        <div className="mt-6 lg:mt-8">
          <img
            src={basicImg.url}
            alt="Basic Training Blueprint+"
            className="block w-full h-auto max-h-[72vh] object-cover select-none"
            draggable={false}
          />
        </div>

        <div className="bg-background">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12 pt-16 md:pt-24 lg:pt-28 pb-16 md:pb-20 lg:pb-24 grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-8">
              <p className="eyebrow text-signal mb-6">Blueprint · Army physical preparation</p>
              <h1 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.88] text-[clamp(2.75rem,8vw,7rem)]">
                Basic Training<br />Blueprint+
              </h1>
              <p className="font-display font-bold text-bone tracking-[-0.02em] leading-[1] text-[clamp(1.5rem,3vw,2.5rem)] mt-10 max-w-[22ch]">
                Pass assessment. Arrive ready. Leave nothing on the table.
              </p>
              <p className="text-bone/80 text-base md:text-lg mt-8 max-w-[60ch] leading-relaxed">
                A 12-week progressive physical-preparation programme for Regular and Reserve soldier applicants preparing for Assessment Centre and the demands of Basic Training.
              </p>
              <p className="text-foreground-muted text-sm md:text-base mt-4 max-w-[60ch] leading-relaxed">
                Build the lower-body force, upper-body explosive power and 2 km running performance required at assessment — then develop the wider aerobic fitness, carrying ability, bodyweight capacity and durability needed for what comes next.
              </p>
            </div>

            <div className="lg:col-span-4 lg:border-l lg:border-border/60 lg:pl-12 flex flex-col justify-between gap-10">
              <ul className="space-y-4">
                {["12 weeks", "5 sessions per week", "60 progressive sessions", "RPE-led", "Gym + limited-equipment options"].map((d) => (
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

      {/* SECTION 1 — Built for what comes next */}
      <Section eyebrow="Built for what comes next">
        <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[20ch]">
          Passing assessment matters.
        </h2>
        <h3 className="font-display text-foreground-muted tracking-[-0.02em] leading-[1] text-[clamp(1.5rem,3vw,2.5rem)] mt-4 max-w-[24ch]">
          Arriving at training genuinely prepared matters more.
        </h3>
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-6 mt-14 max-w-[80ch] text-bone/85 text-base md:text-lg leading-relaxed">
          <p>Basic Training Blueprint+ has two jobs.</p>
          <p>First, it develops the physical qualities required for the soldier fitness assessment: maximal lower-body force, upper-body explosive power and 2 km running performance.</p>
          <p>Second, it builds a wider foundation of strength, aerobic fitness, running durability, carrying ability, bodyweight capacity and recovery habits for the demands of Basic Training.</p>
          <p>The assessment tests are checkpoints within the programme. They are not the entire purpose of it.</p>
        </div>
      </Section>

      {/* SECTION 2 — Capability over box-ticking */}
      <Section eyebrow="The coaching decision" tone="dark">
        <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[18ch]">
          Capability over box-ticking.
        </h2>
        <div className="grid lg:grid-cols-12 gap-10 mt-12">
          <p className="lg:col-span-7 text-bone/85 text-base md:text-lg leading-relaxed max-w-[62ch]">
            This is not a bodybuilding split, a running-only plan or a weekly military-themed beasting. The programme deliberately develops force, power, endurance, running speed, work capacity and robustness. The published entry requirements matter — but training only to remain at the minimum leaves no margin for fatigue, poor conditions or the physical demands waiting afterwards.
          </p>
          <div className="lg:col-span-5">
            <p className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(1.75rem,3.5vw,2.75rem)]">
              The standard is the floor. Not the destination.
            </p>
          </div>
        </div>
        <p className="text-foreground-muted text-sm md:text-base mt-10 max-w-[70ch]">
          Every session is scaled through effort, current performance and technical quality so each candidate can become as fit, strong and prepared as possible within the twelve-week build.
        </p>
      </Section>

      {/* SECTION 3 — Assessment preparation */}
      <Section eyebrow="Assessment preparation">
        <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[20ch]">
          Know the requirement. Then train beyond it.
        </h2>
        <p className="text-bone/80 text-base md:text-lg mt-8 max-w-[64ch] leading-relaxed">
          The programme develops the three physical qualities currently assessed on the British Army soldier pathway while also building the broader fitness required afterwards.
        </p>
        <ul className="mt-14 divide-y divide-border/60">
          {ASSESSMENT_ITEMS.map((i) => (
            <li key={i.n} className="grid md:grid-cols-12 gap-6 md:gap-10 py-8 md:py-10">
              <span className="md:col-span-1 eyebrow text-signal tabular">{i.n}</span>
              <h3 className="md:col-span-4 font-display font-bold text-bone text-2xl md:text-3xl tracking-[-0.02em] leading-[1.05]">{i.title}</h3>
              <p className="md:col-span-7 text-bone/80 text-base leading-relaxed max-w-[60ch]">{i.body}</p>
            </li>
          ))}
        </ul>
        <p className="text-foreground-muted text-sm md:text-base mt-10 max-w-[68ch] leading-relaxed">
          Role requirements vary. Candidates must always confirm the current standard for their chosen role using official Army information. The programme records the requirement — but trains the candidate to continue progressing beyond it.
        </p>
      </Section>

      {/* SECTION 4 — Five sessions */}
      <Section eyebrow="The weekly system" tone="dark">
        <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[18ch]">
          Five sessions. Every one has a job.
        </h2>
        <p className="text-bone/80 text-base md:text-lg mt-8 max-w-[64ch] leading-relaxed">
          The sessions are completed in order across each seven-day period rather than being permanently tied to Monday through Friday. Rest days can be arranged around work, recovery and personal commitments while preserving the intended training sequence.
        </p>
        <ul className="mt-14 divide-y divide-border/60">
          {SESSIONS.map((s) => (
            <li key={s.n} className="grid md:grid-cols-12 gap-6 md:gap-10 py-7">
              <span className="md:col-span-1 eyebrow text-foreground-muted tabular">{s.n}</span>
              <h3 className="md:col-span-5 font-display font-bold text-bone text-xl md:text-2xl tracking-[-0.02em] leading-snug">{s.title}</h3>
              <p className="md:col-span-6 text-bone/75 text-base leading-relaxed max-w-[60ch]">{s.body}</p>
            </li>
          ))}
        </ul>
        <div className="mt-14 space-y-1 font-display text-bone text-lg tracking-[-0.01em]">
          <p>Five ordered sessions.</p>
          <p>Two rest days.</p>
          <p className="text-foreground-muted">No hidden hero workouts.</p>
        </div>
      </Section>

      {/* SECTION 5 — 12-week build timeline */}
      <Section eyebrow="The 12-week build">
        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <h2 className="lg:col-span-7 font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[16ch]">
            Progressive by design.
          </h2>
          <div className="lg:col-span-5 space-y-1 font-display text-bone text-lg tracking-[-0.01em]">
            <p>Volume develops first.</p>
            <p>Specificity rises later.</p>
            <p className="text-foreground-muted">Fatigue falls before testing.</p>
          </div>
        </div>

        {/* Desktop horizontal timeline */}
        <div className="hidden lg:block mt-16">
          <div className="relative">
            <div className="h-px bg-border/60 w-full absolute top-4 left-0" />
            <div className="grid grid-cols-12 gap-4 relative">
              {WEEKS.map(([n, title, body]) => (
                <div key={n} className="flex flex-col">
                  <span className="h-2 w-2 rounded-full bg-signal mt-3 mb-6" />
                  <span className="eyebrow tabular text-foreground-muted mb-3">Wk {n}</span>
                  <p className="font-display font-bold text-bone text-lg tracking-[-0.02em] leading-tight mb-3">{title}</p>
                  <p className="text-foreground-muted text-[13px] leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile vertical timeline */}
        <ol className="lg:hidden mt-12 border-l border-border/60 pl-6 space-y-8">
          {WEEKS.map(([n, title, body]) => (
            <li key={n} className="relative">
              <span className="absolute -left-[29px] top-1.5 h-2 w-2 rounded-full bg-signal" />
              <p className="eyebrow tabular text-foreground-muted mb-2">Week {n}</p>
              <p className="font-display font-bold text-bone text-xl tracking-[-0.02em]">{title}</p>
              <p className="text-foreground-muted text-sm mt-2 leading-relaxed max-w-[42ch]">{body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-16 grid md:grid-cols-2 gap-x-16 gap-y-3 max-w-[80ch] text-bone/80 text-base leading-relaxed">
          <p>Week 1 establishes the starting point.</p>
          <p>Week 8 retests the key qualities and recalculates training targets.</p>
          <p>Week 11 rehearses assessment performance without unnecessary fatigue.</p>
          <p>Week 12 finishes with the complete final assessment after a taper.</p>
        </div>
      </Section>

      {/* SECTION 6 — Individual progression */}
      <Section eyebrow="Individual progression" tone="dark">
        <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[18ch]">
          Train from reality.
        </h2>
        <h3 className="font-display text-foreground-muted tracking-[-0.02em] leading-[1] text-[clamp(1.5rem,3vw,2.5rem)] mt-4 max-w-[24ch]">
          Your starting point is not your limit.
        </h3>
        <div className="grid lg:grid-cols-12 gap-10 mt-12">
          <div className="lg:col-span-7 space-y-5 text-bone/85 text-base md:text-lg leading-relaxed max-w-[62ch]">
            <p>Basic Training Blueprint+ does not expect every candidate to lift the same weight or run at the same pace.</p>
            <p>Strength training uses RPE, repetitions in reserve and technical quality to select appropriate loads. Running intensity uses effort, current performance and repeatable pacing.</p>
            <p>A candidate beginning with a slower 2 km result is not trained to remain there. They train from that result, retest and progress.</p>
          </div>
          <div className="lg:col-span-5">
            <p className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(1.75rem,3.5vw,2.75rem)]">
              Progression is earned.
            </p>
          </div>
        </div>
        <ul className="mt-12 divide-y divide-border/60 max-w-[80ch]">
          {[
            "Strength loads increase when every prescribed set is completed with stable technique at or below the target RPE.",
            "Running volume or pace increases when efforts remain controlled, relaxed and repeatable.",
            "The lower end of a repetition range is not failure when performance is no longer repeatable.",
            "Poor sleep and unusually heavy legs are managed through sensible reductions — not by abandoning the programme.",
            "The goal is to become as capable as the individual can safely become, not to target the cheapest possible pass.",
          ].map((t) => (
            <li key={t} className="flex items-start gap-4 py-5 text-bone/85 text-base leading-relaxed">
              <span className="h-1 w-1 rounded-full bg-signal mt-2.5 shrink-0" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* SECTION 7 — Who it is for */}
      <Section eyebrow="Who it is for">
        <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[20ch]">
          Built for the candidate who wants more than a pass.
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
          This programme is designed around the British Army soldier pathway. Officer candidates currently complete a different running-specific assessment pathway and may require separate preparation.
        </p>
      </Section>

      {/* SECTION 8 — Beyond assessment */}
      <Section eyebrow="Beyond assessment" tone="dark">
        <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[18ch]">
          Assessment is only the start.
        </h2>
        <div className="grid lg:grid-cols-12 gap-10 mt-12">
          <p className="lg:col-span-7 text-bone/85 text-base md:text-lg leading-relaxed max-w-[62ch]">
            The entry assessment confirms whether a candidate is fit enough to begin. Basic Training demands broader physical capability. That is why Basic Training Blueprint+ also includes loaded walking, carries, step-ups, bodyweight pushing and pulling, lower-leg conditioning, grip development and longer aerobic work — even though every quality is not directly scored at Assessment Centre.
          </p>
          <div className="lg:col-span-5 space-y-2">
            <p className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(1.75rem,3.5vw,2.5rem)]">Pass the test.</p>
            <p className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(1.75rem,3.5vw,2.5rem)]">Build the base.</p>
            <p className="font-display font-bold text-signal tracking-[-0.025em] leading-[0.95] text-[clamp(1.75rem,3.5vw,2.5rem)]">Arrive ready to train.</p>
          </div>
        </div>
      </Section>

      {/* SECTION 9 — Load carriage */}
      <Section eyebrow="Load carriage">
        <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[18ch]">
          Load is introduced. Not thrown at you.
        </h2>
        <div className="grid lg:grid-cols-12 gap-10 mt-12">
          <div className="lg:col-span-7 space-y-5 text-bone/85 text-base md:text-lg leading-relaxed max-w-[62ch]">
            <p>Loaded walking begins during the programme and is introduced progressively rather than used as a weekly punishment.</p>
            <p>The load is capped at approximately 10% of bodyweight or 10 kg, whichever is lower.</p>
            <p>The programme prescribes walking only. There is no loaded running.</p>
            <p>The goal is to improve carrying ability, posture under load and tissue tolerance without creating unnecessary fatigue or avoidable overuse problems.</p>
          </div>
          <div className="lg:col-span-5">
            <p className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(1.75rem,3.5vw,2.75rem)]">
              Fitness protects. Reckless preparation does not.
            </p>
            <p className="text-foreground-muted text-sm mt-8 max-w-[42ch] leading-relaxed">
              The aim is to arrive at Basic Training with a useful foundation, healthy feet and better movement under load. The programme does not attempt to recreate recruit training badly before the candidate has even arrived.
            </p>
          </div>
        </div>
      </Section>

      {/* SECTION 10 — Equipment */}
      <Section eyebrow="Equipment + substitutions" tone="dark">
        <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[18ch]">
          Use the best available tool.
        </h2>
        <div className="mt-14 grid md:grid-cols-3 gap-10">
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
        <div className="mt-14 grid md:grid-cols-2 gap-x-16 gap-y-4 max-w-[80ch] text-bone/80 text-base leading-relaxed">
          <p>A trap-bar deadlift can become a conventional deadlift, kettlebell deadlift or loaded-backpack deadlift.</p>
          <p>Bench pressing can become dumbbell floor pressing or a structured press-up progression.</p>
          <p>Pull-ups can be replaced with assisted pull-ups, pulldowns, inverted rows or controlled hangs.</p>
          <p>Carries and step-ups can be completed using dumbbells, kettlebells, loaded bags, water containers, stairs or a stable bench.</p>
        </div>
        <p className="text-foreground-muted text-sm mt-8 max-w-[68ch]">
          Different equipment is never presented as an official-equivalent assessment score when the testing setup is not the same.
        </p>
      </Section>

      {/* SECTION 11 — Features */}
      <Section eyebrow="More than a PDF">
        <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[18ch]">
          The complete training system.
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

      {/* SECTION 12 — Readiness stages */}
      <Section eyebrow="Readiness beyond the pass mark" tone="dark">
        <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[18ch]">
          Do more than meet the requirement.
        </h2>
        <p className="text-bone/80 text-base md:text-lg mt-8 max-w-[62ch] leading-relaxed">
          The programme separates four different stages of readiness.
        </p>
        <ul className="mt-14 divide-y divide-border/60">
          {READINESS_STAGES.map(([n, title, body]) => (
            <li key={n} className="grid md:grid-cols-12 gap-6 md:gap-10 py-7">
              <span className="md:col-span-1 eyebrow tabular text-signal">{n}</span>
              <h3 className="md:col-span-4 font-display font-bold text-bone text-xl md:text-2xl tracking-[-0.02em]">{title}</h3>
              <p className="md:col-span-7 text-bone/75 text-base leading-relaxed max-w-[60ch]">{body}</p>
            </li>
          ))}
        </ul>
        <p className="text-foreground-muted text-sm md:text-base mt-10 max-w-[68ch] leading-relaxed">
          Passing the fitness test is only the beginning. The aim is to arrive with enough physical capacity to continue learning and training when fatigue begins to accumulate.
        </p>
      </Section>

      {/* SECTION 13 — Independent programme */}
      <Section eyebrow="Independent programme">
        <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,5vw,4.25rem)] max-w-[18ch]">
          No shortcuts. No false promises.
        </h2>
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-5 mt-12 max-w-[80ch] text-bone/80 text-base md:text-lg leading-relaxed">
          <p>Basic Training Blueprint+ is an independent physical-preparation programme produced by SEVEN3SEVEN.</p>
          <p>It is not produced, approved or endorsed by the British Army or the Ministry of Defence.</p>
          <p>It does not guarantee entry, selection, assessment success or completion of Basic Training.</p>
          <p>Candidates must confirm the current requirements for their chosen role using official Army information.</p>
          <p className="md:col-span-2 text-foreground-muted">The programme does not replace medical advice, professional rehabilitation or qualified assessment of an injury.</p>
        </div>
      </Section>

      {/* FINAL PURCHASE */}
      <section className="border-t border-border/60 panel-dark">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-24 lg:py-32 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow text-signal mb-6">Basic Training Blueprint+</p>
            <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.5rem,6vw,5rem)] max-w-[16ch]">
              Pass assessment. Arrive ready. Leave nothing on the table.
            </h2>
            <div className="mt-10 grid md:grid-cols-2 gap-x-10 gap-y-3 max-w-[62ch] text-bone/85 text-base md:text-lg leading-relaxed">
              <p>Twelve weeks.</p>
              <p>Five ordered sessions per week.</p>
              <p>Sixty progressive training sessions.</p>
              <p>One complete system for improving assessment performance and building the physical foundation required for what follows.</p>
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
                <AccordionTrigger className="font-display font-bold text-bone text-lg md:text-xl tracking-[-0.02em] py-6">
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
            {cart.hasBtb ? (
              <div className="flex items-start gap-4">
                <img src={basicImg.url} alt="" className="h-24 w-20 object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="eyebrow text-foreground-muted mb-2">Blueprint</p>
                  <p className="font-display font-bold text-bone text-lg tracking-[-0.02em]">Basic Training Blueprint+</p>
                  <p className="text-foreground-muted text-xs mt-1">12-week interactive programme</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-display text-bone tabular text-xl">£19.99</span>
                    <button
                      type="button"
                      onClick={cart.removeBtb}
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
              <span className="font-display text-bone tabular text-2xl">£{cart.hasBtb ? "19.99" : "0.00"}</span>
            </div>
            {cart.hasBtb ? (
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