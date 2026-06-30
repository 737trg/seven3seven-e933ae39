import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import heroAsset from "@/assets/seven3seven-hero.jpg.asset.json";
import todayShot from "@/assets/athx-today.png.asset.json";
import progShot from "@/assets/athx-programme.png.asset.json";
import progressShot from "@/assets/athx-progress.png.asset.json";
import { PUBLIC_PROGRAMMES, statusLabel } from "@/data/publicProgrammes";

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
      {/* HERO — image-first editorial: cinematic image, then text block below */}
      <section className="relative">
        <img
          src={heroAsset.url}
          alt="SEVEN3SEVEN — Hybrid Fitness | Performance"
          className="block w-full h-auto bg-background select-none"
          draggable={false}
        />
        <div className="bg-background">
          <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-12 pt-16 md:pt-24 lg:pt-28 pb-16 md:pb-24 lg:pb-28">
            <h1 className="font-display font-bold text-bone leading-[0.88] tracking-[-0.03em] text-[clamp(2.75rem,8vw,6rem)] max-w-[12ch]">
              TRAIN FOR<br />WHAT'S NEXT.
            </h1>
            <div className="mt-7 md:mt-9">
              <Link
                to="/programmes"
                className="group inline-flex items-center gap-3 text-bone font-display uppercase text-[12px] tracking-[0.28em] pb-2 border-b border-bone hover:border-signal hover:text-signal transition-colors"
              >
                Explore programmes
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PILLAR STRIP */}
      <section aria-label="Pillars" className="border-y border-border/60 bg-background">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 h-[60px] md:h-[72px] lg:h-[84px] grid grid-cols-3 items-center text-center">
          <span className="font-display uppercase text-[10px] md:text-[11px] tracking-[0.32em] text-bone/75">Strength</span>
          <span className="font-display uppercase text-[10px] md:text-[11px] tracking-[0.32em] text-bone/75">Endurance</span>
          <span className="font-display uppercase text-[10px] md:text-[11px] tracking-[0.32em] text-bone/75">Performance</span>
        </div>
      </section>

      {/* PROPOSITION — split: typography + layered app screens */}
      <section className="border-t border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 lg:py-32 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-6">01 — Approach</p>
            <h2 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.98] text-[clamp(2rem,4.5vw,3.75rem)]">
              Programmes built to be followed.
              <br />
              <span className="text-foreground-muted">Not filed away.</span>
            </h2>
            <p className="text-bone/80 text-base md:text-lg mt-8 max-w-[42ch] leading-[1.55]">
              Guided sessions. Integrated timers. Performance recorded as you train.
            </p>
            <p className="text-foreground-muted text-sm mt-5 max-w-[42ch]">
              Buy once. Follow interactively. Keep the PDF.
            </p>
          </div>

          {/* Layered app screens */}
          <div className="lg:col-span-7 relative">
            <div className="relative aspect-[5/4] w-full panel-dark grain overflow-hidden">
              {/* back card */}
              <div className="absolute right-[6%] top-[8%] w-[46%] aspect-[9/19] rotate-[4deg] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] ring-1 ring-border/60 overflow-hidden bg-black">
                <img src={progressShot.url} alt="ATHX progress" className="w-full h-full object-cover object-top" loading="lazy" />
              </div>
              {/* front card */}
              <div className="absolute left-[8%] bottom-[6%] w-[52%] aspect-[9/19] -rotate-[3deg] shadow-[0_40px_90px_-20px_rgba(0,0,0,0.9)] ring-1 ring-border overflow-hidden bg-black">
                <img src={todayShot.url} alt="ATHX today screen" className="w-full h-full object-cover object-top" loading="lazy" />
              </div>
              <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 scrim-bottom" />
              <p className="absolute bottom-4 right-5 eyebrow text-bone/60">ATHX 2026 — live app</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMMES — actual product cards */}
      <section className="border-t border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-24 lg:pt-32 pb-10 lg:pb-12">
          <div className="grid lg:grid-cols-12 gap-10">
            <p className="eyebrow lg:col-span-2">02 — Programmes</p>
            <h2 className="lg:col-span-10 font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(2rem,5vw,4.25rem)] max-w-[20ch]">
              Built for a clear objective.
            </h2>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pb-24 lg:pb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {PUBLIC_PROGRAMMES.slice(0, 3).map((p) => (
              <ProgrammeCard key={p.slug} programme={p} />
            ))}
          </div>
          <div className="mt-8 flex items-center justify-between">
            <p className="eyebrow text-foreground-muted">First programmes — in development</p>
            <Link to="/programmes" className="eyebrow text-bone inline-flex items-center gap-2 hover:text-signal transition-colors">
              All programmes <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* PRODUCT STORY — know today / record the result */}
      <section className="border-t border-border/60 panel-dark">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 lg:py-32">
          <div className="grid lg:grid-cols-12 gap-10 mb-16">
            <p className="eyebrow lg:col-span-2">03 — Product</p>
            <h2 className="lg:col-span-10 font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(2rem,5vw,4.25rem)] max-w-[18ch]">
              The programme.
              <br />
              <span className="text-foreground-muted">Built to be used.</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            <ProductPanel
              eyebrow="Today"
              title="Know today's work."
              copy="Every session. Every block. Clearly laid out."
              img={todayShot.url}
              alt="ATHX today session interface"
            />
            <ProductPanel
              eyebrow="Logging"
              title="Record the result."
              copy="Track weights, times and scores. Return knowing exactly what you did."
              img={progressShot.url}
              alt="ATHX progress and logging interface"
            />
          </div>

          <div className="mt-10 grid lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8">
              <p className="eyebrow mb-3 text-signal">Keep the PDF</p>
              <p className="font-display text-bone text-2xl md:text-3xl tracking-[-0.02em] max-w-[28ch]">
                The complete programme remains yours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RTB — why */}
      <section className="border-t border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 lg:py-32">
          <div className="grid lg:grid-cols-12 gap-10 mb-14">
            <p className="eyebrow lg:col-span-2">04 — Why</p>
            <h2 className="lg:col-span-10 font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(2rem,5vw,4.25rem)]">
              Why SEVEN3SEVEN?
            </h2>
          </div>
          <ol className="grid md:grid-cols-2 gap-x-16 gap-y-12">
            <Rtb k="Structure" t="No guessing." />
            <Rtb k="Progression" t="Every week has a purpose." />
            <Rtb k="Measurement" t="Track what matters." />
            <Rtb k="Clarity" t="Know exactly what to do." />
            <Rtb k="Ownership" t="Buy once. Keep the programme." />
          </ol>
        </div>
      </section>

      {/* APPAREL TEASER — image panel */}
      <section className="border-t border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 lg:py-32">
          <div className="relative overflow-hidden aspect-[21/9] panel-dark grain">
            <img
              src={heroAsset.url}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover object-[10%_30%] opacity-50 grayscale"
            />
            <div aria-hidden className="absolute inset-0" style={{background:"linear-gradient(90deg, rgba(8,8,8,0.85) 0%, rgba(8,8,8,0.5) 50%, rgba(8,8,8,0.9) 100%)"}} />
            <div className="relative z-10 h-full flex flex-col justify-between p-8 lg:p-14">
              <p className="eyebrow text-bone/70">05 — Apparel · Drop 01 in preparation</p>
              <div className="grid lg:grid-cols-12 items-end gap-6">
                <h2 className="lg:col-span-8 font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(2rem,5vw,4.5rem)] max-w-[14ch]">
                  Built to train.
                  <br />
                  <span className="text-foreground-muted">Designed to live in.</span>
                </h2>
                <div className="lg:col-span-4 lg:text-right">
                  <Link to="/apparel" className="inline-flex items-center gap-3 text-bone font-display uppercase text-[11px] tracking-[0.28em] pb-2 border-b border-bone hover:border-signal hover:text-signal transition-colors">
                    See the campaign <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER / PHILOSOPHY */}
      <section className="border-t border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 lg:py-32 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-5">
            <img
              src={heroAsset.url}
              alt="Nico, founder of SEVEN3SEVEN"
              className="w-full aspect-[4/5] object-cover object-[70%_center]"
              loading="lazy"
            />
          </div>
          <div className="lg:col-span-7">
            <p className="eyebrow mb-6">06 — Philosophy</p>
            <h2 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(2rem,5vw,4.25rem)] max-w-[16ch]">
              Capability over specialisation.
            </h2>
            <p className="text-bone/85 text-base md:text-lg mt-8 max-w-[46ch] leading-[1.55]">
              Strength. Endurance. Conditioning. One complete approach — balanced, measurable, repeatable.
            </p>
            <Link
              to="/about"
              className="mt-10 inline-flex items-center gap-3 text-bone font-display uppercase text-[11px] tracking-[0.28em] pb-2 border-b border-bone hover:border-signal hover:text-signal transition-colors"
            >
              Our approach <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function ProgrammeCard({ programme }: { programme: (typeof PUBLIC_PROGRAMMES)[number] }) {
  return (
    <Link
      to="/programmes/$slug"
      params={{ slug: programme.slug }}
      className="group relative block overflow-hidden aspect-[4/5] panel-dark ring-1 ring-border hover:ring-bone/40 transition-all"
    >
      <img
        src={programme.image}
        alt={programme.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        loading="lazy"
      />
      <div aria-hidden className="absolute inset-0 scrim-bottom" />
      <div className="relative z-10 h-full p-6 lg:p-7 flex flex-col">
        <div className="flex items-start justify-between">
          <p className="eyebrow text-bone/80 tabular">{programme.num}</p>
          <p className="eyebrow text-bone/55">{statusLabel(programme.status)}</p>
        </div>
        <div className="flex-1" />
        <div>
          <p className="eyebrow text-bone/70 mb-3">{programme.collection}</p>
          <h3 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-3xl lg:text-4xl group-hover:text-signal transition-colors">
            {programme.title}
          </h3>
          <p className="text-bone/75 text-sm mt-3 max-w-[28ch]">{programme.shortLine}</p>
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
    <li className="border-t border-border/60 pt-5">
      <p className="eyebrow text-signal mb-3">[ {k} ]</p>
      <p className="font-display text-bone text-2xl md:text-3xl tracking-[-0.025em] leading-[1.05]">{t}</p>
    </li>
  );
}
