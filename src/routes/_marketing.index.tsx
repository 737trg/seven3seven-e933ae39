import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShoppingBag, LineChart, FileText, RotateCw, Check } from "lucide-react";

const SITE = "https://seven3seven.lovable.app";

export const Route = createFileRoute("/_marketing/")({
  head: () => ({
    meta: [
      { title: "SEVEN3SEVEN — Train for what's next" },
      {
        name: "description",
        content:
          "Premium hybrid fitness programmes built to develop strength, endurance and the ability to perform when it counts. Buy once. Follow interactively. Keep the PDF.",
      },
      { property: "og:title", content: "SEVEN3SEVEN — Hybrid Fitness | Performance" },
      {
        property: "og:description",
        content: "Structured hybrid programmes. Built to be followed, not filed away.",
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
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="absolute inset-0 z-0 grain"
          style={{
            background:
              "radial-gradient(ellipse at 75% 25%, rgba(216,41,50,0.18), transparent 55%), radial-gradient(ellipse at 5% 95%, rgba(255,255,255,0.04), transparent 50%), linear-gradient(180deg, #080808 0%, #0c0c0c 100%)",
          }}
        />
        <div className="relative z-10 max-w-[1280px] mx-auto px-5 lg:px-10 pt-20 pb-24 lg:pt-32 lg:pb-32 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow mb-6 text-signal">Hybrid Fitness · Performance</p>
            <h1 className="font-display font-bold text-bone leading-[0.92] tracking-tight text-[clamp(3rem,9vw,7.5rem)]">
              TRAIN FOR
              <br />
              WHAT'S NEXT.
            </h1>
            <p className="text-foreground-muted text-lg md:text-xl mt-8 max-w-[52ch] leading-relaxed">
              Structured hybrid programmes built to develop strength, endurance and the ability to perform when it counts.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                to="/programmes"
                className="inline-flex items-center gap-2 h-12 px-6 bg-signal text-bone font-display uppercase text-xs tracking-[0.18em] hover:bg-signal/90 transition-colors rounded-[2px]"
              >
                Explore programmes <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 h-12 px-6 border border-border text-bone font-display uppercase text-xs tracking-[0.18em] hover:border-bone transition-colors rounded-[2px]"
              >
                How it works
              </a>
            </div>
            <p className="mt-8 eyebrow flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Buy once</span>
              <span className="text-signal">·</span>
              <span>Follow interactively</span>
              <span className="text-signal">·</span>
              <span>Keep the PDF</span>
            </p>
          </div>
        </div>
      </section>

      {/* VALUE */}
      <section id="how-it-works" className="border-b border-border">
        <div className="max-w-[1280px] mx-auto px-5 lg:px-10 py-20 lg:py-28 grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5">
            <h2 className="font-display font-bold text-bone leading-[1] tracking-tight text-3xl md:text-5xl">
              PROGRAMMES BUILT TO BE FOLLOWED.
              <br />
              <span className="text-foreground-muted">NOT FILED AWAY.</span>
            </h2>
            <div className="mt-6 space-y-4 text-foreground-muted text-sm leading-relaxed max-w-[44ch]">
              <p>
                Most training programmes are downloaded, skimmed and eventually forgotten.
              </p>
              <p>
                SEVEN3SEVEN programmes are delivered through a focused interactive experience that guides each session, runs the relevant timers, records performance and shows what was completed previously.
              </p>
              <p>Every programme will also include a permanent downloadable PDF.</p>
            </div>
          </div>
          <div className="lg:col-span-7 grid sm:grid-cols-3 gap-5">
            <Principle
              icon={<ShoppingBag className="h-5 w-5" strokeWidth={1.5} />}
              title="Buy once"
              body="No compulsory subscription. No hidden costs."
            />
            <Principle
              icon={<LineChart className="h-5 w-5" strokeWidth={1.5} />}
              title="Train interactively"
              body="Follow each session, use the timers and record performance."
            />
            <Principle
              icon={<FileText className="h-5 w-5" strokeWidth={1.5} />}
              title="Keep it"
              body="Retain the PDF and complete programme history."
            />
          </div>
        </div>
      </section>

      {/* COLLECTIONS */}
      <section className="border-b border-border">
        <div className="max-w-[1280px] mx-auto px-5 lg:px-10 py-20 lg:py-28">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
            <h2 className="font-display font-bold text-bone text-3xl md:text-5xl tracking-tight">
              BUILT FOR A CLEAR OBJECTIVE.
            </h2>
            <Link to="/programmes" className="eyebrow text-signal inline-flex items-center gap-2">
              View all programmes <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            <Collection
              tag="Compete"
              title="Event-focused"
              copy="Preparation built around a specific performance target."
            />
            <Collection
              tag="Build"
              title="Structured progress"
              copy="Strength, endurance and hybrid development."
            />
            <Collection
              tag="Blueprint"
              title="Foundations"
              copy="Accessible foundations and return-to-training programmes."
            />
          </div>
          <p className="eyebrow mt-10 text-signal">Programmes coming soon</p>
        </div>
      </section>

      {/* INTERACTIVE */}
      <section className="border-b border-border">
        <div className="max-w-[1280px] mx-auto px-5 lg:px-10 py-20 lg:py-28 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-4">The application</p>
            <h2 className="font-display font-bold text-bone text-3xl md:text-5xl tracking-tight leading-[1]">
              YOUR PROGRAMME.
              <br />
              <span className="text-foreground-muted">READY WHEN YOU ARE.</span>
            </h2>
            <ul className="mt-8 space-y-3">
              {[
                "Session-by-session guidance",
                "Built-in workout timers",
                "Weight and score tracking",
                "Previous-result comparison",
                "Plain-English notes",
                "Downloadable PDF included",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-bone text-sm">
                  <Check className="h-4 w-4 text-signal mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-7">
            <InterfaceMockup />
          </div>
        </div>
      </section>

      {/* APPAREL */}
      <section className="border-b border-border">
        <div className="max-w-[1280px] mx-auto px-5 lg:px-10 py-20 lg:py-28">
          <div className="border border-border rounded-[2px] overflow-hidden grid md:grid-cols-2">
            <div className="p-10 lg:p-14">
              <p className="eyebrow mb-4 text-signal">First drop coming soon</p>
              <h2 className="font-display font-bold text-bone text-3xl md:text-5xl tracking-tight leading-[1]">
                SEVEN3SEVEN APPAREL
              </h2>
              <p className="text-foreground-muted text-sm mt-5 max-w-[42ch] leading-relaxed">
                Designed for training. Built to exist outside the gym.
              </p>
              <Link
                to="/apparel"
                className="mt-8 inline-flex items-center gap-2 eyebrow text-signal"
              >
                Read more <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div
              aria-hidden
              className="min-h-[260px] grain"
              style={{
                background:
                  "radial-gradient(ellipse at 60% 50%, rgba(255,255,255,0.06), transparent 60%), linear-gradient(135deg, #0e0e0e 0%, #161616 100%)",
              }}
            />
          </div>
        </div>
      </section>

      {/* ABOUT TEASER */}
      <section>
        <div className="max-w-[1280px] mx-auto px-5 lg:px-10 py-20 lg:py-28 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow mb-4">About SEVEN3SEVEN</p>
            <h2 className="font-display font-bold text-bone text-3xl md:text-5xl tracking-tight leading-[1]">
              CAPABILITY OVER SPECIALISATION.
            </h2>
            <p className="text-foreground-muted text-sm mt-5 max-w-[60ch] leading-relaxed">
              SEVEN3SEVEN blends strength, endurance and conditioning into one complete approach. Balanced. Measurable. Repeatable.
            </p>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <Link
              to="/about"
              className="inline-flex items-center gap-2 h-12 px-6 border border-border text-bone font-display uppercase text-xs tracking-[0.18em] hover:border-bone transition-colors rounded-[2px]"
            >
              Our story <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* EARLY ACCESS — INERT */}
      <section className="border-t border-border">
        <div className="max-w-[1280px] mx-auto px-5 lg:px-10 py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="eyebrow mb-2">Train with purpose.</p>
            <p className="text-foreground-muted text-sm max-w-[52ch]">
              An early-access list will open when the first programmes launch.
            </p>
          </div>
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="inline-flex items-center gap-2 h-12 px-6 border border-border text-foreground-muted font-display uppercase text-xs tracking-[0.18em] cursor-not-allowed rounded-[2px]"
            title="Email signup is not yet active"
          >
            Early access coming soon
          </button>
        </div>
      </section>
    </>
  );
}

function Principle({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="border border-border p-6 bg-surface/30 rounded-[2px]">
      <div className="text-signal mb-4">{icon}</div>
      <p className="font-display text-bone uppercase tracking-[0.12em] text-sm">{title}</p>
      <p className="text-foreground-muted text-xs mt-2 leading-relaxed">{body}</p>
    </div>
  );
}

function Collection({ tag, title, copy }: { tag: string; title: string; copy: string }) {
  return (
    <article className="border border-border bg-surface/30 p-6 lg:p-8 flex flex-col gap-4 min-h-[260px] rounded-[2px]">
      <p className="eyebrow text-signal">{tag}</p>
      <h3 className="font-display font-bold text-bone text-2xl tracking-tight">{title}</h3>
      <p className="text-foreground-muted text-sm leading-relaxed">{copy}</p>
      <p className="eyebrow mt-auto">Coming soon</p>
    </article>
  );
}

function InterfaceMockup() {
  return (
    <div className="relative border border-border bg-surface/40 rounded-[4px] p-6 lg:p-8" aria-label="Interactive programme experience illustration">
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-1 border border-border bg-background p-4 rounded-[2px]">
          <p className="eyebrow mb-3">Today</p>
          <p className="font-display text-bone text-xs uppercase tracking-wider">Strength + Engine</p>
          <p className="text-foreground-muted text-[10px] mt-1">60 min</p>
          <div className="mt-5 tabular font-display text-bone text-3xl">02:30</div>
          <p className="eyebrow mt-1">Block timer</p>
        </div>
        <div className="col-span-2 border border-border bg-background p-4 rounded-[2px]">
          <p className="eyebrow mb-3">Session blocks</p>
          <ul className="space-y-2 text-xs text-bone">
            {["Warm-up", "Back squat", "Bench press", "Ski Erg", "Core finisher", "Cool-down"].map((b, i) => (
              <li key={b} className="flex items-center gap-3 border-b border-border last:border-0 pb-2">
                <span className="text-foreground-muted tabular w-5">{String(i + 1).padStart(2, "0")}</span>
                <span>{b}</span>
                {i < 2 && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-signal" />}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="eyebrow mt-6 text-foreground-muted/70">Illustrative — does not display real athlete data.</p>
    </div>
  );
}
