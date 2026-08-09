import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import heroAsset from "@/assets/nico-rope.png.asset.json";
import heroWordmark from "@/assets/seven3seven-wordmark.png.asset.json";
import founderAsset from "@/assets/founder-nico.jpg.asset.json";
import todayShot from "@/assets/athx-today.png.asset.json";
import progressShot from "@/assets/athx-progress.png.asset.json";
import { PUBLIC_PROGRAMMES } from "@/data/publicProgrammes";
import { CART_CATALOG, type CartItemSlug } from "@/lib/cart";
import { Reveal } from "@/components/marketing/Reveal";

const price = (slug: CartItemSlug) => `£${(CART_CATALOG[slug].pricePence / 100).toFixed(2)}`;
const FROM_PRICE = `£${(
  Math.min(...Object.values(CART_CATALOG).map((p) => p.pricePence)) / 100
).toFixed(2)}`;
const CLUB_PRICE = "£14.99";

const CLUB_POINTS = [
  "Every programme, current and future",
  "Adaptive coaching and load suggestions",
  "PB trends, strength standards, body metrics",
  "Monthly consistency leaderboard",
];

const ONEOFF_POINTS = [
  "One programme, yours for life",
  "Full interactive app with timers and logging",
  "The permanent PDF you keep",
  "Secure Stripe checkout",
];

const ROUTES: {
  slug: CartItemSlug;
  goal: string;
  title: string;
  line: string;
  weeks: number;
  image: string;
}[] = [
  {
    slug: "basic-training-blueprint-plus",
    goal: "Preparing for military selection",
    title: "Basic Training Blueprint+",
    line: "Running, strength and conditioning built to get you through assessment and basic training.",
    weeks: 12,
    image: PUBLIC_PROGRAMMES[0].image,
  },
  {
    slug: "sem-2026",
    goal: "Competing this season",
    title: "S.E.M 2026",
    line: "Strength, endurance and mixed-modal conditioning for competition preparation.",
    weeks: 8,
    image: PUBLIC_PROGRAMMES[1].image,
  },
  {
    slug: "hybrid-race-plan",
    goal: "Racing hybrid",
    title: "Hybrid Race Plan",
    line: "Run fitness, machine work and station conditioning with pacing you can hold.",
    weeks: 12,
    image: PUBLIC_PROGRAMMES[2].image,
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Do I need a full gym?",
    a: "A standard gym covers everything. Sessions list the equipment used, and running and bodyweight work make up a large part of every programme.",
  },
  {
    q: "What if I've never followed a structured plan?",
    a: "Every session tells you the work, the order, the intent and the pacing. Nothing is left for you to design.",
  },
  {
    q: "Do I keep the programme?",
    a: "Yes. You buy it once — the interactive version stays in your account and the full PDF is yours to download and keep.",
  },
  {
    q: "Can I get a refund?",
    a: "Digital programmes are covered by our refund policy — see the refunds page for the full terms.",
  },
  {
    q: "Club or one-off — which is for me?",
    a: "Buy a programme outright if you have one goal and want the PDF for life. Join the Club at £14.99 a month if you want every programme plus coaching, standards, metrics and the leaderboard.",
  },
];

const SITE = "https://737trg.com";

export const Route = createFileRoute("/_marketing/")({
  head: () => ({
    meta: [
      { title: "SEVEN3SEVEN — Train for what's next" },
      {
        name: "description",
        content:
          "Join the SEVEN3SEVEN Club for £14.99/month and unlock every hybrid training programme, or buy one outright from £19.99 and keep it for life.",
      },
      { property: "og:title", content: "SEVEN3SEVEN — Hybrid Fitness | Performance" },
      {
        property: "og:description",
        content: "Every programme for £14.99/month, or buy one outright. Built to be followed, not filed away.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/` },
      { property: "og:site_name", content: "SEVEN3SEVEN" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "SEVEN3SEVEN",
          url: SITE,
          slogan: "Hybrid Fitness | Performance",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "SEVEN3SEVEN",
          url: SITE,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      {/* HERO — one screen: offer, price, action */}
      <section className="relative min-h-[min(100svh-4rem,42rem)] lg:min-h-[calc(100svh-5rem)] flex items-center overflow-hidden">
        <img
          src={heroAsset.url}
          alt="SEVEN3SEVEN athlete pulling a heavy rope during a hybrid conditioning session"
          className="absolute inset-0 w-full h-full object-cover object-[70%_30%] md:object-[60%_28%] select-none"
          draggable={false}
          fetchPriority="high"
          decoding="async"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(9,9,9,0.66) 0%, rgba(9,9,9,0.42) 28%, rgba(9,9,9,0.58) 58%, rgba(9,9,9,0.9) 86%, rgba(9,9,9,1) 100%)",
          }}
        />
        <div className="relative z-10 w-full max-w-[1600px] mx-auto container-x py-20 md:py-24 flex flex-col items-center text-center">
          <img
            src={heroWordmark.url}
            alt="SEVEN3SEVEN — Hybrid Fitness | Performance"
            className="block w-[190px] md:w-[240px] lg:w-[268px] h-auto opacity-95 select-none hero-rise"
            draggable={false}
          />
          <p className="mt-6 md:mt-7 eyebrow text-bone/70 hero-rise [animation-delay:100ms]">
            Hybrid fitness · performance programmes
          </p>
          <h1 className="mt-3 md:mt-4 display-xl text-bone max-w-[15ch] hero-rise [animation-delay:160ms]">
            Train like it matters.
          </h1>
          <p className="mt-5 lede max-w-[52ch] mx-auto hero-rise [animation-delay:220ms]">
            Structured 8–12 week programmes for military preparation, competition and hybrid
            racing. Join the Club for {CLUB_PRICE} a month and get everything, or buy one
            programme outright and keep it for life.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full hero-rise [animation-delay:280ms]">
            <Link to="/pricing" className="btn-signal press tap w-full sm:w-auto text-center justify-center">
              Join the Club — {CLUB_PRICE}/mo
              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            </Link>
            <Link to="/programmes" className="btn-ghost press tap w-full sm:w-auto text-center justify-center">
              Buy a programme — from {FROM_PRICE}
            </Link>
          </div>
          <p className="mt-5 eyebrow text-bone/60 hero-rise [animation-delay:340ms]">
            Cancel anytime · Lifetime access on one-off plans · Secure Stripe checkout
          </p>
        </div>
      </section>

      {/* TWO DOORS — make the decision in the first two screens */}
      <section aria-label="Ways to train" className="border-y border-border/60 bg-background">
        <div className="max-w-[1440px] mx-auto container-x py-12 lg:py-16 grid gap-4 md:gap-5 md:grid-cols-2">
          <DoorCard
            eyebrow="SEVEN3SEVEN Club"
            price={CLUB_PRICE}
            unit="/ month"
            line="Everything we build, while you're a member."
            points={CLUB_POINTS}
            cta="Join the Club"
            to="/pricing"
            primary
          />
          <DoorCard
            eyebrow="One-off programme"
            price={FROM_PRICE}
            unit="once"
            line="Buy a plan outright and own it forever."
            points={ONEOFF_POINTS}
            cta="Browse programmes"
            to="/programmes"
          />
        </div>
      </section>

      {/* CHOOSE — self-selection by goal */}
      <section id="choose" className="scroll-mt-24 border-b border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-20 lg:pt-28 pb-6">
          <Reveal>
            <p className="eyebrow">01 — Choose</p>
            <h2 className="mt-5 font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(2rem,5vw,4rem)] max-w-[18ch]">
              What are you training for?
            </h2>
          </Reveal>
        </div>
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pb-20 lg:pb-28">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {ROUTES.map((r, i) => (
              <Reveal key={r.slug} delay={i * 90}>
                <GoalCard route={r} />
              </Reveal>
            ))}
          </div>
          <div className="mt-7 flex items-center justify-between gap-4">
            <p className="eyebrow text-foreground-muted">All three included with Club membership.</p>
            <Link to="/programmes" className="eyebrow text-bone inline-flex items-center gap-2 hover:text-signal transition-colors">
              All programmes <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="panel-dark border-b border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-20 lg:py-28">
          <Reveal>
            <div className="grid lg:grid-cols-12 gap-8 items-end mb-14">
              <div className="lg:col-span-7">
                <p className="eyebrow">02 — What you get</p>
                <h2 className="mt-5 font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(2rem,5vw,4rem)] max-w-[16ch]">
                  Built to be followed.
                  <br />
                  <span className="text-foreground-muted">Not filed away.</span>
                </h2>
              </div>
              <p className="lg:col-span-5 text-bone/80 text-base md:text-lg max-w-[42ch] leading-[1.55]">
                Every session is laid out, timed and logged. You open the app and train — no
                interpreting a spreadsheet at the rack.
              </p>
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            <Reveal>
              <ProductPanel
                eyebrow="Guided sessions"
                title="Know today's work."
                copy="Every block, in order, with the intent and pacing written out."
                img={todayShot.url}
                alt="Session overview showing today's training blocks"
              />
            </Reveal>
            <Reveal delay={110}>
              <ProductPanel
                eyebrow="Logging & timers"
                title="Record the result."
                copy="Live interval, AMRAP and rest timers. Weights, times and scores saved to your account."
                img={progressShot.url}
                alt="Progress screen showing logged lifts and completion"
              />
            </Reveal>
          </div>

          <Reveal>
            <div className="mt-8 grid sm:grid-cols-2 gap-x-12 gap-y-8">
              <Rtb k="The full PDF" t="Yours to download and keep, forever." />
              <Rtb k="Progress that carries" t="Streaks, personal bests and week-by-week history." />
            </div>
          </Reveal>

          <Reveal>
            <div className="mt-14 ring-1 ring-signal/50 bg-[#0d0d0d] p-7 lg:p-9">
              <p className="eyebrow text-signal">Club only</p>
              <h3 className="mt-4 font-display font-bold text-bone tracking-[-0.025em] leading-[0.98] text-[clamp(1.75rem,4vw,2.75rem)] max-w-[20ch]">
                A coach's layer on top of the plan.
              </h3>
              <div className="mt-7 grid sm:grid-cols-3 gap-x-10 gap-y-6">
                <Rtb k="Adaptive coaching" t="A readiness check that scales the day's load." />
                <Rtb k="Standards" t="Your bests scored against real reference targets." />
                <Rtb k="Leaderboard" t="Monthly consistency, ranked on sessions you actually did." />
              </div>
              <Link to="/pricing" className="btn-signal press tap mt-9 w-full sm:w-auto text-center">
                See what Club includes <ArrowRight className="h-3.5 w-3.5 shrink-0" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOUNDER / PHILOSOPHY */}
      <section className="border-b border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-20 lg:py-28 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <Reveal className="lg:col-span-5">
            <img
              src={founderAsset.url}
              alt="Nico, founder of SEVEN3SEVEN, between sets in the gym"
              className="w-full aspect-[4/5] object-cover object-center"
              loading="lazy"
            />
          </Reveal>
          <Reveal delay={100} className="lg:col-span-7">
            <p className="eyebrow">03 — Who writes it</p>
            <h2 className="mt-5 font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(2rem,5vw,4rem)] max-w-[16ch]">
              Capability over specialisation.
            </h2>
            <p className="text-bone/85 text-base md:text-lg mt-7 max-w-[46ch] leading-[1.55]">
              Strength, endurance and conditioning written into one balanced, measurable,
              repeatable approach — the same programming used to prepare for selection,
              competition and racing.
            </p>
            <Link
              to="/about"
              className="mt-9 inline-flex items-center gap-3 text-bone font-display uppercase text-[11px] tracking-[0.28em] pb-2 border-b border-bone hover:border-signal hover:text-signal transition-colors"
            >
              Our approach <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-20 lg:py-28 grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="eyebrow">04 — Before you buy</p>
            <h2 className="mt-5 font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(1.75rem,4vw,3rem)] max-w-[14ch]">
              Straight answers.
            </h2>
          </div>
          <dl className="lg:col-span-8 grid sm:grid-cols-2 gap-x-12 gap-y-10">
            {FAQS.map((f, i) => (
              <Reveal key={f.q} delay={i * 70}>
                <dt className="font-display text-bone text-lg md:text-xl tracking-[-0.02em]">{f.q}</dt>
                <dd className="text-foreground-muted text-sm mt-3 leading-relaxed max-w-[42ch]">{f.a}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section>
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-20 lg:py-28 text-center">
          <p className="eyebrow text-signal">Start this week</p>
          <h2 className="mt-5 font-display font-bold text-bone tracking-[-0.03em] leading-[0.92] text-[clamp(2.25rem,6vw,4.5rem)] max-w-[16ch] mx-auto">
            Stop guessing.<br />Start training.
          </h2>
          <p className="mt-6 text-foreground-muted text-sm md:text-base max-w-[46ch] mx-auto">
            {CLUB_PRICE} a month for everything, or {FROM_PRICE} once for a single programme you
            keep for life. Secure checkout by Stripe.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link to="/pricing" className="btn-signal press tap w-full sm:w-auto text-center">
              Join the Club <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            </Link>
            <Link to="/programmes" className="btn-ghost press tap w-full sm:w-auto text-center">
              Buy a programme
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function DoorCard({
  eyebrow,
  price: amount,
  unit,
  line,
  points,
  cta,
  to,
  primary,
}: {
  eyebrow: string;
  price: string;
  unit: string;
  line: string;
  points: readonly string[];
  cta: string;
  to: "/pricing" | "/programmes";
  primary?: boolean;
}) {
  return (
    <div
      className={`p-6 md:p-8 flex flex-col ring-1 ${
        primary ? "ring-signal/60 bg-[#0d0d0d]" : "ring-border bg-background"
      }`}
    >
      <p className={`eyebrow ${primary ? "text-signal" : "text-foreground-muted"}`}>{eyebrow}</p>
      <p className="mt-3 font-display font-bold text-bone tracking-[-0.025em] text-[clamp(2rem,7vw,3rem)] leading-none">
        {amount}
        <span className="ml-2 text-foreground-muted text-sm font-normal tracking-normal">{unit}</span>
      </p>
      <p className="mt-3 text-foreground-muted text-sm">{line}</p>
      <ul className="mt-6 space-y-3 flex-1">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2.5 min-w-0">
            <Check
              className={`h-3.5 w-3.5 shrink-0 mt-[3px] ${primary ? "text-signal" : "text-foreground-muted"}`}
              strokeWidth={2.5}
            />
            <span className="min-w-0 text-bone/85 text-sm leading-[1.5]">{p}</span>
          </li>
        ))}
      </ul>
      <Link
        to={to}
        className={`${primary ? "btn-signal" : "btn-ghost"} press tap mt-7 w-full text-center`}
      >
        {cta} <ArrowRight className="h-3.5 w-3.5 shrink-0" />
      </Link>
    </div>
  );
}

function GoalCard({ route }: { route: (typeof ROUTES)[number] }) {
  return (
    <Link
      to="/programmes/$slug"
      params={{ slug: route.slug }}
      className="group relative block overflow-hidden aspect-[4/5] panel-dark ring-1 ring-border hover:ring-bone/40 transition-all"
    >
      <img
        src={route.image}
        alt={`${route.title} — ${route.goal}`}
        className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-[1.04]"
        loading="lazy"
      />
      <div aria-hidden className="absolute inset-0 scrim-bottom" />
      <div className="relative z-10 h-full p-6 lg:p-7 flex flex-col">
        <p className="eyebrow text-bone/85">{route.goal}</p>
        <div className="flex-1" />
        <div>
          <h3 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-2xl lg:text-3xl group-hover:text-signal transition-colors">
            {route.title}
          </h3>
          <p className="text-bone/75 text-sm mt-3 max-w-[30ch]">{route.line}</p>
          <div className="mt-5 pt-4 border-t border-bone/20 flex items-center justify-between">
            <span className="font-display text-bone text-lg tabular">{price(route.slug)}</span>
            <span className="eyebrow text-bone/70">{route.weeks} weeks</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ProductPanel({ eyebrow, title, copy, img, alt }: { eyebrow: string; title: string; copy: string; img: string; alt: string }) {
  return (
    <article className="relative overflow-hidden ring-1 ring-border bg-[#0a0a0a]">
      <div className="p-7 lg:p-9 pb-0">
        <p className="eyebrow text-signal mb-4">{eyebrow}</p>
        <h3 className="font-display font-bold text-bone tracking-[-0.025em] text-3xl lg:text-4xl leading-[0.95]">{title}</h3>
        <p className="text-foreground-muted text-sm mt-3 max-w-[36ch]">{copy}</p>
      </div>
      <div className="relative mt-8 mx-7 lg:mx-9 aspect-[5/4] overflow-hidden ring-1 ring-border bg-black">
        <img src={img} alt={alt} className="absolute inset-0 w-full h-full object-cover object-top" loading="lazy" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-16 scrim-bottom" />
      </div>
      <div className="h-7 lg:h-9" />
    </article>
  );
}

function Rtb({ k, t }: { k: string; t: string }) {
  return (
    <div className="border-t border-border/60 pt-5">
      <p className="eyebrow text-signal mb-3">[ {k} ]</p>
      <p className="font-display text-bone text-xl md:text-2xl tracking-[-0.025em] leading-[1.15]">{t}</p>
    </div>
  );
}
