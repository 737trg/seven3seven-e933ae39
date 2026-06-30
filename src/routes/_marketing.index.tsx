import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import heroAsset from "@/assets/seven3seven-hero.jpg.asset.json";

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
      {/* HERO — cinematic, image-led */}
      <section className="relative overflow-hidden">
        <div className="relative w-full h-[88svh] min-h-[560px] max-h-[920px]">
          <img
            src={heroAsset.url}
            alt="SEVEN3SEVEN — Hybrid Fitness | Performance"
            className="absolute inset-0 w-full h-full object-cover object-[72%_center] md:object-[center]"
            draggable={false}
          />
          {/* readability scrim — left-weighted, very subtle */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(7,7,7,0.85) 0%, rgba(7,7,7,0.55) 32%, rgba(7,7,7,0.15) 55%, rgba(7,7,7,0) 75%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-40"
            style={{
              background: "linear-gradient(180deg, rgba(7,7,7,0) 0%, rgba(7,7,7,0.9) 100%)",
            }}
          />

          <div className="relative z-10 h-full max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col">
            <div className="flex-1" />
            <div className="pb-14 lg:pb-20 max-w-[36ch]">
              <p className="eyebrow text-bone/70 mb-5">Hybrid Fitness · Performance</p>
              <h1 className="font-display font-bold text-bone leading-[0.88] tracking-[-0.025em] text-[clamp(3rem,10vw,8rem)]">
                TRAIN FOR
                <br />
                WHAT'S NEXT.
              </h1>
            </div>
            <div className="pb-10 lg:pb-14 flex items-end justify-between gap-6">
              <Link
                to="/programmes"
                className="group inline-flex items-center gap-3 text-bone font-display uppercase text-[11px] tracking-[0.28em] pb-2 border-b border-bone/40 hover:border-bone transition-colors"
              >
                Explore programmes
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
              <p className="hidden md:block text-bone/50 font-display uppercase text-[10px] tracking-[0.28em] text-right">
                Strength · Endurance · Performance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MANIFESTO — typography only, no boxes */}
      <section className="border-t border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-28 lg:py-40">
          <div className="grid lg:grid-cols-12 gap-10">
            <p className="eyebrow lg:col-span-2">01 — Approach</p>
            <h2 className="lg:col-span-10 font-display font-bold text-bone tracking-[-0.025em] leading-[0.98] text-[clamp(2.25rem,5.5vw,4.75rem)] max-w-[18ch]">
              Programmes built to be followed.
              <span className="text-foreground-muted"> Not filed away.</span>
            </h2>
          </div>
          <div className="mt-16 lg:mt-24 grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-6 lg:col-start-3">
              <p className="text-bone text-lg md:text-xl leading-[1.5] max-w-[52ch]">
                Most training programmes are downloaded, skimmed and forgotten.
                Ours are delivered through a focused interactive experience —
                guided sessions, integrated timers, performance recorded as you train.
              </p>
              <p className="text-foreground-muted text-sm mt-8 max-w-[44ch]">
                Buy once. Follow interactively. Keep the PDF.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* COLLECTIONS — editorial list, not cards */}
      <section className="border-t border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 lg:py-32">
          <div className="grid lg:grid-cols-12 gap-10 mb-16">
            <p className="eyebrow lg:col-span-2">02 — Collections</p>
            <h2 className="lg:col-span-10 font-display font-bold text-bone tracking-[-0.025em] leading-[0.98] text-[clamp(2.25rem,5.5vw,4.75rem)]">
              Built for a clear objective.
            </h2>
          </div>

          <div className="border-t border-border/60">
            <CollectionRow num="01" title="Compete" tagline="Event-focused preparation." />
            <CollectionRow num="02" title="Build" tagline="Strength, endurance and hybrid development." />
            <CollectionRow num="03" title="Blueprint" tagline="Foundations and return-to-training." />
          </div>

          <div className="mt-10 flex items-center justify-between">
            <p className="eyebrow text-foreground-muted">First programmes — releasing soon</p>
            <Link to="/programmes" className="eyebrow text-bone inline-flex items-center gap-2 hover:text-signal transition-colors">
              All programmes <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* APPAREL */}
      <section className="border-t border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 lg:py-32 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-2">
            <p className="eyebrow">03 — Apparel</p>
          </div>
          <div className="lg:col-span-7">
            <h2 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.98] text-[clamp(2.25rem,5.5vw,4.75rem)]">
              Designed for training.
              <br />
              <span className="text-foreground-muted">Built to live in.</span>
            </h2>
          </div>
          <div className="lg:col-span-3 lg:text-right">
            <Link to="/apparel" className="eyebrow text-bone inline-flex items-center gap-2 hover:text-signal transition-colors">
              First drop — soon <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY / ABOUT */}
      <section className="border-t border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 lg:py-32 grid lg:grid-cols-12 gap-10">
          <p className="eyebrow lg:col-span-2">04 — Philosophy</p>
          <div className="lg:col-span-10">
            <h2 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.98] text-[clamp(2.25rem,5.5vw,4.75rem)] max-w-[20ch]">
              Capability over specialisation.
            </h2>
            <p className="text-foreground-muted text-base md:text-lg mt-10 max-w-[52ch] leading-relaxed">
              Strength. Endurance. Conditioning. One complete approach — balanced, measurable, repeatable.
            </p>
            <Link
              to="/about"
              className="mt-10 inline-flex items-center gap-3 text-bone font-display uppercase text-[11px] tracking-[0.28em] pb-2 border-b border-bone/40 hover:border-bone transition-colors"
            >
              Our approach <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function CollectionRow({ num, title, tagline }: { num: string; title: string; tagline: string }) {
  return (
    <div className="grid grid-cols-12 gap-4 lg:gap-10 items-baseline border-b border-border/60 py-8 lg:py-10 group">
      <span className="col-span-2 lg:col-span-1 eyebrow text-foreground-muted tabular">{num}</span>
      <h3 className="col-span-10 lg:col-span-4 font-display font-bold text-bone tracking-[-0.02em] text-3xl md:text-5xl lg:text-6xl group-hover:text-signal transition-colors">
        {title}
      </h3>
      <p className="col-start-3 lg:col-start-auto col-span-10 lg:col-span-5 text-foreground-muted text-sm md:text-base lg:text-lg max-w-[42ch]">
        {tagline}
      </p>
      <span className="hidden lg:block col-span-2 eyebrow text-right text-foreground-muted">Coming soon</span>
    </div>
  );
}
